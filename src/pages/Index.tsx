import { useState, useEffect } from "react";
import NotionCarousel from "@/components/NotionCarousel";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X, Info, Copy, Link } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { extractGoogleDriveFileId, getGoogleDriveImageUrl, urlStorage } from "@/lib/googleDriveUtils";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn, UI_STYLES } from "@/lib/utils";

const Index = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [tempImageId, setTempImageId] = useState("");
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [shareableUrl, setShareableUrl] = useState("");
  const { toast } = useToast();

  // Load configuration from URL parameters on mount
  useEffect(() => {
    const urlImageIds = urlStorage.getImagesFromUrl();
    
    if (urlImageIds.length > 0) {
      setImageIds(urlImageIds);
      setCarouselImages(urlImageIds.map(getGoogleDriveImageUrl));
      setShareableUrl(urlStorage.generateUrlWithImages(urlImageIds));
    }
    
    const handleToggleConfig = () => setIsConfiguring(prev => !prev);
    window.addEventListener('toggleCarouselConfig', handleToggleConfig);
    return () => window.removeEventListener('toggleCarouselConfig', handleToggleConfig);
  }, []);

  const toggleConfigPanel = () => setIsConfiguring(prev => !prev);
  
  const handleAddImage = () => {
    const input = tempImageId.trim();
    if (!input) return;
    
    const id = input.startsWith('http') ? extractGoogleDriveFileId(input) || "" : input;
    
    if (!id) {
      toast({ title: "Invalid image ID or URL", variant: "destructive" });
      return;
    }
    
    if (imageIds.includes(id)) {
      toast({ title: "Duplicate image", variant: "destructive" });
      return;
    }
    
    const updatedImageIds = [...imageIds, id];
    setImageIds(updatedImageIds);
    setCarouselImages(updatedImageIds.map(getGoogleDriveImageUrl));
    setShareableUrl(urlStorage.generateUrlWithImages(updatedImageIds));
    setTempImageId("");
    toast({ title: "Image added" });
  };
  
  const copyShareableUrl = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      toast({ title: "URL copied", description: "Shareable URL copied to clipboard" });
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImageIds = imageIds.filter((_, i) => i !== index);
    setImageIds(updatedImageIds);
    setCarouselImages(updatedImageIds.map(getGoogleDriveImageUrl));
    setShareableUrl(urlStorage.generateUrlWithImages(updatedImageIds));
  };
  
  const handleClearAllImages = () => {
    setImageIds([]);
    setCarouselImages([]);
    setShareableUrl("");
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
                  Add Google Drive image IDs or sharing URLs. Images must be shared with "Anyone with the link can view" permission.
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
                  />
                  <Button 
                    variant="outline"
                    onClick={handleAddImage}
                    className={UI_STYLES.button.primary}
                  >
                    <Plus className={UI_STYLES.iconSize} />
                    Add
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
                      onClick={handleClearAllImages}
                      className={cn(UI_STYLES.button.danger, "h-7 px-2")}
                      size="sm"
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
                        <div className="truncate text-sm">
                          {id.length > 40 ? `${id.substring(0, 40)}...` : id}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(UI_STYLES.button.danger)}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 p-4 bg-gray-50 border border-gray-200 rounded-md">
                    No images added. Add images above to configure your carousel.
                  </p>
                )}
              </div>

              {/* Shareable URL Section */}
              {imageIds.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start mb-2">
                    <Link className="text-green-800 h-5 w-5 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Share Your Carousel</h3>
                      <p className="text-xs text-green-700 mt-1">
                        Copy this URL to share this carousel in Notion.
                      </p>
                    </div>
                  </div>
                  <div className="flex mt-2">
                    <Input
                      value={shareableUrl}
                      readOnly
                      className="bg-white text-sm flex-1"
                    />
                    <Button
                      onClick={copyShareableUrl}
                      className={cn("ml-2", UI_STYLES.button.primary)}
                    >
                      <Copy className={cn(UI_STYLES.iconSizeSmall, "mr-1")} />
                      Copy
                    </Button>
                  </div>
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
