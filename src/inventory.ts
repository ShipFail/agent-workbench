import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { InventoryData, ToolRecord, MemoryLevel, ToolMetadata } from './types';

export interface InventoryOptions {
  filePath: string;
}

export class Inventory {
  private filePath: string;
  private data: InventoryData | null = null;
  private loadingPromise: Promise<void> | null = null;

  constructor(options: InventoryOptions) {
    this.filePath = path.resolve(options.filePath);
  }

  private async ensureLoaded(): Promise<void> {
    if (this.data) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        const content = await fs.readFile(this.filePath, 'utf8');
        this.data = JSON.parse(content) as InventoryData;
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          // Initialize new inventory
          const now = new Date().toISOString();
          this.data = {
            tools: [],
            version: 1,
            createdAt: now,
            updatedAt: now,
          };
          await this.persist();
        } else {
          throw err;
        }
      }
    })();

    await this.loadingPromise;
    this.loadingPromise = null;
  }

  private async persist(): Promise<void> {
    if (!this.data) return;
    this.data.updatedAt = new Date().toISOString();
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  private static generateId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  public async list(): Promise<ToolRecord[]> {
    await this.ensureLoaded();
    return this.data!.tools;
  }

  public async get(id: string): Promise<ToolRecord | undefined> {
    await this.ensureLoaded();
    return this.data!.tools.find(t => t.id === id);
  }

  public async craftTool(params: {
    name: string;
    description?: string;
    code?: string;
    metadata?: ToolMetadata;
  }): Promise<ToolRecord> {
    await this.ensureLoaded();
    const now = new Date().toISOString();
    const tool: ToolRecord = {
      id: Inventory.generateId(),
      name: params.name,
      description: params.description,
      code: params.code,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      memoryLevel: 'short_term',
      metadata: params.metadata,
    };
    this.data!.tools.push(tool);
    await this.persist();
    return tool;
  }

  public async deleteTool(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const before = this.data!.tools.length;
    this.data!.tools = this.data!.tools.filter(t => t.id !== id);
    const changed = this.data!.tools.length !== before;
    if (changed) await this.persist();
    return changed;
  }

  public async touchToolUsage(id: string): Promise<ToolRecord | undefined> {
    await this.ensureLoaded();
    const tool = this.data!.tools.find(t => t.id === id);
    if (!tool) return undefined;
    tool.usageCount += 1;
    tool.lastUsedAt = new Date().toISOString();
    // Simple promotion logic for MVP
    if (tool.memoryLevel === 'short_term' && tool.usageCount >= 5) {
      tool.memoryLevel = 'medium_term';
    } else if (tool.memoryLevel === 'medium_term' && tool.usageCount >= 25) {
      tool.memoryLevel = 'long_term';
    }
    tool.updatedAt = new Date().toISOString();
    await this.persist();
    return tool;
  }

  public async updateMemoryLevel(id: string, level: MemoryLevel): Promise<ToolRecord | undefined> {
    await this.ensureLoaded();
    const tool = this.data!.tools.find(t => t.id === id);
    if (!tool) return undefined;
    tool.memoryLevel = level;
    tool.updatedAt = new Date().toISOString();
    await this.persist();
    return tool;
  }

  public async search(query: string, opts?: { limit?: number }): Promise<ToolRecord[]> {
    await this.ensureLoaded();
    const q = query.toLowerCase();
    const scored = this.data!.tools.map(tool => {
      const haystack = [
        tool.name,
        tool.description ?? '',
        ...(tool.metadata?.tags ?? []),
        tool.metadata?.problem ?? '',
      ]
        .join(' ')
        .toLowerCase();

      let score = 0;
      if (haystack.includes(q)) {
        score += 2;
      }
      // Basic partial matching by words
      const parts = q.split(/\s+/);
      for (const part of parts) {
        if (part && haystack.includes(part)) {
          score += 1;
        }
      }
      // Slight bonus for higher memory levels
      if (tool.memoryLevel === 'medium_term') score += 0.3;
      if (tool.memoryLevel === 'long_term') score += 0.6;
      return { tool, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const limit = opts?.limit ?? 10;
    return scored.filter(s => s.score > 0).slice(0, limit).map(s => s.tool);
  }
}
