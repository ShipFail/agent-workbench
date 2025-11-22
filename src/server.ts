import http from 'http';
import { Inventory } from './inventory';
import {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
  JsonRpcSuccess,
  McpToolDescription,
} from './types';

export interface ServerOptions {
  port: number;
  inventoryPath: string;
}

/**
 * AWB MCP server.
 *
 * Implements minimal MCP JSON-RPC endpoints:
 *   - tools/list
 *   - tools/call
 *
 * And exposes AWB domain tools:
 *   - awb_craftTool
 *   - awb_callTool (stub for now)
 *   - awb_deleteTool
 *   - awb_listTools
 *   - awb_searchTools
 */
export class AwbServer {
  private server: http.Server | null = null;
  private options: ServerOptions;
  private inventory: Inventory;

  constructor(options: ServerOptions) {
    this.options = options;
    this.inventory = new Inventory({ filePath: options.inventoryPath });
  }

  public start(): void {
    if (this.server) return;

    this.server = http.createServer(async (req, res) => {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body) as JsonRpcRequest;
          const response = await this.handleJsonRpc(payload);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        } catch (err: any) {
          const resp: JsonRpcError = {
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32603,
              message: 'Internal error',
              data: err?.message ?? String(err),
            },
          };
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(resp));
        }
      });
    });

    this.server.listen(this.options.port, () => {
      console.log(`AWB MCP server listening on http://localhost:${this.options.port}`);
    });
  }

  public stop(): void {
    if (!this.server) return;
    this.server.close();
    this.server = null;
  }

  private async handleJsonRpc(req: JsonRpcRequest): Promise<JsonRpcResponse> {
    if (req.jsonrpc !== '2.0') {
      return this.error(req.id, -32600, 'Invalid JSON-RPC version');
    }

    try {
      switch (req.method) {
        case 'tools/list':
          return await this.handleToolsList(req);
        case 'tools/call':
          return await this.handleToolsCall(req);
        default:
          return this.error(req.id, -32601, `Method not found: ${req.method}`);
      }
    } catch (err: any) {
      return this.error(req.id, -32603, 'Internal error', err?.message ?? String(err));
    }
  }

  private success(id: JsonRpcRequest['id'], result: any): JsonRpcSuccess {
    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  private error(
    id: JsonRpcRequest['id'],
    code: number,
    message: string,
    data?: any,
  ): JsonRpcError {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data,
      },
    };
  }

  /**
   * List MCP tools exposed by AWB.
   */
  private async handleToolsList(req: JsonRpcRequest): Promise<JsonRpcResponse> {
    const tools: McpToolDescription[] = [
      {
        name: 'awb_craftTool',
        description:
          'Craft a new tool and store it in the Agent WorkBench inventory. Use this when the agent wants to create a reusable capability for similar problems in the future.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Short unique name for the tool.' },
            description: {
              type: 'string',
              description: 'Natural language description of what the tool does.',
            },
            code: {
              type: 'string',
              description:
                'Optional JavaScript code that implements the tool. In MVP, kept as reference only.',
            },
            metadata: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags that describe this tool (domains, actions, etc).',
                },
                problem: {
                  type: 'string',
                  description: 'Short description of the problem this tool solves.',
                },
                createdByAgent: {
                  type: 'string',
                  description: 'Agent ID or name that created this tool.',
                },
              },
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'awb_deleteTool',
        description: 'Delete a crafted tool from the inventory by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Tool ID returned from awb_craftTool or awb_listTools.',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'awb_listTools',
        description:
          'List tools in the inventory. Optionally filter by memory level or search query.',
        inputSchema: {
          type: 'object',
          properties: {
            memoryLevel: {
              type: 'string',
              enum: ['short_term', 'medium_term', 'long_term', 'archived'],
              description: 'Optional memory level filter.',
            },
            query: {
              type: 'string',
              description: 'Optional search query to filter by name/description/metadata.',
            },
          },
        },
      },
      {
        name: 'awb_searchTools',
        description:
          'Search tools using a semantic-like ranking over names, descriptions, and tags.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search phrase describing the needed tool.',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of tools to return (default 5).',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'awb_callTool',
        description:
          'Record an invocation of a crafted tool. The MVP does not execute arbitrary code, but tracks usage and memory promotion.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Tool ID the agent is conceptually calling.',
            },
            context: {
              type: 'string',
              description:
                'Optional natural language description of why/where this tool is being used.',
            },
          },
          required: ['id'],
        },
      },
    ];

    return this.success(req.id, { tools });
  }

  /**
   * Call an AWB tool.
   */
  private async handleToolsCall(req: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { name, arguments: args } = req.params || {};
    if (!name) {
      return this.error(req.id, -32602, 'Missing tool name in params.name');
    }

    switch (name) {
      case 'awb_craftTool':
        return this.success(req.id, await this.toolCraft(args));
      case 'awb_deleteTool':
        return this.success(req.id, await this.toolDelete(args));
      case 'awb_listTools':
        return this.success(req.id, await this.toolList(args));
      case 'awb_searchTools':
        return this.success(req.id, await this.toolSearch(args));
      case 'awb_callTool':
        return this.success(req.id, await this.toolCall(args));
      default:
        return this.error(req.id, -32601, `Unknown tool: ${name}`);
    }
  }

  private async toolCraft(args: any): Promise<any> {
    if (!args || typeof args.name !== 'string') {
      throw new Error('awb_craftTool requires a "name" string in arguments');
    }
    const tool = await this.inventory.craftTool({
      name: args.name,
      description: args.description,
      code: args.code,
      metadata: args.metadata,
    });
    return { tool };
  }

  private async toolDelete(args: any): Promise<any> {
    if (!args || typeof args.id !== 'string') {
      throw new Error('awb_deleteTool requires an "id" string in arguments');
    }
    const deleted = await this.inventory.deleteTool(args.id);
    return { deleted };
  }

  private async toolList(args: any): Promise<any> {
    const { memoryLevel, query } = args || {};
    let tools = await this.inventory.list();
    if (memoryLevel) {
      tools = tools.filter(t => t.memoryLevel === memoryLevel);
    }
    if (query && typeof query === 'string') {
      // Reuse search implementation but then filter memoryLevel if set
      const searched = await this.inventory.search(query, { limit: 100 });
      tools = searched.filter(t => !memoryLevel || t.memoryLevel === memoryLevel);
    }
    return { tools };
  }

  private async toolSearch(args: any): Promise<any> {
    if (!args || typeof args.query !== 'string') {
      throw new Error('awb_searchTools requires a "query" string in arguments');
    }
    const limit = typeof args.limit === 'number' ? args.limit : 5;
    const tools = await this.inventory.search(args.query, { limit });
    return { tools };
  }

  private async toolCall(args: any): Promise<any> {
    if (!args || typeof args.id !== 'string') {
      throw new Error('awb_callTool requires an "id" string in arguments');
    }
    const tool = await this.inventory.touchToolUsage(args.id);
    if (!tool) {
      throw new Error(`Tool not found: ${args.id}`);
    }
    // MVP: We do NOT execute tool.code here for safety.
    // Instead, we simply update usage stats and return the tool metadata.
    return {
      tool,
      message:
        'Tool usage recorded. This MVP does not execute dynamic code, only tracks and manages tools.',
    };
  }
}
