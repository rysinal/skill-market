# Registry API Contract

**Version**: 1.0.0
**Base URL**: `{REGISTRY_URL}/api/v1`

## Endpoints

### GET /skills

列出所有可用的 skills。

**Request**:
```http
GET /api/v1/skills?page=1&limit=20&search=code
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | 页码，默认 1 |
| limit | integer | No | 每页数量，默认 20，最大 100 |
| search | string | No | 搜索关键词 |

**Response** (200 OK):
```json
{
  "data": [
    {
      "name": "code-review",
      "version": "2.1.0",
      "description": "Automated code review skill",
      "author": { "name": "John Doe" },
      "keywords": ["code", "review", "quality"],
      "publishedAt": "2026-01-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

### GET /skills/:name

获取指定 skill 的详情（最新版本）。

**Request**:
```http
GET /api/v1/skills/code-review
```

**Response** (200 OK):
```json
{
  "name": "code-review",
  "version": "2.1.0",
  "description": "Automated code review skill",
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "checksum": "sha256:abc123def456789...",
  "dependencies": {},
  "keywords": ["code", "review", "quality"],
  "publishedAt": "2026-01-30T10:00:00Z",
  "tarballUrl": "https://registry.example.com/api/v1/skills/code-review/2.1.0/download",
  "versions": ["2.1.0", "2.0.0", "1.0.0"]
}
```

**Response** (404 Not Found):
```json
{
  "error": {
    "code": "SKILL_NOT_FOUND",
    "message": "Skill 'unknown-skill' not found",
    "suggestions": ["code-review", "code-helper"]
  }
}
```

---

### GET /skills/:name/:version

获取指定版本的 skill 详情。

**Request**:
```http
GET /api/v1/skills/code-review/2.0.0
```

**Response** (200 OK):
```json
{
  "name": "code-review",
  "version": "2.0.0",
  "description": "Automated code review skill",
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "checksum": "sha256:xyz789...",
  "dependencies": {},
  "keywords": ["code", "review", "quality"],
  "publishedAt": "2026-01-15T10:00:00Z",
  "tarballUrl": "https://registry.example.com/api/v1/skills/code-review/2.0.0/download"
}
```

**Response** (404 Not Found):
```json
{
  "error": {
    "code": "VERSION_NOT_FOUND",
    "message": "Version '9.9.9' not found for skill 'code-review'",
    "availableVersions": ["2.1.0", "2.0.0", "1.0.0"]
  }
}
```

---

### GET /skills/:name/:version/download

下载指定版本的 skill tarball。

**Request**:
```http
GET /api/v1/skills/code-review/2.1.0/download
```

**Response** (200 OK):
- Content-Type: `application/gzip`
- Content-Disposition: `attachment; filename="code-review-2.1.0.tgz"`
- X-Checksum: `sha256:abc123def456789...`

**Response** (404 Not Found):
```json
{
  "error": {
    "code": "DOWNLOAD_NOT_FOUND",
    "message": "Download not available"
  }
}
```

---

## Error Response Format

所有错误响应遵循统一格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "suggestions": []
  }
}
```

**Error Codes**:
| Code | HTTP Status | Description |
|------|-------------|-------------|
| SKILL_NOT_FOUND | 404 | Skill 不存在 |
| VERSION_NOT_FOUND | 404 | 版本不存在 |
| DOWNLOAD_NOT_FOUND | 404 | 下载不可用 |
| INVALID_REQUEST | 400 | 请求参数无效 |
| RATE_LIMITED | 429 | 请求过于频繁 |
| SERVER_ERROR | 500 | 服务器内部错误 |

---

## Headers

**Request Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| User-Agent | Yes | CLI 版本标识，如 `skill-market-cli/1.0.0` |
| Accept | No | 默认 `application/json` |

**Response Headers**:
| Header | Description |
|--------|-------------|
| X-RateLimit-Limit | 速率限制上限 |
| X-RateLimit-Remaining | 剩余请求次数 |
| X-RateLimit-Reset | 重置时间戳 |
