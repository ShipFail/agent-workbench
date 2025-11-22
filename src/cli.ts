#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { AwbServer } from './server';
import { Inventory } from './inventory';

const program = new Command();

program
  .name('awb')
  .description('Agent WorkBench (AWB) - the crafting table for AI agents')
  .version('0.1.0');

program
  .command('start')
  .description('Start the AWB MCP server')
  .option('-p, --port <port>', 'Port to listen on (default: 7777)', '7777')
  .option(
    '-i, --inventory <path>',
    'Path to inventory JSON file (default: ./.awb/inventory.json)',
    path.resolve('.awb', 'inventory.json'),
  )
  .action(opts => {
    const port = parseInt(opts.port, 10) || 7777;
    const inventoryPath = path.resolve(opts.inventory);
    console.log(
      `Starting AWB MCP server on port ${port} with inventory at ${inventoryPath}...`,
    );
    const server = new AwbServer({ port, inventoryPath });
    server.start();

    // Keep process alive
  });

program
  .command('init')
  .description('Initialize an AWB workspace in the current directory')
  .option(
    '-i, --inventory <path>',
    'Path to inventory JSON file (default: ./.awb/inventory.json)',
    path.resolve('.awb', 'inventory.json'),
  )
  .action(async opts => {
    const inventoryPath = path.resolve(opts.inventory);
    console.log(`Initializing AWB inventory at ${inventoryPath}...`);
    const inv = new Inventory({ filePath: inventoryPath });
    // Trigger load, which creates file if missing
    const tools = await inv.list();
    console.log(`Initialized AWB workspace. Tools currently in inventory: ${tools.length}`);
  });

const inventory = program.command('inventory').description('Inspect the AWB inventory');

inventory
  .command('list')
  .description('List tools in the inventory')
  .option('-i, --inventory <path>', 'Path to inventory JSON file', path.resolve('.awb', 'inventory.json'))
  .action(async opts => {
    const inventoryPath = path.resolve(opts.inventory);
    const inv = new Inventory({ filePath: inventoryPath });
    const tools = await inv.list();
    if (!tools.length) {
      console.log('No tools in inventory yet.');
      return;
    }
    console.log(`Tools in inventory (${tools.length}):`);
    for (const t of tools) {
      console.log(
        `- ${t.id} | ${t.name} [${t.memoryLevel}] uses=${t.usageCount}` +
          (t.description ? ` — ${t.description}` : ''),
      );
    }
  });

inventory
  .command('search')
  .description('Search tools in the inventory')
  .argument('<query>', 'Search query')
  .option('-i, --inventory <path>', 'Path to inventory JSON file', path.resolve('.awb', 'inventory.json'))
  .action(async (query, opts) => {
    const inventoryPath = path.resolve(opts.inventory);
    const inv = new Inventory({ filePath: inventoryPath });
    const tools = await inv.search(query, { limit: 20 });
    if (!tools.length) {
      console.log('No matching tools found.');
      return;
    }
    console.log(`Matching tools (${tools.length}):`);
    for (const t of tools) {
      console.log(
        `- ${t.id} | ${t.name} [${t.memoryLevel}] uses=${t.usageCount}` +
          (t.description ? ` — ${t.description}` : ''),
      );
    }
  });

inventory
  .command('inspect')
  .description('Inspect a single tool by ID')
  .argument('<id>', 'Tool ID')
  .option('-i, --inventory <path>', 'Path to inventory JSON file', path.resolve('.awb', 'inventory.json'))
  .action(async (id, opts) => {
    const inventoryPath = path.resolve(opts.inventory);
    const inv = new Inventory({ filePath: inventoryPath });
    const tool = await inv.get(id);
    if (!tool) {
      console.error(`Tool not found: ${id}`);
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify(tool, null, 2));
  });

inventory
  .command('delete')
  .description('Delete a tool by ID')
  .argument('<id>', 'Tool ID')
  .option('-i, --inventory <path>', 'Path to inventory JSON file', path.resolve('.awb', 'inventory.json'))
  .action(async (id, opts) => {
    const inventoryPath = path.resolve(opts.inventory);
    const inv = new Inventory({ filePath: inventoryPath });
    const deleted = await inv.deleteTool(id);
    if (!deleted) {
      console.error(`Tool not found or already deleted: ${id}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Deleted tool: ${id}`);
  });

program.parse(process.argv);
