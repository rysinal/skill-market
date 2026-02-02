# Feature Specification: CLI Add Command

**Feature Branch**: `001-cli-add-command`
**Created**: 2026-01-30
**Status**: Draft
**Input**: User description: "Implement npx skill-market add command for downloading and installing skills from registry"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install a Skill by Name (Priority: P1)

作为开发者，我想通过一条命令快速安装一个 skill 到我的项目中，这样我可以立即使用它而不需要手动下载和配置。

**Why this priority**: 这是平台的核心价值主张。没有这个功能，整个平台就没有意义。用户采用率完全取决于这个命令的体验。

**Independent Test**: 可以通过运行 `npx skill-market add <skill-name>` 并验证 skill 文件出现在正确位置来独立测试。

**Acceptance Scenarios**:

1. **Given** 用户在一个项目目录中且网络正常, **When** 用户运行 `npx skill-market add my-skill` 并选择 Claude Code, **Then** skill 被下载到 `~/.skill-market/skills/my-skill/`，并在 `.claude/skills/my-skill` 创建软链接，显示成功消息
2. **Given** 用户在一个项目目录中, **When** 用户运行 `npx skill-market add my-skill@1.2.0 --tool codex`, **Then** 指定版本的 skill 被下载并链接到 Codex 目录
3. **Given** 用户在一个项目目录中, **When** 用户运行 `npx skill-market add my-skill` 且该 skill 已存在, **Then** 系统提示是否覆盖或跳过
4. **Given** 用户运行安装命令, **When** 使用 `--tool claude-code,codex`, **Then** skill 被链接到两个工具的目录

---

### User Story 2 - View Installation Progress (Priority: P2)

作为开发者，我想在安装过程中看到进度信息，这样我知道命令正在工作而不是卡住了。

**Why this priority**: 良好的用户体验需要反馈。没有进度信息，用户可能会误以为命令卡住而中断操作。

**Independent Test**: 运行安装命令时观察终端输出，验证显示下载进度和状态信息。

**Acceptance Scenarios**:

1. **Given** 用户运行安装命令, **When** 下载开始, **Then** 显示下载进度（百分比或进度条）
2. **Given** 用户运行安装命令, **When** 下载完成, **Then** 显示校验和验证状态
3. **Given** 用户运行安装命令且使用 `--json` 标志, **When** 命令完成, **Then** 输出结构化 JSON 而非人类可读格式

---

### User Story 3 - Handle Offline/Error Scenarios (Priority: P3)

作为开发者，当安装失败时，我想看到清晰的错误信息和解决建议，这样我可以快速解决问题。

**Why this priority**: 错误处理是用户体验的重要组成部分，但只有在核心功能完成后才有意义。

**Independent Test**: 在离线状态或使用不存在的 skill 名称运行命令，验证错误信息的清晰度。

**Acceptance Scenarios**:

1. **Given** 用户离线, **When** 运行安装命令, **Then** 显示 "无法连接到注册表服务器" 并建议检查网络
2. **Given** skill 名称不存在, **When** 运行安装命令, **Then** 显示 "skill 'xxx' 不存在" 并建议搜索类似名称
3. **Given** 下载的文件校验和不匹配, **When** 验证失败, **Then** 显示 "文件完整性验证失败" 并自动重试一次

---

### Edge Cases

