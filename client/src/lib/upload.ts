export async function uploadFiles(files: File[]): Promise<{urls: string[], types: string[]}> {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to upload files');
  }

  const result = await response.json();
  return {
    urls: result.urls,
    types: result.types || []
  };
}

export function blobToFile(blobUrl: string, filename: string): Promise<File> {
  return fetch(blobUrl)
    .then(response => response.blob())
    .then(blob => new File([blob], filename, { type: blob.type }));
}

export async function convertBlobUrlsToFiles(mediaUrls: string[]): Promise<File[]> {
  const files: File[] = [];
  
  for (let i = 0; i < mediaUrls.length; i++) {
    const url = mediaUrls[i];
    if (url.startsWith('blob:')) {
      try {
        const file = await blobToFile(url, `image-${i + 1}.jpg`);
        files.push(file);
      } catch (error) {
        console.error('Failed to convert blob URL to file:', error);
      }
    }
  }
  
  return files;
}