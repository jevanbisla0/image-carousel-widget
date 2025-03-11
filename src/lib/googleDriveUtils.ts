
/**
 * Utilities for fetching images from Google Drive
 */

interface GoogleDriveImage {
  id: string;
  name: string;
  thumbnailLink?: string;
}

/**
 * Convert a Google Drive file ID to a direct image URL
 */
export function getGoogleDriveImageUrl(fileId: string): string {
  // Using direct link format with export=view which is more reliable
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Extract the file ID from a Google Drive sharing URL
 */
export function extractGoogleDriveFileId(url: string): string | null {
  // Different patterns for Google Drive URLs
  const patterns = [
    /\/file\/d\/([^\/\?]+)/,  // /file/d/ URLs
    /id=([^&]+)/,            // ?id= parameter
    /\/folders\/([^\/\?]+)/, // folder URLs
    /^([a-zA-Z0-9_-]{25,}$)/ // Direct file ID (25+ chars of letters, numbers, hyphens, underscores)
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Additional check for direct file ID format
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
    return url;
  }
  
  return null;
}

/**
 * Process a list of Google Drive URLs or IDs and convert them to direct image URLs
 */
export function processGoogleDriveUrls(sources: string[]): string[] {
  return sources.map(source => {
    // Check if it's already a full URL
    if (source.startsWith('http')) {
      const fileId = extractGoogleDriveFileId(source);
      return fileId ? getGoogleDriveImageUrl(fileId) : source;
    }
    
    // Assume it's a file ID directly
    return getGoogleDriveImageUrl(source);
  });
}

/**
 * Fetch all image files from a Google Drive folder using localStorage
 */
export async function fetchImagesFromFolder(folderIdOrUrl: string): Promise<string[]> {
  if (!folderIdOrUrl || folderIdOrUrl.trim() === '') {
    console.log('No folder ID or URL provided');
    return [];
  }
  
  const folderId = folderIdOrUrl.startsWith('http') 
    ? extractGoogleDriveFileId(folderIdOrUrl) 
    : folderIdOrUrl;
    
  if (!folderId) {
    console.error('Invalid folder ID or URL:', folderIdOrUrl);
    return [];
  }
  
  try {
    const storedImages = localStorage.getItem(`drive_folder_${folderId}`);
    
    if (storedImages) {
      const imageIds = JSON.parse(storedImages);
      return processGoogleDriveUrls(imageIds);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching images from folder:', error);
    return [];
  }
}

/**
 * Store image IDs for a folder in localStorage
 */
export function storeImagesForFolder(folderId: string, imageIds: string[]): void {
  if (!folderId || folderId.trim() === '') {
    console.error('Cannot store images: No folder ID provided');
    return;
  }
  localStorage.setItem(`drive_folder_${folderId}`, JSON.stringify(imageIds));
}

/**
 * Clear stored images for a folder
 */
export function clearStoredImagesForFolder(folderId: string): void {
  if (!folderId || folderId.trim() === '') {
    return;
  }
  localStorage.removeItem(`drive_folder_${folderId}`);
}
