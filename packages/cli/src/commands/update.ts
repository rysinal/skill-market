import type { ToolId } from '@skill-market/shared';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig, getRegistryUrl } from '../utils/config.js';
import { RegistryClient } from '../services/registry.js';
import { getAllInstalledSkills, getInstalledSkill } from '../services/manifest.js';
import { installSkill } from '../services/installer.js';

interface UpdateOptions {
  all?: boolean;
  registry?: string;
  json?: boolean;
  dryRun?: boolean;
}

interface UpdateResult {
  name: string;
  from: string;
  to: string;
}

export const updateCommand = new Command('update')
  .description('Update installed skills to latest versions')
  .argument('[skill]', 'Skill name to update (omit for --all)')
  .option('-a, --all', 'Update all installed skills', false)
  .option('-r, --registry <url>', 'Registry URL')
  .option('--json', 'Output in JSON format', false)
  .option('--dry-run', 'Show what would be updated without making changes', false)
  .action(async (skillName: string | undefined, options: UpdateOptions) => {
    const useJson = options.json ?? false;
    const dryRun = options.dryRun ?? false;

    try {
      // Load config
      const configOverrides = options.registry ? { registry: options.registry } : undefined;
      const config = await loadConfig(configOverrides);
      const registryUrl = getRegistryUrl(config);
      const client = new RegistryClient({ baseUrl: registryUrl });

      // Get skills to update
      let skillsToCheck: string[];
      if (skillName) {
        skillsToCheck = [skillName];
      } else if (options.all) {
        const installed = await getAllInstalledSkills();
        skillsToCheck = installed.map((s) => s.name);
      } else {
        console.error(chalk.red('Error: Specify a skill name or use --all'));
        process.exit(1);
      }

      if (skillsToCheck.length === 0) {
        if (useJson) {
          console.log(JSON.stringify({ success: true, updated: [], upToDate: [] }, null, 2));
        } else {
          console.log(chalk.yellow('No skills installed'));
        }
        return;
      }

      const spinner = !useJson ? ora('Checking for updates...').start() : null;

      // Check for updates
      const updates: Array<{ name: string; current: string; latest: string; tools: ToolId[] }> = [];
      const upToDate: string[] = [];
      const notFound: string[] = [];

      for (const name of skillsToCheck) {
        const installed = await getInstalledSkill(name);
        if (!installed) {
          notFound.push(name);
          continue;
        }

        try {
          const latestSkill = await client.getSkill(name);
          if (latestSkill.version !== installed.version) {
            updates.push({
              name,
              current: installed.version,
              latest: latestSkill.version,
              tools: installed.tools as ToolId[],
            });
          } else {
            upToDate.push(name);
          }
        } catch {
          notFound.push(name);
        }
      }

      spinner?.stop();

      // Show what would be updated
      if (!useJson && updates.length > 0) {
        console.log();
        for (const update of updates) {
          console.log(`  ${update.name}    ${chalk.dim(update.current)} → ${chalk.green(update.latest)}`);
        }
        for (const name of upToDate) {
          console.log(`  ${name}    ${chalk.dim('(up to date)')}`);
        }
        console.log();
      }

      if (dryRun) {
        if (useJson) {
          console.log(
            JSON.stringify(
              {
                success: true,
                dryRun: true,
                wouldUpdate: updates.map((u) => ({ name: u.name, from: u.current, to: u.latest })),
                upToDate,
              },
              null,
              2
            )
          );
        } else {
          console.log(chalk.yellow('Dry run - no changes made'));
        }
        return;
      }

      // Perform updates
      const updated: UpdateResult[] = [];

      for (const update of updates) {
        const updateSpinner = !useJson ? ora(`Updating ${update.name}...`).start() : null;

        try {
          await installSkill(client, update.name, update.latest, update.tools, registryUrl, {
            force: true,
          });

          updated.push({
            name: update.name,
            from: update.current,
            to: update.latest,
          });

          updateSpinner?.succeed(`Updated ${update.name}`);
        } catch (error) {
          updateSpinner?.fail(`Failed to update ${update.name}`);
          if (!useJson) {
            console.error(chalk.red(`  ${error instanceof Error ? error.message : String(error)}`));
          }
        }
      }

      // Output results
      if (useJson) {
        console.log(
          JSON.stringify(
            {
              success: true,
              updated,
              upToDate,
            },
            null,
            2
          )
        );
      } else {
        console.log();
        if (updated.length > 0) {
          console.log(chalk.green(`Successfully updated ${updated.length} skill(s)`));
        } else if (updates.length === 0) {
          console.log(chalk.green('All skills are up to date'));
        }
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
