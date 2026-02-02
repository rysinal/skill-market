# Research: CLI Add Command

**Feature**: 001-cli-add-command
**Date**: 2026-01-30
**Status**: Complete

## Research Topics

### 1. CLI Framework Selection

**Decision**: Commander.js

**Rationale**:
- 轻量级，无额外依赖
- TypeScript 支持良好
- 广泛使用，文档完善
- 支持子命令、选项、帮助生成

**Alternatives Considered**:
- **oclif**: 功能强大但过于复杂，适合大型 CLI 项目
- **yargs**: 功能相似，但 API 不如 Commander 直观
- **cac**: 更轻量但社区较小

### 2. 交互式提示库

**Decision**: @inquirer/prompts (Inquirer v9+)

**Rationale**:
- 支持多选（checkbox）满足多工具选择需求
- 现代 ESM 支持
- 类型安全
- 支持自定义主题

**Alternatives Considered**:
- **prompts**: 更轻量但多选支持较弱
- **enquirer**: 功能强大但维护不活跃

### 3. 进度显示

**Decision**: ora + cli-progress

**Rationale**:
- ora: 简洁的 spinner，适合短操作
- cli-progress: 下载进度条，显示百分比和速度
- 两者组合覆盖所有场景

**Alternatives Considered**:
- **listr2**: 功能强大但过于复杂
- **progress**: 较老，不支持 ESM

### 4. HTTP 客户端

**Decision**: undici (Node.js 内置)

**Rationale**:
- Node.js 20 内置，零依赖
- 性能优于 node-fetch
- 支持流式��载
- 原生支持 AbortController

**Alternatives Considered**:
- **node-fetch**: 需要额外安装
- **axios**: 体积较大，功能过剩
- **got**: 功能强大但依赖较多

### 5. Tarball 解压

**Decision**: tar (npm 官方包)

**Rationale**:
- npm 官方维护，稳定可靠
- 支持流式解压
- 跨平台兼容
- 与 npm 生态一致

**Alternatives Considered**:
- **decompress**: 支持多格式但依赖较多
- **archiver**: 主要用于创建压��包

### 6. 软链接跨平台处理

**Decision**: Node.js fs.symlink + Windows junction fallback

**Rationale**:
- macOS/Linux: 标准 symlink
- Windows: 使用 junction（不需要管理员权限）
- 检测平台自动选择策略

**Implementation Notes**:
```typescript
// Windows 上目录使用 junction，文件使用 hard link
const linkType = process.platform === 'win32' ? 'junction' : 'dir';
await fs.symlink(target, path, linkType);
```

### 7. 配置文件格式

**Decision**: JSON (.skillrc) + 环境变量

**Rationale**:
- JSON 简单直观，无需额外解析器
- 与 manifest.json 格式一致
- 环境变量优先级高于配置文件

**Config Schema**:
```json
{
  "registry": "https://registry.example.com",
  "defaultTool": "claude-code",
  "cacheDir": "~/.skill-market/cache"
}
```

### 8. 各工具安装路径映射

**Decision**: 内置路径映射表

| Tool | Install Path | Notes |
|------|--------------|-------|
| claude-code | `.claude/skills/<name>` | Claude Code 官方目录 |
| codex | `.codex/skills/<name>` | OpenAI Codex 目录 |
| antigravity | `.antigravity/skills/<name>` | Antigravity 目录 |

**Rationale**:
- 遵循各工具官方约定
- 路径相对于用户 home 目录
- 通过 CLI 版本更新扩展新工具

### 9. Manifest 文件结构

**Decision**: JSON with version tracking

**Schema**:
```json
{
  "version": "1.0.0",
  "skills": {
    "my-skill": {
      "version": "1.2.0",
      "installedAt": "2026-01-30T10:00:00Z",
      "checksum": "sha256:abc123...",
      "tools": ["claude-code", "codex"],
      "source": "https://registry.example.com"
    }
  }
}
```

### 10. 错误处理策略

**Decision**: 分层错误类型 + 用户友好消息

**Error Categories**:
1. **NetworkError**: 网络连接失败 → 建议检查网络
2. **NotFoundError**: Skill 不存在 → 建议搜索类似名称
3. **ChecksumError**: 校验失败 → 自动重试一次
4. **PermissionError**: 权限不足 → 建议检查目录权限
5. **ConflictError**: 已存在 → 提示覆盖/跳过选项

## Dependencies Summary

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "@inquirer/prompts": "^5.0.0",
    "ora": "^8.0.0",
    "cli-progress": "^3.12.0",
    "tar": "^7.0.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.3.0",
    "@vitest/coverage-v8": "^1.3.0",
    "@types/node": "^20.0.0"
  }
}
```

## Open Questions Resolved

All technical decisions made. No outstanding questions.
