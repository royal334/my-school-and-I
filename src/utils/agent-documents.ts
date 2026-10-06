import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/utils/supabase/admin';

export const AGENT_VERIFICATION_BUCKET = 'agent-verification-docs';
export const MAX_AGENT_DOCUMENT_SIZE = 5 * 1024 * 1024;

const ALLOWED_DOCUMENT_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function uploadAgentIdDocument(
  userId: string,
  file: File,
): Promise<string> {
  const extension = ALLOWED_DOCUMENT_TYPES[file.type];
  if (!extension) {
    throw new Error('ID document must be a PDF, JPEG, PNG, or WebP image.');
  }
  if (file.size <= 0 || file.size > MAX_AGENT_DOCUMENT_SIZE) {
    throw new Error('ID document must be smaller than 5 MB.');
  }

  const path = `${userId}/${randomUUID()}.${extension}`;
  const { error } = await createAdminClient()
    .storage
    .from(AGENT_VERIFICATION_BUCKET)
    .upload(path, new Uint8Array(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;
  return path;
}

export async function removeAgentIdDocument(path: string): Promise<void> {
  const { error } = await createAdminClient()
    .storage
    .from(AGENT_VERIFICATION_BUCKET)
    .remove([path]);

  if (error) throw error;
}
