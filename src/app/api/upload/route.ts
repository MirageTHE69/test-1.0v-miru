import { NextResponse } from 'next/server';
import { saveUpload } from '@/lib/uploads';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();

    // Generate unique filename to avoid collision
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedFilename}`;

    await saveUpload(filename, bytes, file.type || 'application/octet-stream');

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Make sure the file size is reasonable and type is supported.' },
      { status: 500 }
    );
  }
}
