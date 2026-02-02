# Quickstart: skill-market CLI

## Prerequisites

- Node.js 20 LTS or later
- npm 10+ or pnpm 8+

## Installation

```bash
# 使用 npx（推荐，无需安装）
npx skill-market add <skill-name>

# 或全局安装
npm install -g skill-market
skill-market add <skill-name>
```

## Basic Usage

### 1. 安装你的第一个 Skill

```bash
npx skill-market add code-review
```

系统会提示你选择目标工具：

```
? Select target tool(s): (Press <space> to select, <a> to toggle all)
❯ ◯ Claude Code
  ◯ OpenAI Codex
  ◯ Antigravity
```

### 2. 指定目标工具

```bash
# 单个工具
npx skill-market add code-review --tool claude-code

# 多个工具
npx skill-market add code-review --tool claude-code,codex

# 所有工具
npx skill-market add code-review --tool all
```

### 3. 安装特定版本

```bash
npx skill-market add code-review@2.0.0
```

### 4. 查看已安装的 Skills

```bash
npx skill-market list
```

### 5. 更新 Skills

```bash
# 更新单个
npx skill-market update code-review

# 更新所有
npx skill-market update --all
```

### 6. 移除 Skill

```bash
npx skill-market remove code-review
```

## Configuration

### 使用私有注册表

```bash
# 命令行参数
npx skill-market add my-skill --registry https://registry.mycompany.com

# 环境变量
export SKILL_MARKET_REGISTRY=https://registry.mycompany.com
npx skill-market add my-skill
```

### 配置文件

创建 `.skillrc` 文件：

```json
{
  "registry": "https://registry.mycompany.com",
  "defaultTool": "claude-code"
}
```

## File Locations

| Path | Description |
|------|-------------|
| `~/.skill-market/skills/` | Skill 文件存储位置 |
| `~/.skill-market/manifest.json` | 已安装 skills 清单 |
| `.claude/skills/` | Claude Code 软链接目录 |
| `.codex/skills/` | Codex 软链接目录 |
| `.skillrc` | 项目配置文件 |
| `~/.skillrc` | 用户全局配置文件 |

## Troubleshooting

### 网络错误

```
Error: Unable to connect to registry
```

检查网络连接和注册表 URL 是否正确。

### 权限错误

```
Error: Permission denied
```

确保对 `~/.skill-market/` 和目标工具目录有写权限。

### 校验和验证失败

```
Error: Checksum verification failed
```

系统会自动重试一次。如果仍然失败，请检查网络稳定性或联系注册表管理员。

## Next Steps

- 查看 [CLI Commands Reference](./contracts/cli-commands.md)
- 了解 [Registry API](./contracts/registry-api.md)
