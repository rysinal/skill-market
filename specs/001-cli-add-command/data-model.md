# Data Model: CLI Add Command

**Feature**: 001-cli-add-command
**Date**: 2026-01-30

## Entities

### Skill

表示一个可安装的技能包。

```typescript
interface Skill {
  /** 唯一标识符，如 "my-skill" */
  name: string;

  /** 语义化版本号，如 "1.2.0" */
  version: string;

  /** 简短描述 */
  description: string;

  /** 作者信息 */
  author: {
    name: string;
    email?: string;
  };

  /** SHA256 校验和 */
  checksum: string;

  /** 依赖的其他 skills */
  dependencies?: Record<string, string>;

  /** 关键词，用于搜索 */
  keywords?: string[];

  /** 发布时间 */
  publishedAt: string;

  /** tarball 下载 URL */
  tarballUrl: string;
}
```

**Validation Rules**:
- `name`: 必须匹配 `/^[a-z0-9-]+$/`，长度 1-50
- `version`: 必须符合 semver 格式
- `checksum`: 必须以 `sha256:` 前缀开头

---

### Tool

表示目标 AI 工具的配置。

```typescript
interface Tool {
  /** 工具标识符，如 "claude-code" */
  id: string;

  /** 显示名称，如 "Claude Code" */
  displayName: string;

  /** skills 安装路径（相对于项目根目录） */
  skillsPath: string;

  /** 是否启用 */
  enabled: boolean;
}
```

**内置工具列表**:

| id | displayName | skillsPath |
|----|-------------|------------|
| claude-code | Claude Code | .claude/skills |
| codex | OpenAI Codex | .codex/skills |
| antigravity | Antigravity | .antigravity/skills |

---

### InstalledSkill

表示已安装的 skill 记录。

```typescript
interface InstalledSkill {
  /** Skill 名称 */
  name: string;

  /** 已安装版本 */
  version: string;

  /** 安装时间 */
  installedAt: string;

  /** 校验和 */
  checksum: string;

  /** 链接到的工具列表 */
  tools: string[];

  /** 来源注册表 URL */
  source: string;

  /** 全局存储路径 */
  storagePath: string;
}
```

---

### GlobalManifest

全局清单文件，存储在 `~/.skill-market/manifest.json`。

```typescript
interface GlobalManifest {
  /** 清单格式版本 */
  version: string;

  /** 已安装的 skills */
  skills: Record<string, InstalledSkill>;

  /** 最后更新时间 */
  updatedAt: string;
}
```

**Example**:
```json
{
  "version": "1.0.0",
  "skills": {
    "code-review": {
      "name": "code-review",
      "version": "2.1.0",
      "installedAt": "2026-01-30T10:00:00Z",
      "checksum": "sha256:abc123def456...",
      "tools": ["claude-code", "codex"],
      "source": "https://registry.example.com",
      "storagePath": "~/.skill-market/skills/code-review"
    }
  },
  "updatedAt": "2026-01-30T10:00:00Z"
}
```

---

### Config

用户配置文件，存储在 `.skillrc` 或 `~/.skillrc`。

```typescript
interface Config {
  /** 默认注册表 URL */
  registry?: string;

  /** 默认目标工具 */
  defaultTool?: string;

  /** 缓存目录 */
  cacheDir?: string;

  /** 是否启用颜色输出 */
  color?: boolean;
}
```

**配置优先级** (高 → 低):
1. 命令行参数 (`--registry`, `--tool`)
2. 环境变量 (`SKILL_MARKET_REGISTRY`)
3. 项目配置 (`./.skillrc`)
4. 用户配置 (`~/.skillrc`)
5. 默认值

---

## Relationships

```
┌─────────────────┐
│    Registry     │
│  (External API) │
└────────┬────────┘
         │ provides
         ▼
┌─────────────────┐
│      Skill      │
│   (metadata)    │
└────────┬────────┘
         │ downloaded as
         ▼
┌─────────────────┐      links to      ┌─────────────────┐
│ InstalledSkill  │ ─────────────────▶ │      Tool       │
│ (~/.skill-market│                    │ (path mapping)  │
│    /skills/)    │                    └─────────────────┘
└────────┬────────┘
         │ recorded in
         ▼
┌���────────────────┐
│ GlobalManifest  │
│ (manifest.json) │
└─────────────────┘
```

## State Transitions

### Skill Installation States

```
[Not Installed] ──add──▶ [Downloading] ──verify──▶ [Extracting] ──link──▶ [Installed]
                              │                         │
                              ▼                         ▼
                         [Failed:Network]         [Failed:Checksum]
                              │                         │
                              └────────retry────────────┘
```

### Skill Update States

```
[Installed v1] ──update──▶ [Checking] ──newer exists──▶ [Downloading v2] ──▶ [Installed v2]
                               │
                               ▼
                          [Up to date]
```

## File System Layout

```
~/.skill-market/
├── manifest.json           # GlobalManifest
├── skills/
│   ├── code-review/        # InstalledSkill storage
│   │   ├── skill.json      # Skill metadata
│   │   └── ...             # Skill files
│   └── test-helper/
│       └── ...
└── cache/                  # Downloaded tarballs (optional)
    └── code-review-2.1.0.tgz

.claude/skills/
├── code-review -> ~/.skill-market/skills/code-review  # Symlink
└── test-helper -> ~/.skill-market/skills/test-helper

.codex/skills/
└── code-review -> ~/.skill-market/skills/code-review  # Symlink
```
