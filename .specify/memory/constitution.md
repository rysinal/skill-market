<!--
Sync Impact Report
==================
Version change: 1.0.0 → 2.0.0 (MAJOR - complete redefinition for skills registry)
Modified principles:
  - I. User-Centric Learning → I. CLI-First Experience
  - II. Type-Safe Development → II. Self-Hosted First
  - III. Test-Driven Quality → III. Registry Integrity
Added sections:
  - Core Principles (3 principles - redefined)
  - Development Standards
  - Quality Gates
  - Governance
Removed sections:
  - Learning-specific requirements
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (compatible)
  - .specify/templates/spec-template.md ✅ (compatible)
  - .specify/templates/tasks-template.md ✅ (compatible)
Follow-up TODOs: None
-->

# Skill Market Constitution

> 私有化部署的 Skills 注册表平台，支持 `npx skill-market add <skill>` 一键安装

## Core Principles

### I. CLI-First Experience

CLI 是核心交互方式，所有功能 MUST 优先支持命令行操作。

- `npx skill-market add <skill>` MUST 在 10 秒内完成安装
- CLI 输出 MUST 同时支持人类可读格式和 JSON 格式 (`--json`)
- 错误信息 MUST 清晰指明问题和解决方案
- 离线场景 MUST 有明确的错误提示和缓存回退机制

**Rationale**: 参考 Vercel 的 `npx` 体验，开发者期望快速、可靠、无摩擦的安装流程。
CLI 体验决定了平台的采用率。

### II. Self-Hosted First

平台 MUST 设计为私有化部署优先，零外部依赖。

- 单一二进制/容器 MUST 能完成完整部署
- 配置 MUST 支持环境变量和配置文件两种方式
- 数据存储 MUST 支持本地文件系统（SQLite）和外部数据库（PostgreSQL）
- 认证 MUST 支持内置用户系统和企业 SSO（LDAP/OIDC）集成

**Rationale**: 内部平台的核心价值是数据主权和网络隔离。复杂的外部依赖会阻碍采用。

### III. Registry Integrity

Skills 注册表 MUST 保证包的完整性和可追溯性。

- 每个 skill 版本 MUST 有唯一的 SHA256 校验和
- 发布操作 MUST 不可变（immutable）- 已发布版本禁止覆盖
- 下载 MUST 验证校验和，失败则拒绝安装
- 所有发布/下载操作 MUST 有审计日志

**Rationale**: 内部工具链的可靠性直接影响开发效率。包损坏或被篡改会导致难以排查的问题。

## Development Standards

### 技术栈

- **Runtime**: Node.js 20 LTS + TypeScript 5.x (strict mode)
- **CLI Framework**: Commander.js 或 oclif
- **Server**: Fastify (高性能、低开销)
- **Storage**: SQLite (默认) / PostgreSQL (可选)
- **Package Format**: tarball (.tgz) 兼容 npm 生态

### 项目结构

```
packages/
├── cli/           # npx skill-market 命令行工具
├── server/        # 注册表 API 服务
├── shared/        # 共享类型定义和工具
└── web/           # 可选的 Web 浏览界面
```

### API 设计

- `GET /api/v1/skills` - 列出所有 skills
- `GET /api/v1/skills/:name` - 获取 skill 详情
- `GET /api/v1/skills/:name/:version` - 下载特定版本
- `PUT /api/v1/skills/:name/:version` - 发布新版本 (需认证)

## Quality Gates

1. **Type Check**: `tsc --noEmit` 零错误
2. **Lint**: ESLint 零错误
3. **Test**: 80% 覆盖率，CLI 命令必须有集成测试
4. **Build**: CLI 和 Server 构建成功
5. **E2E**: `npx skill-market add` 完整流程测试通过

## Governance

### Amendment Process

1. 通过 PR 提议修改
2. 记录修改理由
3. 获得维护者批准
4. 更新相关模板
5. 按语义化版本递增

### Versioning

- **MAJOR**: 原则删除/重定义，不兼容的治理变更
- **MINOR**: 新增原则/章节，扩展指导
- **PATCH**: 澄清、修正、非语义性调整

**Version**: 2.0.0 | **Ratified**: 2026-01-30 | **Last Amended**: 2026-01-30
