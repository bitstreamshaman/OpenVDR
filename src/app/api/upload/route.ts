// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'nextjs-uploads';

// Ensure bucket exists
async function ensureBucketExists() {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, process.env.MINIO_REGION || 'us-east-1');
      console.log(`Bucket '${bucketName}' created successfully`);
      
      // Set bucket policy to public if needed
      if (process.env.MINIO_PUBLIC_BUCKET === 'true') {
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      }
    }
  } catch (err) {
    console.error('Error ensuring bucket exists:', err);
    throw err;
  }
}

// Get URL for file
async function getFileUrl(objectName: string): Promise<string> {
  if (process.env.MINIO_PUBLIC_URL) {
    // If you have a public URL configured
    return `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;
  } else {
    // Generate a presigned URL that expires in 7 days (or configure as needed)
    return await minioClient.presignedGetObject(bucketName, objectName, 7 * 24 * 60 * 60);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the bucket exists
    await ensureBucketExists();

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filePath = formData.get('filePath') as string || '';
    
    if (!file) {
      return NextResponse.json({
        message: 'No file uploaded'
      }, { status: 400 });
    }

    // Extract base filename and extension
    const fileBaseName = path.basename(file.name, path.extname(file.name));
    const fileExtension = path.extname(file.name);
    
    // Determine the object name in MinIO
    let objectName = '';
    
    if (filePath) {
      // For folder uploads, preserve the exact folder structure
      // Just use the original path and filename directly
      objectName = filePath;
    } else {
      // For individual file uploads without a path, just use the filename
      objectName = file.name;
    }
    
    // If file conflicts could occur, you can optionally add some uniqueness
    // to the filename while preserving the path structure:
    // const uniqueSuffix = `_${Date.now().toString(36)}`;
    // objectName = objectName.replace(fileExtension, `${uniqueSuffix}${fileExtension}`);
    
    // Set metadata
    const metaData = {
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Length': file.size.toString(),
      'Original-Name': file.name,
      'Original-Path': filePath || '',
      'Upload-Date': new Date().toISOString(),
    };

    // Upload directly to MinIO without saving to local filesystem
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    await minioClient.putObject(
      bucketName,
      objectName,
      fileBuffer,
      file.size,
      metaData
    );

    // Generate the URL to access the file
    const fileUrl = await getFileUrl(objectName);

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: file.name,
      filePath: filePath || null,
      objectName: objectName,
      url: fileUrl,
      size: file.size,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      message: 'Error uploading file',
      error: error.message,
    }, { status: 500 });
  }
}