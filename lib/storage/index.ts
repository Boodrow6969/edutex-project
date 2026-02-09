export type { StorageService } from './storage-service';
export { LocalStorageService } from './storage-service';

import { LocalStorageService } from './storage-service';

/** Singleton storage service instance */
export const storageService = new LocalStorageService();
