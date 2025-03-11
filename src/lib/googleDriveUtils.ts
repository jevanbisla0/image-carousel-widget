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
  // Using a more reliable format for Google Drive images
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
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
  
  // Pattern for folder URLs
  const folderPattern = /\/folders\/([^\/\?]+)/;
  const folderMatch = url.match(folderPattern);
  
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
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
 * Fetch all image files from a Google Drive folder
 * Note: This requires a Google Drive API key and OAuth setup in a production environment
 * For demo purposes, we'll use a simpler approach with direct file IDs
 */
export async function fetchImagesFromFolder(folderIdOrUrl: string): Promise<string[]> {
  // In a real implementation, we would use the Google Drive API
  // For this demo, we'll simulate fetching by using a pre-defined list of images
  
  // Extract folder ID if a URL was provided
  const folderId = folderIdOrUrl.startsWith('http') 
    ? extractGoogleDriveFileId(folderIdOrUrl) 
    : folderIdOrUrl;
    
  if (!folderId) {
    console.error('Invalid folder ID or URL');
    return [];
  }
  
  try {
    // For a real implementation, you would use:
    // const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}`);
    
    // Instead, we'll use a mock API endpoint or localStorage to store and retrieve the images
    const storedImages = localStorage.getItem(`drive_folder_${folderId}`);
    
    if (storedImages) {
      const imageIds = JSON.parse(storedImages);
      console.log('Fetched stored images:', imageIds);
      return imageIds.map((id: string) => getGoogleDriveImageUrl(id));
    }
    
    // If no stored images, return an empty array (user will need to configure them)
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
  localStorage.setItem(`drive_folder_${folderId}`, JSON.stringify(imageIds));
}

/**
 * Clear stored images for a folder
 */
export function clearStoredImagesForFolder(folderId: string): void {
  localStorage.removeItem(`drive_folder_${folderId}`);
}
