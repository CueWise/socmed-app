import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');

export async function ensureUploadsDir() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

export async function saveBase64Image(base64Data: string, filename: string): Promise<string> {
  await ensureUploadsDir();
  
  // Remove data URL prefix if present
  const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Generate unique filename
  const timestamp = Date.now();
  const extension = filename.split('.').pop() || 'jpg';
  const uniqueFilename = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
  
  const filePath = path.join(uploadsDir, uniqueFilename);
  
  // Save the file
  await fs.writeFile(filePath, base64Image, 'base64');
  
  // Return the public URL
  return `/uploads/${uniqueFilename}`;
}

export async function saveBlobAsImage(blobUrl: string, sessionId: string): Promise<string> {
  // For now, return a working demo image URL since we can't access blob URLs server-side
  // In production, this would involve proper file upload handling
  const imageIndex = Math.floor(Math.random() * 6) + 1;
  return `https://picsum.photos/400/300?random=${imageIndex}`;
}