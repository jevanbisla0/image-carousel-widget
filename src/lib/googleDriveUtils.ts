
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
 * Note: This only works for files that have been shared with "Anyone with the link"
 */
export function getGoogleDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Extract the file ID from a Google Drive sharing URL
 * Handles URLs like:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 */
export function extractGoogleDriveFileId(url: string): string | null {
  // Pattern for /file/d/ URLs
  const filePattern = /\/file\/d\/([^\/]+)/;
  const fileMatch = url.match(filePattern);
  
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }
  
  // Pattern for ?id= URLs
  const idPattern = /[?&]id=([^&]+)/;
  const idMatch = url.match(idPattern);
  
  if (idMatch && idMatch[1]) {
    return idMatch[1];
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
