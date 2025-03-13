import { useState, useEffect } from "react";
import NotionCarousel from "@/components/NotionCarousel";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Save, Trash2, X, ChevronDown, AlertCircle, Info } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { 
  extractGoogleDriveFileId, 
  storeImagesForFolder,
  fetchImagesFromFolder,
  clearStoredImagesForFolder,
  getGoogleDriveImageUrl
} from "@/lib/googleDriveUtils";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UI_STYLES } from "@/lib/styles";
import { cn } from "@/lib/utils";

const Index = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [folderId, setFolderId] = useState("google_drive_images");
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [tempImageId, setTempImageId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUsageExpanded, setIsUsageExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadImages = async () => {
      let storedFolderId = localStorage.getItem("google_drive_folder_id");
      
      if (!storedFolderId) {
        storedFolderId = "google_drive_images";
        localStorage.setItem("google_drive_folder_id", storedFolderId);
      }
      
      setFolderId(storedFolderId);
      
      const storedImageIds = localStorage.getItem(`drive_folder_${storedFolderId}`);
      if (storedImageIds) {
        try {
          const parsedIds = JSON.parse(storedImageIds);
          setImageIds(parsedIds);
          
          const processedUrls = parsedIds.map((id: string) => getGoogleDriveImageUrl(id));
          setImages(processedUrls);
        } catch (error) {
          // Error handling for invalid JSON
        }
      }
    };
    
    loadImages();
    
    // Add event listener for the custom event
    const handleToggleConfig = () => {
      setIsConfiguring(prevState => !prevState);
    };
    
    window.addEventListener('toggleCarouselConfig', handleToggleConfig);
    
    // Clean up
    return () => {
      window.removeEventListener('toggleCarouselConfig', handleToggleConfig);
    };
  }, []);

  const handleSaveConfig = () => {
    if (imageIds.length === 0) {
      toast({
        title: "No images added",
        description: "Please add at least one image before saving.",
        variant: "destructive"
      });
      return;
    }

    const finalFolderId = folderId || "google_drive_images";
    localStorage.setItem("google_drive_folder_id", finalFolderId);
    storeImagesForFolder(finalFolderId, imageIds);
    
    const processedUrls = imageIds.map(id => getGoogleDriveImageUrl(id));
    setImages(processedUrls);
    setIsConfiguring(false);
    
    toast({
      title: "Configuration saved",
      description: `${imageIds.length} images configured successfully.`
    });
  };

  const handleAddImage = () => {
    if (!tempImageId) return;
    
    const id = tempImageId.startsWith('http') 
      ? extractGoogleDriveFileId(tempImageId) || ""
      : tempImageId;
    
    if (id && !imageIds.includes(id)) {
      setImageIds([...imageIds, id]);
      setTempImageId("");
      toast({ title: "Image added", description: "Image added to carousel" });
    } else if (imageIds.includes(id)) {
      toast({
        title: "Duplicate image",
        description: "This image is already in the carousel",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Invalid image ID or URL",
        description: "Please enter a valid Google Drive image ID or URL",
        variant: "destructive"
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageIds = [...imageIds];
    newImageIds.splice(index, 1);
    setImageIds(newImageIds);
  };

  const handleClearAllImages = () => {
    setImageIds([]);
    clearStoredImagesForFolder(folderId);
    setImages([]);
    
    toast({
      title: "All images cleared",
      description: "The configuration has been reset."
    });
  };

  return (
    <div className="mx-auto px-4 py-8 max-w-5xl notion-transparent">
      <div className={cn("notion-transparent", UI_STYLES.space.lg)}>
        <div className={cn("notion-transparent", UI_STYLES.space.md)}>
          <NotionCarousel 
            images={images} 
            isGoogleDrive={false}
            className="notion-transparent"
            height={400}
          />
        </div>

        {isConfiguring && (
          <div className={cn("p-4", UI_STYLES.panel, UI_STYLES.space.md)}>
            <div className={UI_STYLES.space.md}>
              <div>
                <h2 className={cn("text-xl font-semibold mb-4", UI_STYLES.textHeading)}>Configure Images</h2>
                
                <div className={cn(`p-3 mb-4 rounded-md ${UI_STYLES.bgMuted} ${UI_STYLES.border}`)}>
                  <div className="flex items-start gap-2">
                    <Info className={cn(`text-blue-500 mt-0.5 flex-shrink-0`, UI_STYLES.iconSizeMedium)} />
                    <div className={UI_STYLES.space.sm}>
                      <h3 className="font-medium text-sm">Carousel Details</h3>
                      <p className="text-sm text-gray-700">
                        This carousel displays images from Google Drive. Make sure your images are set to "Anyone with the link can view".
                      </p>
                      <div className={cn(`pt-2 border-t`, UI_STYLES.border)}>
                        <h4 className="font-medium text-xs mb-1">Usage:</h4>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                          <li>Add Google Drive image IDs or sharing URLs</li>
                          <li>Configure button allows you to add/remove images</li>
                          <li>Your settings are saved locally</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert className={cn("mb-4", UI_STYLES.bgPanel)}>
                  <AlertCircle className={UI_STYLES.iconSize} />
                  <AlertTitle>Google Drive Sharing Settings</AlertTitle>
                  <AlertDescription>
                    Make sure your Google Drive images are shared with <strong>"Anyone with the link can view"</strong> permission.
                  </AlertDescription>
                </Alert>
                
                <label className="text-sm font-medium mb-1 block text-gray-700">
                  Add Google Drive Images
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste Google Drive image ID or URL"
                    value={tempImageId}
                    onChange={(e) => setTempImageId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                    className={UI_STYLES.bgCard}
                  />
                  <Button 
                    size="icon"
                    onClick={handleAddImage}
                    className={UI_STYLES.button.add}
                  >
                    <Plus className={UI_STYLES.iconSize} />
                  </Button>
                </div>
              </div>

              <div className={UI_STYLES.space.sm}>
                <div className="text-sm font-medium flex justify-between items-center text-gray-700">
                  <span>Selected Images ({imageIds.length})</span>
                  {imageIds.length > 0 && (
                    <Button 
                      variant="outline"
                      size="sm" 
                      className={`h-8 ${UI_STYLES.button.danger}`}
                      onClick={handleClearAllImages}
                    >
                      <Trash2 className={`${UI_STYLES.iconSize} mr-2`} />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className={cn("divide-y", UI_STYLES.card)}>
                  {imageIds.length === 0 ? (
                    <div className={cn("p-4 text-center text-sm", UI_STYLES.textMuted)}>
                      No images added yet
                    </div>
                  ) : (
                    imageIds.map((id, index) => (
                      <div 
                        key={index} 
                        className="p-2 flex items-center justify-between"
                      >
                        <div className={cn("text-sm truncate max-w-[200px]", UI_STYLES.textSubtle)}>
                          {id}
                        </div>
                        <div className="flex gap-1">
                          <a 
                            href={`https://drive.google.com/uc?export=view&id=${id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 p-1 rounded hover:bg-white/20"
                          >
                            <ExternalLink className={UI_STYLES.iconSize} />
                          </a>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(`h-6 w-6 rounded-full`, UI_STYLES.button.danger)}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className={UI_STYLES.iconSize} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsConfiguring(false)}
                  className={cn("mr-2", UI_STYLES.button.transparent)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveConfig}
                  className={UI_STYLES.button.primary}
                >
                  <Save className={`${UI_STYLES.iconSize} mr-2`} />
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
