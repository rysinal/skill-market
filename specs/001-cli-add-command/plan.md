# Implementation Plan: CLI Add Command

**Branch**: `001-cli-add-command` | **Date**: 2026-01-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cli-add-command/spec.md`

## Summary

实现 `npx skill-market add <skill>` 命令，支持从私有注册表下载 skills 并安装到目标 AI 工具（Claude Code, Codex, Antigravity）。采用全局存储 + 软链接架构，支持交互式工具选择、版本管理和批量更新。

## Technical Context

**Language/Version**: Node.js 20 LTS + TypeScript 5.x (strict mode)
**Primary Dependencies**: Commander.js (CLI), node-fetch (HTTP), tar (解压), ora (进度), inquirer (交互)
**Storage**: 文件系统 (`~/.skill-market/`)
**Testing**: Vitest + @vitest/coverage-v8
**Target Platform**: macOS, Linux, Windows (跨平台)
**Project Type**: Monorepo (packages/cli, packages/shared)
**Performance Goals**: 安装完成 < 10 秒（不含网络延迟）
**Constraints**: 零外部服务依赖，支持离线错误提示
**Scale/Scope**: 单用户本地工具，支持数百个 skills

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. CLI-First Experience | 10 秒内完成安装 | ✅ 设计目标 |
| I. CLI-First Experience | 支持 `--json` 输出 | ✅ FR-005 |
| I. CLI-First Experience | 清晰错误信息 | ✅ FR-009, US3 |
| I. CLI-First Experience | 离线错误提示 | ✅ US3 Scenario 1 |
| II. Self-Hosted First | 支持自定义注册表 | ✅ FR-007, FR-008 |
| III. Registry Integrity | SHA256 校验和验证 | ✅ FR-004 |
| III. Registry Integrity | 下载验证失败拒绝安装 | ✅ US3 Scenario 3 |

**Gate Status**: ✅ PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-cli-add-command/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/
├── cli/
│   ├── src/
│   │   ├── commands/
│   │   │   ├── add.ts           # add 命令实现
│   │   │   └── update.ts        # update 命令实现
│   │   ├── services/
│   │   │   ├── registry.ts      # 注册表 API 客户端
│   │   │   ├── installer.ts     # 下载、解压、链接逻辑
│   │   │   ├── manifest.ts      # 清单文件管理
│   │   │   └── tools.ts         # 工具路径映射
│   │   ├── utils/
│   │   │   ├── checksum.ts      # SHA256 校验
│   │   │   ├── symlink.ts       # 软链接操作
│   │   │   └── config.ts        # 配置文件读取
│   │   └── index.ts             # CLI 入口
│   ├── tests/
│   │   ├── commands/
│   │   ├── services/
│   │   └── e2e/
│   └── package.json
└── shared/
    ├── src/
    │   ├── types/
    │   │   ├── skill.ts         # Skill 类型定义
    │   │   ├── manifest.ts      # Manifest 类型定义
    │   │   └── tool.ts          # Tool 类型定义
    │   └── index.ts
    └── package.json
```

**Structure Decision**: 采用 Monorepo 结构，cli 和 shared 分离。shared 包含类型定义，未来可被 server 和 web 复用。

## Complexity Tracking

> 无宪法违规，无需记录。

## Phase Status

| Phase | Status | Output |
|-------|--------|--------|
| Phase 0: Research | ✅ Complete | [research.md](./research.md) |
| Phase 1: Design | ✅ Complete | [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md) |
| Phase 2: Tasks | ✅ Complete | [tasks.md](./tasks.md) |

## Generated Artifacts

- `research.md` - 技术选型和依赖决策
- `data-model.md` - 数据模型和实体定义
- `contracts/registry-api.md` - Registry API 契约
- `contracts/cli-commands.md` - CLI 命令契约
- `quickstart.md` - 快速开始指南
- `CLAUDE.md` - Agent context 文件（项目根目录）
