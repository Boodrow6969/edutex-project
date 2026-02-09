import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Interface for file storage operations.
 * Implementations can target local disk, S3, etc.
 */
export interface StorageService {
  /** Store a file and return its storage key */
  store(buffer: Buffer, originalFilename: string): Promise<string>;
  /** Get the absolute file path for a storage key */
  getFilePath(storageKey: string): string;
  /** Delete a file by storage key */
  delete(storageKey: string): Promise<void>;
}

/**
 * Sanitize a filename: keep alphanumeric, hyphens, underscores, dots.
 * Truncate to 100 chars to avoid path length issues.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
}

/**
 * Local filesystem storage service.
 * Stores files under uploads/{YYYY}/{MM}/{uuid}-{sanitized-name}
 */
export class LocalStorageService implements StorageService {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? path.join(process.cwd(), 'uploads');
  }

  async store(buffer: Buffer, originalFilename: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const sanitized = sanitizeFilename(originalFilename);

    const storageKey = `${year}/${month}/${uuid}-${sanitized}`;
    const fullPath = path.join(this.baseDir, storageKey);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);

    return storageKey;
  }

  getFilePath(storageKey: string): string {
    return path.join(this.baseDir, storageKey);
  }

  async delete(storageKey: string): Promise<void> {
    const fullPath = path.join(this.baseDir, storageKey);
    try {
      await fs.unlink(fullPath);
    } catch (err: unknown) {
      // Ignore ENOENT — file already gone
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw err;
    }
  }
}
