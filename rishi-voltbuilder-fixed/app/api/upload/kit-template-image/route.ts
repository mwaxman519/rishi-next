import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/kit-templates');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const isReplit = process.env.REPLIT === '1';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process main image (resize to max 1200px width while maintaining aspect ratio)
    const processedImage = await sharp(buffer)
      .resize(1200, null, { 
        withoutEnlargement: true,
        fit: 'inside' 
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Process thumbnail (300x300 with cover fit)
    const thumbnailImage = await sharp(buffer)
      .resize(300, 300, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Generate unique filenames
    const fileExtension = '.jpg'; // Always use .jpg after processing
    const uniqueName = `kit-template-${uuidv4()}${fileExtension}`;
    const uniqueThumbnailName = `kit-template-thumb-${uuidv4()}${fileExtension}`;

    let imageUrl: string;
    let thumbnailUrl: string;

    // Use appropriate storage based on environment
    if (isProduction && (isVercel || isReplit)) {
      // Production/Staging: Use Vercel Blob Storage
      try {
        const [mainBlob, thumbBlob] = await Promise.all([
          put(uniqueName, processedImage, {
            access: 'public',
            contentType: 'image/jpeg',
          }),
          put(uniqueThumbnailName, thumbnailImage, {
            access: 'public',
            contentType: 'image/jpeg',
          })
        ]);

        imageUrl = mainBlob.url;
        thumbnailUrl = thumbBlob.url;
      } catch (blobError) {
        console.error('Blob storage error:', blobError);
        return NextResponse.json({ 
          error: 'Failed to upload to cloud storage. Please check BLOB_READ_WRITE_TOKEN.' 
        }, { status: 500 });
      }
    } else {
      // Development: Use local file storage
      await mkdir(UPLOAD_DIR, { recursive: true });
      
      const mainImagePath = path.join(UPLOAD_DIR, uniqueName);
      const thumbnailPath = path.join(UPLOAD_DIR, uniqueThumbnailName);

      await Promise.all([
        writeFile(mainImagePath, processedImage),
        writeFile(thumbnailPath, thumbnailImage)
      ]);

      imageUrl = `/uploads/kit-templates/${uniqueName}`;
      thumbnailUrl = `/uploads/kit-templates/${uniqueThumbnailName}`;
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      thumbnailUrl,
      originalName: file.name,
      size: file.size,
      type: file.type,
      environment: isProduction ? 'production' : 'development',
      storage: isProduction && (isVercel || isReplit) ? 'blob' : 'local'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image' 
    }, { status: 500 });
  }
}