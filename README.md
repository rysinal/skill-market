# skill-market

CLI tool for managing AI skills from private registries. Similar to Vercel's `npx skills add`, but designed for private/self-hosted deployments.

## Features

- Install skills from private registries with `npx skill-market add <skill>`
- Support for multiple AI tools: Claude Code, Codex, Antigravity
- Global storage with symlinks to tool directories
- SHA256 checksum verification for package integrity
- Interactive tool selection or `--tool` flag for automation

## Installation

```bash
# Use directly with npx
npx skill-market add my-skill

# Or install globally
npm install -g skill-market
```

## Usage

### Add a skill

```bash
# Interactive tool selection
skill-market add my-skill

# Specify tool(s)
skill-market add my-skill --tool claude-code
skill-market add my-skill --tool claude-code,codex
skill-market add my-skill --tool all

# Install specific version
skill-market add my-skill@1.0.0

# Use custom registry
skill-market add my-skill --registry https://my-registry.example.com
```

### Update skills

```bash
# Update a specific skill
skill-market update my-skill

# Update all installed skills
skill-market update --all

# Preview updates without making changes
skill-market update --all --dry-run
```

### List installed skills

```bash
# List all installed skills
skill-market list

# JSON output for scripting
skill-market list --json
```

### Remove a skill

```bash
# Remove a skill (with confirmation)
skill-market remove my-skill

# Force remove without confirmation
skill-market remove my-skill --force
```

## Configuration

Configuration can be provided via:

1. `.skillrc` file in current directory or home directory
2. Environment variables
3. Command-line options

### Environment Variables

- `SKILL_MARKET_REGISTRY` - Default registry URL
- `SKILL_MARKET_STORAGE` - Custom storage directory (default: `~/.skill-market/skills/`)

### .skillrc Example

```json
{
  "registry": "https://my-registry.example.com",
  "storage": "~/.skill-market/skills/"
}
```

## Storage Architecture

Skills are stored globally at `~/.skill-market/skills/` and symlinked to tool-specific directories:

```
~/.skill-market/
├── manifest.json          # Tracks installed skills
└── skills/
    └── my-skill/
        └── 1.0.0/         # Skill files

~/.claude/skills/my-skill  → ~/.skill-market/skills/my-skill/1.0.0
~/.codex/skills/my-skill   → ~/.skill-market/skills/my-skill/1.0.0
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Skill not found |
| 3 | Registry error |
| 4 | Checksum verification failed |
| 5 | Permission error |

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## License

MIT
