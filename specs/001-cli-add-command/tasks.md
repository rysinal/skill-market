# Tasks: CLI Add Command

**Input**: Design documents from `/specs/001-cli-add-command/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are included as the constitution requires 80% coverage and CLI integration tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `packages/cli/src/`, `packages/shared/src/`
- Tests: `packages/cli/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create monorepo structure with packages/cli and packages/shared directories
- [ ] T002 Initialize root package.json with pnpm workspaces configuration
- [ ] T003 [P] Initialize packages/shared/package.json with TypeScript dependencies
- [ ] T004 [P] Initialize packages/cli/package.json with Commander.js, ora, inquirer, tar dependencies
- [ ] T005 [P] Create packages/shared/tsconfig.json with strict mode enabled
- [ ] T006 [P] Create packages/cli/tsconfig.json extending shared config
- [ ] T007 [P] Configure ESLint and Prettier in root directory
- [ ] T008 [P] Configure Vitest in packages/cli/vitest.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Create Skill type definition in packages/shared/src/types/skill.ts
- [ ] T010 [P] Create Tool type definition in packages/shared/src/types/tool.ts
- [ ] T011 [P] Create InstalledSkill type definition in packages/shared/src/types/installed-skill.ts
- [ ] T012 [P] Create GlobalManifest type definition in packages/shared/src/types/manifest.ts
- [ ] T013 [P] Create Config type definition in packages/shared/src/types/config.ts
- [ ] T014 Create packages/shared/src/index.ts exporting all types
- [ ] T015 Create built-in tools registry in packages/cli/src/services/tools.ts with claude-code, codex, antigravity mappings
- [ ] T016 Create config loader in packages/cli/src/utils/config.ts supporting .skillrc, env vars, and defaults
- [ ] T017 Create CLI entry point in packages/cli/src/index.ts with Commander.js setup
- [ ] T018 Create bin entry in packages/cli/package.json pointing to dist/index.js

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Install a Skill by Name (Priority: P1) 🎯 MVP

**Goal**: 用户可以通过 `npx skill-market add <skill>` 安装 skill 到目标工具

**Independent Test**: 运行 `npx skill-market add my-skill --tool claude-code` 验证 skill 文件出现在 `~/.skill-market/skills/` 和 `.claude/skills/` 软链接

### Tests for User Story 1

- [ ] T019 [P] [US1] Create unit test for registry client in packages/cli/tests/services/registry.test.ts
- [ ] T020 [P] [US1] Create unit test for checksum verification in packages/cli/tests/utils/checksum.test.ts
- [ ] T021 [P] [US1] Create unit test for symlink operations in packages/cli/tests/utils/symlink.test.ts
- [ ] T022 [P] [US1] Create unit test for manifest operations in packages/cli/tests/services/manifest.test.ts
- [ ] T023 [US1] Create E2E test for add command in packages/cli/tests/e2e/add.test.ts

### Implementation for User Story 1

- [ ] T024 [P] [US1] Implement SHA256 checksum utility in packages/cli/src/utils/checksum.ts
- [ ] T025 [P] [US1] Implement cross-platform symlink utility in packages/cli/src/utils/symlink.ts
- [ ] T026 [US1] Implement registry API client in packages/cli/src/services/registry.ts (fetch skill info, download tarball)
- [ ] T027 [US1] Implement manifest service in packages/cli/src/services/manifest.ts (read/write ~/.skill-market/manifest.json)
- [ ] T028 [US1] Implement installer service in packages/cli/src/services/installer.ts (download, extract, link)
- [ ] T029 [US1] Implement interactive tool selector using inquirer in packages/cli/src/commands/add.ts
- [ ] T030 [US1] Implement add command with --tool, --force, --registry options in packages/cli/src/commands/add.ts
- [ ] T031 [US1] Add version parsing support (skill@version syntax) in packages/cli/src/commands/add.ts
- [ ] T032 [US1] Add multi-tool support (--tool claude-code,codex) in packages/cli/src/commands/add.ts
- [ ] T033 [US1] Add --tool all option support in packages/cli/src/commands/add.ts

**Checkpoint**: User Story 1 完成 - 可以独立测试基本安装功能

---

## Phase 4: User Story 2 - View Installation Progress (Priority: P2)

**Goal**: 用户在安装过程中看到进度信息和状态反馈

**Independent Test**: 运行安装命令观察终端输出，验证显示下载进度、校验状态、成功消息

### Tests for User Story 2

- [ ] T034 [P] [US2] Create unit test for progress display in packages/cli/tests/utils/progress.test.ts
- [ ] T035 [P] [US2] Create unit test for JSON output formatter in packages/cli/tests/utils/output.test.ts

### Implementation for User Story 2

