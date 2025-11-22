/**
 * Shared types for Agent WorkBench (AWB)
 */

export type MemoryLevel = 'short_term' | 'medium_term' | 'long_term' | 'archived';

export interface ToolMetadata {
  tags?: string[];
  problem?: string;
  createdByAgent?: string;
}

export interface ToolRecord {
  id: string;
  name: string;
  description?: string;
  code?: string; // Optional dynamic code as JS
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usageCount: number;
  memoryLevel: MemoryLevel;
  metadata?: ToolMetadata;
}

export interface InventoryData {
  tools: ToolRecord[];
  // For future global stats
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * MCP tool description as exposed via tools/list.
 * This is a simplified version of the MCP schema.
 */
export interface McpToolDescription {
  name: string;
  description: string;
  inputSchema: any; // JSON Schema
}

/**
 * JSON-RPC 2.0 request/response types (simplified).
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcSuccess {
  jsonrpc: '2.0';
  id: string | number | null;
  result: any;
}

export interface JsonRpcError {
  jsonrpc: '2.0';
  id: string | number | null;
  error: {
    code: number;
    message: string;
    data?: any;
  };
}

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;
