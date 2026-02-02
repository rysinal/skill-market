import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';
import { uninstallSkill } from '../services/installer.js';
import { getInstalledSkill } from '../services/manifest.js';

interface RemoveOptions {
  force?: boolean;
  json?: boolean;
}

export const removeCommand = new Command('remove')
  .description('Remove an installed skill')
  .argument('<skill>', 'Skill name to remove')
  .option('-f, --force', 'Skip confirmation prompt', false)
  .option('--json', 'Output in JSON format', false)
  .action(async (skillName: string, options: RemoveOptions) => {
    const useJson = options.json ?? false;

    try {
      // Check if skill is installed
      const installed = await getInstalledSkill(skillName);
      if (!installed) {
        if (useJson) {
          console.log(
            JSON.stringify(
              {
                success: false,
                error: { message: `Skill not installed: ${skillName}` },
              },
              null,
              2
            )
          );
        } else {
          console.error(chalk.red(`Error: Skill not installed: ${skillName}`));
        }
        process.exit(1);
      }

      // Confirm removal
      if (!options.force && !useJson) {
        const confirmed = await confirm({
          message: `Remove ${skillName}@${installed.version}?`,
          default: false,
        });

        if (!confirmed) {
          console.log(chalk.yellow('Cancelled'));
          return;
        }
      }

      // Remove skill
      const spinner = !useJson ? ora(`Removing ${skillName}...`).start() : null;

      const removed = await uninstallSkill(skillName);

      if (removed) {
        spinner?.succeed(`Removed ${skillName}`);

        if (useJson) {
          console.log(
            JSON.stringify(
              {
                success: true,
                removed: {
                  name: skillName,
                  version: installed.version,
                },
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.green(`Successfully removed ${skillName}@${installed.version}`));
        }
      } else {
        spinner?.fail(`Failed to remove ${skillName}`);
        process.exit(1);
      }
    } catch (error) {
      if (useJson) {
        console.log(
          JSON.stringify(
            {
              success: false,
              error: { message: error instanceof Error ? error.message : String(error) },
            },
            null,
            2
          )
        );
      } else {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      }
      process.exit(1);
    }
  });
