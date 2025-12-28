import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

// Configure route to accept larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Auto-resize and optimize large images
    // Max width: 2560px (2K resolution), quality: 95%
    // This prevents huge images (6000x4000) from causing quality degradation
    let sharpInstance = sharp(buffer)
      .resize(2560, 2560, {
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true, // Don't upscale small images
      });

    // Output based on original file type
    if (file.type === 'image/png') {
      sharpInstance = sharpInstance.png({ quality: 95, compressionLevel: 6 });
    } else {
      // Default to JPEG for all other images (jpg, webp, etc)
      sharpInstance = sharpInstance.jpeg({ quality: 95, progressive: true });
    }

    const optimizedBuffer = await sharpInstance.toBuffer();

    // Write optimized file to disk
    await writeFile(filepath, optimizedBuffer);

    // Return the URL path
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json(
      { imageUrl, filename },
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
