import { useState, useEffect } from "react";
import NotionCarousel from "@/components/NotionCarousel";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Save, Trash2, X, Info } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { extractGoogleDriveFileId, getGoogleDriveImageUrl, imageStorage } from "@/lib/googleDriveUtils";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn, UI_STYLES } from "@/lib/utils";
import { StorageOptions } from "@/lib/types";

// Storage constants
const STORAGE = {
  folderKey: "google_drive_folder_id",
  defaultFolder: "google_drive_images"
};

const Index = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [folderId, setFolderId] = useState(STORAGE.defaultFolder);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [tempImageId, setTempImageId] = useState("");
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const { toast } = useToast();

  // Load saved configuration on mount
  useEffect(() => {
    // Initialize from localStorage
    const storedFolderId = localStorage.getItem(STORAGE.folderKey) || STORAGE.defaultFolder;
    setFolderId(storedFolderId);
    
    // Load stored images
    const loadedIds = imageStorage.loadImages(storedFolderId);
    setImageIds(loadedIds);
    setCarouselImages(loadedIds.map(getGoogleDriveImageUrl));
    
    // Setup config panel toggle event
    const handleToggleConfig = () => setIsConfiguring(prev => !prev);
    window.addEventListener('toggleCarouselConfig', handleToggleConfig);
    return () => window.removeEventListener('toggleCarouselConfig', handleToggleConfig);
  }, []);

  // Event handlers
  const toggleConfigPanel = () => setIsConfiguring(prev => !prev);
  
  const handleAddImage = () => {
    const input = tempImageId.trim();
    if (!input) return;
    
    // Extract ID from URL or use direct ID
    const id = input.startsWith('http') ? extractGoogleDriveFileId(input) || "" : input;
    
    if (!id) {
      toast({
        title: "Invalid image ID or URL",
        variant: "destructive"
      });
      return;
    }
    
    if (imageIds.includes(id)) {
      toast({
        title: "Duplicate image",
        variant: "destructive"
      });
      return;
    }
    
    setImageIds(prev => [...prev, id]);
    setTempImageId("");
    toast({ title: "Image added" });
  };
  
  const handleSaveConfig = () => {
    if (!imageIds.length) {
      toast({
        title: "No images added",
        description: "Please add at least one image before saving.",
        variant: "destructive"
      });
      return;
    }

    // Save config to localStorage
    localStorage.setItem(STORAGE.folderKey, folderId.trim() || STORAGE.defaultFolder);
    imageStorage.saveImages(folderId, imageIds);
    
    // Update carousel
    setCarouselImages(imageIds.map(getGoogleDriveImageUrl));
    setIsConfiguring(false);
    
    toast({ title: "Configuration saved" });
  };

  const handleRemoveImage = (index: number) => setImageIds(prev => prev.filter((_, i) => i !== index));
  
  const handleClearAllImages = () => {
    setImageIds([]);
    imageStorage.clearImages(folderId);
    setCarouselImages([]);
    toast({ title: "All images cleared" });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => e.key === 'Enter' && handleAddImage();

  return (
    <div className="notion-container">
      {/* Image Carousel */}
      <NotionCarousel 
        images={carouselImages} 
        className="notion-container"
        height={480}
        onConfigureClick={toggleConfigPanel}
      />

      {/* Configuration Panel */}
      {isConfiguring && (
        <div className="mt-4">
          <div className={cn("max-w-[800px] mx-auto p-5 rounded-xl", UI_STYLES.actionBar)}>
            <div className="space-y-5">
              {/* Instructions */}
              <Alert className="bg-blue-50 border-blue-200 text-left">
                <Info className="text-blue-800 h-5 w-5" />
                <AlertTitle className="text-blue-800 font-medium">Configure Images</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Add Google Drive image IDs or sharing URLs. Images must be shared with <strong>"Anyone with the link can view"</strong> permission.
                </AlertDescription>
              </Alert>
              
              {/* Image Input */}
              <div>
                <label htmlFor="image-input" className="text-sm font-medium mb-2 block text-left text-gray-700">
                  Add Google Drive Images
                </label>
                <div className="flex gap-2">
                  <Input
                    id="image-input"
                    placeholder="Paste Google Drive image ID or URL"
                    value={tempImageId}
                    onChange={(e) => setTempImageId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-white border-gray-300"
                    maxLength={200}
                  />
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={handleAddImage}
                    className={UI_STYLES.button.primary}
                    aria-label="Add image"
                  >
                    <Plus className={UI_STYLES.iconSize} />
                  </Button>
                </div>
              </div>

              {/* Image List */}
              <div className="space-y-3">
                <div className="text-sm font-medium flex justify-between items-center text-gray-700">
                  <span>Selected Images ({imageIds.length})</span>
                  {imageIds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllImages}
                      className={cn(UI_STYLES.button.danger, "h-7 px-2")}
                    >
                      <Trash2 className={UI_STYLES.iconSizeSmall} />
                      <span className="ml-1">Clear All</span>
                    </Button>
                  )}
                </div>
                
                {imageIds.length > 0 ? (
                  <ul className="space-y-2">
                    {imageIds.map((id, index) => (
                      <li key={index} className="bg-white flex items-center justify-between p-2 rounded border border-gray-200">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 text-xs">
                            {index + 1}
                          </span>
                          <span className="truncate text-sm">
                            {id.length > 30 ? `${id.substring(0, 30)}...` : id}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => window.open(getGoogleDriveImageUrl(id), '_blank')}
                            aria-label="View image"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn("h-6 w-6", UI_STYLES.button.danger)}
                            onClick={() => handleRemoveImage(index)}
                            aria-label="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 p-4 bg-gray-50 border border-gray-200 rounded-md">
                    No images added. Add images above to configure your carousel.
                  </p>
                )}
              </div>

              {/* Save Button */}
              {imageIds.length > 0 && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={handleSaveConfig}
                    className={UI_STYLES.button.primary}
                  >
                    <Save className={UI_STYLES.iconSize} />
                    <span className="ml-2">Save Configuration</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
