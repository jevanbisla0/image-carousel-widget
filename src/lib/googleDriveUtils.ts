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

// URL parameter storage mechanism for sharing
export const urlStorage = {
  // Get images from URL query parameters
  getImagesFromUrl: (): string[] => {
    const urlParams = new URLSearchParams(window.location.search);
    const imagesParam = urlParams.get('images');
    return imagesParam ? imagesParam.split(',').filter(Boolean) : [];
  },
  
  // Generate a URL with image IDs as parameters
  generateUrlWithImages: (imageIds: string[]): string => {
    if (!imageIds.length) return window.location.pathname;
    
    const baseUrl = window.location.origin + window.location.pathname;
    const queryParams = new URLSearchParams();
    queryParams.set('images', imageIds.join(','));
    
    return `${baseUrl}?${queryParams.toString()}`;
  }
};
