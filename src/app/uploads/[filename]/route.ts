import { readUpload } from '@/lib/uploads';

export async function GET(_request: Request, ctx: { params: Promise<{ filename: string }> }) {
  const { filename } = await ctx.params;

  const file = await readUpload(filename);
  if (!file) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
