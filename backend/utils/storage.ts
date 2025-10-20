import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  
  const subDirs = ['avatars', 'properties', 'documents', 'banners', 'temp'];
  for (const dir of subDirs) {
    const subDirPath = path.join(UPLOAD_DIR, dir);
    if (!existsSync(subDirPath)) {
      await mkdir(subDirPath, { recursive: true });
    }
  }
}

export function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

export function validateImage(file: { size: number; type: string }) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
  
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed');
  }
}

export async function saveFile(
  buffer: Buffer,
  filename: string,
  subDir: string = 'temp'
): Promise<string> {
  await ensureUploadDir();
  
  const filePath = path.join(UPLOAD_DIR, subDir, filename);
  await writeFile(filePath, buffer);
  
  return `/uploads/${subDir}/${filename}`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const relativePath = fileUrl.replace('/uploads/', '');
    const filePath = path.join(UPLOAD_DIR, relativePath);
    
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

export async function readFileBuffer(fileUrl: string): Promise<Buffer> {
  const relativePath = fileUrl.replace('/uploads/', '');
  const filePath = path.join(UPLOAD_DIR, relativePath);
  return await readFile(filePath);
}

export function getFileUrl(relativePath: string, baseUrl: string): string {
  return `${baseUrl}${relativePath}`;
}
