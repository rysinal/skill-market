# CLI Commands Contract

**Version**: 1.0.0

## Commands Overview

| Command | Description |
|---------|-------------|
| `add <skill>` | 安装 skill |
| `update [skill]` | 更新 skill |
| `list` | 列出已安装的 skills |
| `remove <skill>` | 移除 skill |

---

## add

安装一个 skill 到指定的 AI 工具。

### Synopsis

```bash
npx skill-market add <skill[@version]> [options]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| skill | Yes | Skill 名称，可选版本号 (如 `my-skill@1.2.0`) |

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| --tool | -t | string | (interactive) | 目标工具，逗号分隔多个 |
| --registry | -r | string | env/config | 注册表 URL |
| --force | -f | boolean | false | 强制覆盖已存在的 skill |
| --json | | boolean | false | JSON 格式输出 |
| --no-progress | | boolean | false | 禁用进度显示 |

### Examples

```bash
# 交互式选择工具
npx skill-market add code-review

# 指定工具
npx skill-market add code-review --tool claude-code

# 指定版本和多个工具
npx skill-market add code-review@2.0.0 --tool claude-code,codex

# 安装到所有工具
npx skill-market add code-review --tool all

# 强制覆盖
npx skill-market add code-review --force

# JSON 输出（用于脚本）
npx skill-market add code-review --tool claude-code --json
```

### Output (Human)

```
✔ Fetching skill info...
✔ Downloading code-review@2.1.0 (1.2 MB)
✔ Verifying checksum...
✔ Extracting files...
✔ Creating symlinks...

Successfully installed code-review@2.1.0
  → Claude Code: .claude/skills/code-review
  → Codex: .codex/skills/code-review
```

### Output (JSON)

```json
{
  "success": true,
  "skill": {
    "name": "code-review",
    "version": "2.1.0"
  },
  "links": [
    { "tool": "claude-code", "path": ".claude/skills/code-review" },
    { "tool": "codex", "path": ".codex/skills/code-review" }
  ]
}
```

### Exit Codes

| Code | Description |
|------|-------------|
| 0 | 成功 |
| 1 | 一般错误 |
| 2 | Skill 不存在 |
| 3 | 网络错误 |
| 4 | 校验和验证失败 |
| 5 | 权限错误 |

---

## update

更新已安装的 skill 到最新版本。

### Synopsis

```bash
npx skill-market update [skill] [options]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| skill | No | Skill 名称，省略则更新所有 |

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| --all | -a | boolean | false | 更新所有已安装的 skills |
| --registry | -r | string | env/config | 注册表 URL |
| --json | | boolean | false | JSON 格式输出 |
| --dry-run | | boolean | false | 仅显示将要更新的内容 |

### Examples

```bash
# 更新单个 skill
npx skill-market update code-review

# 更新所有 skills
npx skill-market update --all

# 预览更新
npx skill-market update --all --dry-run
```

### Output (Human)

```
Checking for updates...

  code-review    1.0.0 → 2.1.0
  test-helper    (up to date)

Updating code-review...
✔ Downloaded code-review@2.1.0
✔ Verified checksum
✔ Updated symlinks

Successfully updated 1 skill
```

### Output (JSON)

```json
{
  "success": true,
  "updated": [
    {
      "name": "code-review",
      "from": "1.0.0",
      "to": "2.1.0"
    }
  ],
  "upToDate": ["test-helper"]
}
```

---

## list

列出所有已安装的 skills。

### Synopsis

```bash
npx skill-market list [options]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| --json | boolean | false | JSON 格式输出 |
| --tool | string | (all) | 筛选指定工具的 skills |

### Output (Human)

```
Installed skills:

  code-review@2.1.0
    → claude-code, codex
    Installed: 2026-01-30

  test-helper@1.0.0
    → claude-code
    Installed: 2026-01-29

Total: 2 skills
```

---

## remove

移除已安装的 skill。

### Synopsis

```bash
npx skill-market remove <skill> [options]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| --tool | string | (all) | 仅从指定工具移除链接 |
| --force | boolean | false | 跳过确认提示 |
| --json | boolean | false | JSON 格式��出 |

### Examples

```bash
# 完全移除
npx skill-market remove code-review

# 仅从 Claude Code 移除链接
npx skill-market remove code-review --tool claude-code
```
