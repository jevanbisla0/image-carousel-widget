/**
 * Google Drive image utility functions
 */

/**
 * Generates a thumbnail URL for a Google Drive image
 * @param fileId Google Drive file ID
 * @returns URL to the image thumbnail
 */
export function getGoogleDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * Extracts a file ID from various Google Drive URL formats
 * @param url The Google Drive URL or file ID
 * @returns The file ID or null if not found
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const cleanUrl = url.trim();
  
  // Common URL patterns
  const patterns = [
    /\/file\/d\/([^\/\?]+)/,  // /file/d/ URLs
    /id=([^&]+)/,            // ?id= parameter
    /\/folders\/([^\/\?]+)/, // folder URLs
  ];
  
  // Try to match against known patterns
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match?.[1]) return match[1];
  }
  
  // Check if it's already a direct file ID
  if (/^[a-zA-Z0-9_-]{25,}$/.test(cleanUrl)) return cleanUrl;
  
  return null;
}

/**
 * Utilities for managing carousel images in localStorage
 */
export const imageStorage = {
  /**
   * Saves image IDs to localStorage
   * @param folderId The folder ID to use as a namespace
   * @param imageIds Array of image IDs to save
   */
  saveImages(folderId: string, imageIds: string[]): void {
    if (!folderId?.trim() || !Array.isArray(imageIds) || !imageIds.length) return;
    
    const storageKey = `drive_folder_${folderId.trim()}`;
    localStorage.setItem(storageKey, JSON.stringify(imageIds.filter(Boolean)));
  },
  
  /**
   * Removes stored images for a folder
   * @param folderId The folder ID to clear
   */
  clearImages(folderId: string): void {
    if (!folderId?.trim()) return;
    localStorage.removeItem(`drive_folder_${folderId.trim()}`);
  },
  
  /**
   * Loads image IDs from localStorage
   * @param folderId The folder ID to load from
   * @returns Array of image IDs
   */
  loadImages(folderId: string): string[] {
    if (!folderId?.trim()) return [];
    
    const storageKey = `drive_folder_${folderId.trim()}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) return [];
    
    try {
      const imageIds = JSON.parse(storedData);
      return Array.isArray(imageIds) ? imageIds.filter(Boolean) : [];
    } catch {
      localStorage.removeItem(storageKey);
      return [];
    }
  }
};
