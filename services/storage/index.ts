/**
 * Object-storage seam (Supabase Storage). Documented port only; the concrete
 * implementation is wired when evidence/document upload lands (P4+).
 */
export interface StoredObject {
  readonly path: string;
  readonly url: string;
}

export interface StoragePort {
  upload(path: string, data: Blob): Promise<StoredObject>;
  remove(path: string): Promise<void>;
}
