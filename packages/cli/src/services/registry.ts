import type { Skill } from '@skill-market/shared';
import { request } from 'undici';

export interface RegistryClientOptions {
  baseUrl: string;
  timeout?: number;
}

export interface DownloadProgress {
  downloaded: number;
  total: number;
}

/**
 * Registry API client for fetching skill metadata and tarballs
 */
export class RegistryClient {
  private baseUrl: string;
  private timeout: number;

  constructor(options: RegistryClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.timeout = options.timeout ?? 30000;
  }

  /**
   * Get skill metadata
   */
  async getSkill(name: string, version?: string): Promise<Skill> {
    const versionPath = version ? `/${version}` : '';
    const url = `${this.baseUrl}/skills/${name}${versionPath}`;

    const response = await request(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      headersTimeout: this.timeout,
    });

    if (response.statusCode === 404) {
      throw new SkillNotFoundError(name, version);
    }

    if (response.statusCode !== 200) {
      throw new RegistryError(`Failed to fetch skill: ${response.statusCode}`);
    }

    return (await response.body.json()) as Skill;
  }

  /**
   * Download skill tarball to a file
   */
  async downloadTarball(
    skill: Skill,
    destPath: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const { createWriteStream } = await import('node:fs');
    const { pipeline } = await import('node:stream/promises');

    const response = await request(skill.tarballUrl, {
      method: 'GET',
      headersTimeout: this.timeout,
    });

    if (response.statusCode !== 200) {
      throw new RegistryError(`Failed to download tarball: ${response.statusCode}`);
    }

    const contentLength = response.headers['content-length'];
    const total = contentLength ? parseInt(String(contentLength), 10) : 0;
    let downloaded = 0;

    const writeStream = createWriteStream(destPath);

    if (onProgress && total > 0) {
      response.body.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        onProgress({ downloaded, total });
      });
    }

    await pipeline(response.body, writeStream);
  }

  /**
   * Check if registry is reachable
   */
  async ping(): Promise<boolean> {
    try {
      const response = await request(`${this.baseUrl}/health`, {
        method: 'GET',
        headersTimeout: 5000,
      });
      return response.statusCode === 200;
    } catch {
      return false;
    }
  }
}

/**
 * Error when skill is not found in registry
 */
export class SkillNotFoundError extends Error {
  constructor(
    public skillName: string,
    public version?: string
  ) {
    const versionStr = version ? `@${version}` : '';
    super(`Skill not found: ${skillName}${versionStr}`);
    this.name = 'SkillNotFoundError';
  }
}

/**
 * General registry error
 */
export class RegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistryError';
  }
}
