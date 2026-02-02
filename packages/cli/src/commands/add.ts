import type { ToolId } from '@skill-market/shared';
import { Command } from 'commander';
import { checkbox } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig, getRegistryUrl } from '../utils/config.js';
import { RegistryClient, SkillNotFoundError, RegistryError } from '../services/registry.js';
import { installSkill, ChecksumError, type InstallStage } from '../services/installer.js';
import { getAvailableTools, resolveToolSelector } from '../services/tools.js';
import type { DownloadProgress } from '../services/registry.js';

interface AddOptions {
  tool?: string;
  registry?: string;
  force?: boolean;
  json?: boolean;
  progress?: boolean;
}

/**
 * Parse skill name and version from input
 * e.g., "my-skill@1.0.0" -> { name: "my-skill", version: "1.0.0" }
 */
function parseSkillInput(input: string): { name: string; version?: string } {
  const atIndex = input.lastIndexOf('@');
  if (atIndex > 0) {
    return {
      name: input.slice(0, atIndex),
      version: input.slice(atIndex + 1),
    };
  }
  return { name: input };
}

/**
 * Prompt user to select tools interactively
 */
async function promptToolSelection(): Promise<ToolId[]> {
  const tools = getAvailableTools();

  const selected = await checkbox({
    message: 'Select target tool(s):',
    choices: tools.map((tool) => ({
      name: tool.displayName,
      value: tool.id as ToolId,
    })),
  });

  if (selected.length === 0) {
    throw new Error('At least one tool must be selected');
  }

  return selected;
}

/**
 * Format progress message
 */
function formatProgress(stage: InstallStage, progress?: DownloadProgress): string {
  switch (stage) {
    case 'fetching':
      return 'Fetching skill info...';
    case 'downloading':
      if (progress && progress.total > 0) {
        const percent = Math.round((progress.downloaded / progress.total) * 100);
        const mb = (progress.downloaded / 1024 / 1024).toFixed(1);
        return `Downloading... ${mb} MB (${percent}%)`;
      }
      return 'Downloading...';
    case 'verifying':
      return 'Verifying checksum...';
    case 'extracting':
      return 'Extracting files...';
    case 'linking':
      return 'Creating symlinks...';
    case 'complete':
      return 'Complete!';
  }
}

/**
 * Get exit code for error type
 */
function getExitCode(error: unknown): number {
  if (error instanceof SkillNotFoundError) return 2;
  if (error instanceof RegistryError) return 3;
  if (error instanceof ChecksumError) return 4;
  if (error instanceof Error && error.message.includes('permission')) return 5;
  return 1;
}

export const addCommand = new Command('add')
  .description('Install a skill from the registry')
  .argument('<skill>', 'Skill name with optional version (e.g., my-skill@1.0.0)')
  .option('-t, --tool <tools>', 'Target tool(s), comma-separated or "all"')
  .option('-r, --registry <url>', 'Registry URL')
  .option('-f, --force', 'Force overwrite if already installed', false)
  .option('--json', 'Output in JSON format', false)
  .option('--no-progress', 'Disable progress display')
  .action(async (skillInput: string, options: AddOptions) => {
    const { name: skillName, version } = parseSkillInput(skillInput);
    const useJson = options.json ?? false;
    const showProgress = options.progress !== false && !useJson;

    try {
      // Load config
      const configOverrides = options.registry ? { registry: options.registry } : undefined;
      const config = await loadConfig(configOverrides);
      const registryUrl = getRegistryUrl(config);

      // Resolve tools
      let tools: ToolId[];
      if (options.tool) {
        tools = resolveToolSelector(options.tool);
      } else {
        tools = await promptToolSelection();
      }

      // Create registry client
      const client = new RegistryClient({ baseUrl: registryUrl });

      // Install with progress
      const spinner = showProgress ? ora() : null;

      const result = await installSkill(client, skillName, version, tools, registryUrl, {
        force: options.force ?? false,
        onProgress: (stage, progress) => {
          if (spinner) {
            spinner.text = formatProgress(stage, progress);
            if (stage === 'complete') {
              spinner.succeed('Installation complete');
            } else if (!spinner.isSpinning) {
              spinner.start();
            }
          }
        },
      });

      // Output result
      if (useJson) {
        console.log(
          JSON.stringify(
            {
              success: true,
              skill: {
                name: result.skill.name,
                version: result.skill.version,
              },
              links: result.links,
            },
            null,
            2
          )
        );
      } else {
        console.log();
        console.log(chalk.green(`Successfully installed ${result.skill.name}@${result.skill.version}`));
        for (const link of result.links) {
          console.log(chalk.dim(`  → ${link.tool}: ${link.path}`));
        }
      }
    } catch (error) {
      const exitCode = getExitCode(error);

      if (useJson) {
        console.log(
          JSON.stringify(
            {
              success: false,
              error: {
                code: exitCode,
                message: error instanceof Error ? error.message : String(error),
              },
            },
            null,
            2
          )
        );
      } else {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      }

      process.exit(exitCode);
    }
  });
