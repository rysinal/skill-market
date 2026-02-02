# Continuity Ledger

## 项目目标 (Goal)
实现 `npx skill-market add <skill>` CLI 命令，支持从私有注册表下载 skills 并安装到目标 AI 工具（Claude Code, Codex, Antigravity）。采用全局存储 + 软链接架构。

## 约束与假设 (Constraints)
- Node.js 20 LTS + TypeScript 5.x (strict mode)
- Monorepo 结构: packages/cli, packages/shared
- 全局存储: `~/.skill-market/skills/`
- 软链接到工具目录: `.claude/skills/`, `.codex/skills/`, `.antigravity/skills/`
- 80% 测试覆盖率要求

## 关键决策 (Key Decisions)
- 使用 Commander.js 作为 CLI 框架
- 使用 pnpm workspaces 管理 monorepo
- SHA256 校验和验证包完整性
- 交互式工具选择 + `--tool` 参数支持

## 当前状态 (State)

### ✅ 已完成
- 项目宪法 v2.0.0 创建
- 功能规格 spec.md 完成
- 实现计划 plan.md 完成
- 技术研究 research.md 完成
- 数据模型 data-model.md 完成
- API 契约文档完成
- 任务列表 tasks.md 生成 (62 tasks)
- Phase 1-7 全部完成 ✅
- 测试覆盖率 80.39% ✅
- 58 个单元测试通过 ✅
- CLI 命令验证通过 ✅
- README.md 文档完成 ✅

### ▶️ 进行中
无

### ⏸️ 待办
- 发布到 npm (可选)
- E2E 集成测试 (可选)

## 待解决问题 (Open Questions)
无

## 实现摘要

### CLI 命令
| 命令 | 描述 | 状态 |
|------|------|------|
| `add <skill>` | 安装 skill | ✅ |
| `update [skill]` | 更新 skill | ✅ |
| `list` | 列出已安装 skills | ✅ |
| `remove <skill>` | 移除 skill | ✅ |

### 核心服务
| 文件 | 功能 | 覆盖率 |
|------|------|--------|
| `registry.ts` | 注册表 API 客户端 | 22.5% |
| `manifest.ts` | 清单文件管理 | 100% |
| `installer.ts` | 下载、解压、链接 | 99% |
| `tools.ts` | 工具注册表 | 95.65% |

### 工具函数
| 文件 | 功能 | 覆盖率 |
|------|------|--------|
| `checksum.ts` | SHA256 校验 | 100% |
| `symlink.ts` | 跨平台软链接 | 100% |
| `config.ts` | 配置加载 | 85.29% |

### 测试状态
- 7 个测试文件
- 58 个单元测试
- 总覆盖率: 80.39%
