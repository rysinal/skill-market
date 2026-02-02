import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

/**
 * Calculate SHA256 checksum of a file
 */
export async function calculateChecksum(filepath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filepath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Verify file checksum matches expected value
 */
export async function verifyChecksum(filepath: string, expected: string): Promise<boolean> {
  const actual = await calculateChecksum(filepath);
  return actual === expected;
}
