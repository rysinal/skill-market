import { Command } from 'commander';
import chalk from 'chalk';
import { getAllInstalledSkills } from '../services/manifest.js';
import { getToolById } from '../services/tools.js';

interface ListOptions {
  json?: boolean;
  tool?: string;
}

export const listCommand = new Command('list')
  .description('List all installed skills')
  .option('--json', 'Output in JSON format', false)
  .option('--tool <tool>', 'Filter by tool')
  .action(async (options: ListOptions) => {
    const useJson = options.json ?? false;

    try {
      let skills = await getAllInstalledSkills();

      // Filter by tool if specified
      if (options.tool) {
        skills = skills.filter((s) => s.tools.includes(options.tool!));
      }

      if (useJson) {
        console.log(
          JSON.stringify(
            {
              success: true,
              skills: skills.map((s) => ({
                name: s.name,
                version: s.version,
                tools: s.tools,
                installedAt: s.installedAt,
              })),
            },
            null,
            2
          )
        );
        return;
      }

      if (skills.length === 0) {
        console.log(chalk.yellow('No skills installed'));
        return;
      }

      console.log(chalk.bold('Installed skills:'));
      console.log();

      for (const skill of skills) {
        console.log(`  ${chalk.cyan(skill.name)}@${skill.version}`);

        const toolNames = skill.tools
          .map((id) => getToolById(id)?.displayName ?? id)
          .join(', ');
        console.log(chalk.dim(`    → ${toolNames}`));

        const date = new Date(skill.installedAt).toLocaleDateString();
        console.log(chalk.dim(`    Installed: ${date}`));
        console.log();
      }

      console.log(`Total: ${skills.length} skill(s)`);
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
