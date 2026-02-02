#!/usr/bin/env node

import { Command } from 'commander';
import { addCommand } from './commands/add.js';
import { updateCommand } from './commands/update.js';
import { listCommand } from './commands/list.js';
import { removeCommand } from './commands/remove.js';

const program = new Command();

program
  .name('skill-market')
  .description('CLI tool for managing AI skills from private registries')
  .version('0.1.0');

// Register commands
program.addCommand(addCommand);
program.addCommand(updateCommand);
program.addCommand(listCommand);
program.addCommand(removeCommand);

// Parse arguments
program.parse();