- 用户在没有写权限的目录中运行命令时，应显示权限错误并建议使用 sudo 或更换目录
- skill 名称包含特殊字符时，应正确处理或拒绝并提示有效的命名规则
- 网络中断导致下载不完整时，应清理部分下载的文件并提示重试
- 同时运行多个安装命令时，应使用文件锁防止冲突

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CLI MUST 支持 `npx skill-market add <skill-name>` 命令格式
- **FR-002**: CLI MUST 支持版本指定语法 `<skill-name>@<version>`
- **FR-003**: CLI MUST 将 skill 安装到目标工具对应的目录（如 Claude Code 的 `.claude/skills/`）
- **FR-004**: CLI MUST 在安装前验证 skill 的 SHA256 校验和
- **FR-005**: CLI MUST 支持 `--json` 标志输出结构化数据
- **FR-006**: CLI MUST 支持 `--force` 标志强制覆盖已存在的 skill
- **FR-007**: CLI MUST 支持 `--registry <url>` 标志指定自定义注册表地址
- **FR-008**: CLI MUST 从环境变量 `SKILL_MARKET_REGISTRY` 读取默认注册表地址
- **FR-009**: CLI MUST 在安装完成后显示 skill 的基本信息（名称、版本、描述）
- **FR-010**: CLI MUST 记录安装的 skill 到目标工具的清单文件
- **FR-011**: CLI MUST 支持 `--tool <name>` 标志指定目标工具（claude-code, codex, antigravity 等）
- **FR-012**: CLI MUST 在未指定 `--tool` 时交互式提示用户选择目标工具
- **FR-013**: CLI MUST 支持通过配置文件 `.skillrc` 设置默认目标工具
- **FR-014**: CLI MUST 内置支持的工具列表（初始：claude-code, codex, antigravity），新工具通过 CLI 版本更新添加
- **FR-015**: CLI MUST 将 skill 实际文件存储在全局目录 `~/.skill-market/skills/<skill-name>/`
- **FR-016**: CLI MUST 在目标工具的官方目录创建软链接指向实际文件（如 Claude Code → `.claude/skills/<skill-name>`）
- **FR-017**: CLI MUST 支持 `npx skill-market update <skill-name>` 命令更新已安装的 skill 到最新版本
- **FR-018**: CLI MUST 支持 `npx skill-market update --all` 更新所有已安装的 skills
- **FR-019**: CLI MUST 在更新前显示当前版本和目标版本的对比信息
- **FR-020**: CLI MUST 维护 `~/.skill-market/manifest.json` 记录所有已安装 skills 及其链接的工具
- **FR-021**: CLI MUST 支持交互式多选目标工具，或通过 `--tool claude-code,codex` 逗号分隔指定多个工具
- **FR-022**: CLI MUST 支持 `--tool all` 选项将 skill 链接到所有内置工具

### Key Entities

- **Skill**: 可安装的技能包，包含名称、版本、描述、作者、校验和、依赖列表
- **Registry**: 存储和分发 skill 的服务器，提供查询和下载 API
- **Tool**: 目标 AI 工具（如 Claude Code, Codex, Antigravity），定义安装路径映射
- **GlobalManifest**: 全局清单文件 `~/.skill-market/manifest.json`，记录所有已安装 skills、版本及其链接的工具列表
- **Symlink**: 软链接，将全局存储的 skill 文件链接到各工具的官方目录

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在 10 秒内完成单个 skill 的安装（不含网络延迟）
- **SC-002**: 90% 的用户在首次使用时无需查阅文档即可成功安装 skill
- **SC-003**: 错误信息在 95% 的情况下能指导用户解决问题
- **SC-004**: 命令支持在无网络环境下显示有意义的错误信息
- **SC-005**: 安装过程中断后，系统不会留下损坏或不完整的文件

## Clarifications

### Session 2026-01-30

- Q: 当用户运行安装命令时，如何选择目标工具？ → A: 交互式选择：首次���行时提示选择工具，支持 `--tool <name>` 跳过交互
- Q: CLI 应该支持哪些目标工具？ → A: 仅内置工具（Claude Code, Codex, Antigravity），通过 CLI 包版本更新扩展新工具支持
- Q: 如何支持已安装 skill 的版本更新？ → A: 独立命令 `npx skill-market update <skill>` 更新到最新版，`update --all` 更新全部
- Q: 内置工具的 skill 安装路径如何定义？ → A: 参考 Vercel 方案：实际文件存储在 `~/.skill-market/skills/`，通过软链接到各工具官方目录（如 `.claude/skills/`），避免与 Vercel 的 `~/.agents/skills/` 冲突
- Q: 同一 skill 安装到多个工具时如何处理？ → A: 多选支持：交互时可多选工具，或 `--tool claude-code,codex` 逗号分隔，创建多个软链接

## Assumptions

- 注册表服务器 API 已经存在或将并行开发
- 默认注册表地址将在配置中预设
- skill 包格式为 tarball (.tgz)，与 npm 生态兼容
- 用户的 Node.js 版本 >= 18 LTS
