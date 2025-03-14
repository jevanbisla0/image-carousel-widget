/**
 * Utilities for fetching images from Google Drive
 */

/**
 * Convert a Google Drive file ID to a direct image URL
 */
export function getGoogleDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * Extract the file ID from a Google Drive sharing URL
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const cleanUrl = url.trim();
  
  // Different patterns for Google Drive URLs
  const patterns = [
    /\/file\/d\/([^\/\?]+)/,  // /file/d/ URLs
    /id=([^&]+)/,            // ?id= parameter
    /\/folders\/([^\/\?]+)/, // folder URLs
    /^([a-zA-Z0-9_-]{25,})$/ // Direct file ID
  ];
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Additional check for direct file ID format
  if (/^[a-zA-Z0-9_-]{25,}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  
  return null;
}

/**
 * Fetch all image files from a Google Drive folder using localStorage
 */
export async function fetchImagesFromFolder(folderIdOrUrl: string): Promise<string[]> {
  if (!folderIdOrUrl || folderIdOrUrl.trim() === '') {
    return [];
  }
  
  const folderId = folderIdOrUrl.startsWith('http') 
    ? extractGoogleDriveFileId(folderIdOrUrl) 
    : folderIdOrUrl;
    
  if (!folderId) {
    return [];
  }
  
  try {
    const storedImagesKey = `drive_folder_${folderId}`;
    const storedImages = localStorage.getItem(storedImagesKey);
    
    if (storedImages) {
      try {
        const imageIds = JSON.parse(storedImages);
        if (Array.isArray(imageIds) && imageIds.length > 0) {
          return imageIds.map(id => getGoogleDriveImageUrl(id));
        }
      } catch (parseError) {
        // Clear invalid data
        localStorage.removeItem(storedImagesKey);
      }
    }
    
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Store image IDs for a folder in localStorage
 */
export function storeImagesForFolder(folderId: string, imageIds: string[]): void {
  if (!folderId || typeof folderId !== 'string' || folderId.trim() === '') {
    return;
  }
  
  if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    return;
  }
  
  // Clean the image IDs
  const cleanedIds = imageIds
    .map(id => typeof id === 'string' ? id.trim() : '')
    .filter(id => id !== '');
  
  if (cleanedIds.length === 0) {
    return;
  }
  
  try {
    const storageKey = `drive_folder_${folderId.trim()}`;
    localStorage.setItem(storageKey, JSON.stringify(cleanedIds));
  } catch (error) {
    // Silent fail
  }
}

/**
 * Clear stored images for a folder
 */
export function clearStoredImagesForFolder(folderId: string): void {
  if (!folderId || folderId.trim() === '') {
    return;
  }
  localStorage.removeItem(`drive_folder_${folderId.trim()}`);
}
