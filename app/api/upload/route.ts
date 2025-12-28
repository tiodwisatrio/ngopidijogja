import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Auto-resize and optimize large images
    // Max width: 2560px (2K resolution), quality: 95%
    let sharpInstance = sharp(buffer)
      .resize(2560, 2560, {
        fit: 'inside',
        withoutEnlargement: true,
      });

    // Output based on original file type
    if (file.type === 'image/png') {
      sharpInstance = sharpInstance.png({ quality: 95, compressionLevel: 6 });
    } else {
      sharpInstance = sharpInstance.jpeg({ quality: 95, progressive: true });
    }

    const optimizedBuffer = await sharpInstance.toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;

    // Upload to Vercel Blob
    const blob = await put(filename, optimizedBuffer, {
      access: 'public',
      contentType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    });

    return NextResponse.json(
      { imageUrl: blob.url, filename },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: String(error) },
      { status: 500 }
    );
  }
}
