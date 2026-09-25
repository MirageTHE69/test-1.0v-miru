import { getStore } from '@netlify/blobs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// On Netlify the server filesystem is read-only, so uploads go to Netlify Blobs.
// Locally (npm run dev) there is no Blobs environment, so fall back to a disk folder.
const LOCAL_DIR = join(process.cwd(), '.uploads');

function blobStore() {
  try {
    return getStore({ name: 'uploads', consistency: 'strong' });
  } catch {
    return null;
  }
}

export async function saveUpload(filename: string, data: ArrayBuffer, contentType: string) {
  const store = blobStore();
  if (store) {
    await store.set(filename, data, { metadata: { contentType } });
    return;
  }
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(join(LOCAL_DIR, filename), Buffer.from(data));
}

export async function readUpload(filename: string) {
  const store = blobStore();
  if (store) {
    const result = await store.getWithMetadata(filename, { type: 'arrayBuffer' });
    if (!result) return null;
    return {
      data: result.data,
      contentType: (result.metadata.contentType as string) || 'application/octet-stream',
    };
  }
  try {
    const data = await readFile(join(LOCAL_DIR, filename));
    return { data, contentType: guessContentType(filename) };
  } catch {
    return null;
  }
}

function guessContentType(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
    csv: 'text/csv',
    txt: 'text/plain',
  };
  return (ext && types[ext]) || 'application/octet-stream';
}