- [ ] T036 [P] [US2] Create progress display utility using ora and cli-progress in packages/cli/src/utils/progress.ts
- [ ] T037 [P] [US2] Create output formatter supporting human/JSON modes in packages/cli/src/utils/output.ts
- [ ] T038 [US2] Integrate progress display into installer service in packages/cli/src/services/installer.ts
- [ ] T039 [US2] Add --json flag support to add command in packages/cli/src/commands/add.ts
- [ ] T040 [US2] Add --no-progress flag support in packages/cli/src/commands/add.ts

**Checkpoint**: User Story 2 完成 - 安装过程有完整的进度反馈

---

## Phase 5: User Story 3 - Handle Offline/Error Scenarios (Priority: P3)

**Goal**: 安装失败时显示清晰的错误信息和解决建议

**Independent Test**: 在离线状态或使用不存在的 skill 名称运行命令，验证错误信息清晰度

### Tests for User Story 3

- [ ] T041 [P] [US3] Create unit test for error handling in packages/cli/tests/utils/errors.test.ts
- [ ] T042 [US3] Create E2E test for error scenarios in packages/cli/tests/e2e/errors.test.ts

### Implementation for User Story 3

- [ ] T043 [US3] Create custom error classes (NetworkError, NotFoundError, ChecksumError, PermissionError) in packages/cli/src/utils/errors.ts
- [ ] T044 [US3] Implement error message formatter with suggestions in packages/cli/src/utils/errors.ts
- [ ] T045 [US3] Add network error handling with retry logic in packages/cli/src/services/registry.ts
- [ ] T046 [US3] Add checksum verification failure handling with auto-retry in packages/cli/src/services/installer.ts
- [ ] T047 [US3] Add cleanup logic for partial downloads in packages/cli/src/services/installer.ts
- [ ] T048 [US3] Implement exit codes per CLI contract in packages/cli/src/commands/add.ts

**Checkpoint**: User Story 3 完成 - 错误处理完善

---

## Phase 6: Update Command (Extension)

**Goal**: 支持 `npx skill-market update` 命令更新已安装的 skills

**Independent Test**: 安装旧版本 skill 后运行 update 命令，验证更新到最新版本

### Tests for Update Command

- [ ] T049 [P] Create unit test for update logic in packages/cli/tests/commands/update.test.ts
- [ ] T050 Create E2E test for update command in packages/cli/tests/e2e/update.test.ts

### Implementation for Update Command

- [ ] T051 Implement version comparison logic in packages/cli/src/services/installer.ts
- [ ] T052 Implement update command with --all, --dry-run options in packages/cli/src/commands/update.ts
- [ ] T053 Add version diff display before update in packages/cli/src/commands/update.ts
- [ ] T054 Register update command in CLI entry point packages/cli/src/index.ts

**Checkpoint**: Update 命令完成

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T055 [P] Add list command in packages/cli/src/commands/list.ts
- [ ] T056 [P] Add remove command in packages/cli/src/commands/remove.ts
- [ ] T057 Register list and remove commands in packages/cli/src/index.ts
- [ ] T058 [P] Add --help documentation for all commands
- [ ] T059 [P] Add --version flag support in packages/cli/src/index.ts
- [ ] T060 Create README.md with installation and usage instructions
- [ ] T061 Run full test suite and verify 80% coverage threshold
- [ ] T062 Build and test npx execution locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP, must complete first
- **User Story 2 (Phase 4)**: Depends on US1 core implementation (T028)
- **User Story 3 (Phase 5)**: Depends on US1 core implementation (T026, T028)
- **Update Command (Phase 6)**: Depends on US1 completion
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

```text
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Install) ←── MVP Checkpoint
    ↓
┌───┴───┐
↓       ↓
Phase 4  Phase 5
(US2)    (US3)
    ↓
Phase 6 (Update)
    ↓
Phase 7 (Polish)
```

### Parallel Opportunities

**Phase 1 - Setup**:
```text
T003, T004, T005, T006, T007, T008 can run in parallel
```

**Phase 2 - Foundational**:
```text
T009, T010, T011, T012, T013 can run in parallel (type definitions)
```

**Phase 3 - US1 Tests**:
```text
T019, T020, T021, T022 can run in parallel
```

**Phase 3 - US1 Implementation**:
```text
T024, T025 can run in parallel (utilities)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test `npx skill-market add` independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP Ready!**
3. Add User Story 2 → Progress display working
4. Add User Story 3 → Error handling complete
5. Add Update Command → Full feature set
6. Polish → Production ready

---

## Task Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Setup | 8 | 6 |
| Foundational | 10 | 5 |
| US1 (Install) | 15 | 8 |
| US2 (Progress) | 7 | 4 |
| US3 (Errors) | 8 | 2 |
| Update | 6 | 2 |
| Polish | 8 | 5 |
| **Total** | **62** | **32** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
