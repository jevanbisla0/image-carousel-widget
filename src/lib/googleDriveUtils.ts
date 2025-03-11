
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
  // Use the view URL format instead of export=download
  // This is more reliable for images set to "Anyone with the link can view"
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Extract the file ID from a Google Drive sharing URL
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Clean the URL (remove trailing spaces, etc)
  const cleanUrl = url.trim();
  console.log('Extracting file ID from URL:', cleanUrl);
  
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
      console.log('Extracted file ID:', match[1], 'using pattern:', pattern);
      return match[1];
    }
  }
  
  // Additional check for direct file ID format 
  // (outside the loop to avoid duplicate check)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(cleanUrl)) {
    console.log('Extracted direct file ID:', cleanUrl);
    return cleanUrl;
  }
  
  console.log('Could not extract file ID from:', cleanUrl);
  return null;
}

/**
 * Process a list of Google Drive URLs or IDs and convert them to direct image URLs
 */
export function processGoogleDriveUrls(sources: string[]): string[] {
  if (!sources || !Array.isArray(sources)) {
    console.log('Invalid sources provided to processGoogleDriveUrls:', sources);
    return [];
  }
  
  console.log('Processing URLs:', sources);
  
  const processed = sources.map(source => {
    if (!source || typeof source !== 'string') {
      console.log('Skipping invalid source:', source);
      return '';
    }
    
    const cleanSource = source.trim();
    
    // Check if it's already a full URL
    if (cleanSource.startsWith('http')) {
      const fileId = extractGoogleDriveFileId(cleanSource);
      if (!fileId) {
        console.log('Could not extract file ID from URL:', cleanSource);
        return '';
      }
      console.log('Extracted file ID:', fileId, 'from URL:', cleanSource);
      return getGoogleDriveImageUrl(fileId);
    }
    
    // Assume it's a file ID directly
    console.log('Using direct file ID:', cleanSource);
    return getGoogleDriveImageUrl(cleanSource);
  }).filter(url => url !== '');
  
  console.log('Processed URLs:', processed);
  return processed;
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
  
  console.log('Fetching images for folder ID:', folderId);
  
  try {
    const storedImagesKey = `drive_folder_${folderId}`;
    const storedImages = localStorage.getItem(storedImagesKey);
    
    if (storedImages) {
      try {
        const imageIds = JSON.parse(storedImages);
        if (Array.isArray(imageIds) && imageIds.length > 0) {
          console.log('Found stored images:', imageIds);
          return processGoogleDriveUrls(imageIds);
        } else {
          console.log('Stored images array is empty or invalid');
        }
      } catch (parseError) {
        console.error('Error parsing stored images:', parseError);
        // Clear invalid data
        localStorage.removeItem(storedImagesKey);
      }
    } else {
      console.log('No stored images found for folder ID:', folderId);
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
  if (!folderId || typeof folderId !== 'string' || folderId.trim() === '') {
    console.error('Cannot store images: Invalid folder ID');
    return;
  }
  
  if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    console.error('Cannot store images: Invalid or empty image IDs array');
    return;
  }
  
  // Clean the image IDs (trim whitespace, remove empty strings)
  const cleanedIds = imageIds
    .map(id => typeof id === 'string' ? id.trim() : '')
    .filter(id => id !== '');
  
  if (cleanedIds.length === 0) {
    console.error('All image IDs were invalid or empty');
    return;
  }
  
  try {
    const storageKey = `drive_folder_${folderId.trim()}`;
    localStorage.setItem(storageKey, JSON.stringify(cleanedIds));
    console.log('Stored images for folder:', folderId, cleanedIds);
  } catch (error) {
    console.error('Error storing images:', error);
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
  console.log('Cleared stored images for folder:', folderId);
}
