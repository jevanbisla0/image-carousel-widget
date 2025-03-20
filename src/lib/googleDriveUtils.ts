/**
 * Google Drive image utility functions
 */

// Generate image URL from Google Drive file ID
export function getGoogleDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

// Extract file ID from various Google Drive URL formats
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const cleanUrl = url.trim();
  const patterns = [
    /\/file\/d\/([^\/\?]+)/,  // /file/d/ URLs
    /id=([^&]+)/,            // ?id= parameter
    /\/folders\/([^\/\?]+)/, // folder URLs
    /^([a-zA-Z0-9_-]{25,})$/ // Direct file ID
  ];
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match?.[1]) return match[1];
  }
  
  // Check for direct file ID format
  if (/^[a-zA-Z0-9_-]{25,}$/.test(cleanUrl)) return cleanUrl;
  
  return null;
}

// Manage image storage in localStorage
export const imageStorage = {
  // Save images for a folder
  saveImages: (folderId: string, imageIds: string[]): void => {
    if (!folderId?.trim() || !Array.isArray(imageIds) || imageIds.length === 0) return;
    
    const cleanedIds = imageIds
      .map(id => typeof id === 'string' ? id.trim() : '')
      .filter(Boolean);
    
    if (cleanedIds.length === 0) return;
    
    const storageKey = `drive_folder_${folderId.trim()}`;
    localStorage.setItem(storageKey, JSON.stringify(cleanedIds));
  },
  
  // Clear images for a folder
  clearImages: (folderId: string): void => {
    if (!folderId?.trim()) return;
    localStorage.removeItem(`drive_folder_${folderId.trim()}`);
  },
  
  // Load images for a folder
  loadImages: (folderId: string): string[] => {
    if (!folderId?.trim()) return [];
    
    const storageKey = `drive_folder_${folderId.trim()}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) return [];
    
    try {
      const imageIds = JSON.parse(storedData);
      if (Array.isArray(imageIds) && imageIds.length > 0) {
        return imageIds.filter(id => typeof id === 'string' && id.trim());
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    
    return [];
  }
};
