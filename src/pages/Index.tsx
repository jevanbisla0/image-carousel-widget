import { useState, useEffect } from "react";
import NotionCarousel from "@/components/NotionCarousel";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Save, Trash2, X, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { 
  extractGoogleDriveFileId, 
  storeImagesForFolder,
  clearStoredImagesForFolder,
  getGoogleDriveImageUrl
} from "@/lib/googleDriveUtils";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UI_STYLES } from "@/lib/styles";
import { cn } from "@/lib/utils";

const FOLDER_ID_DEFAULT = "google_drive_images";
const FOLDER_ID_KEY = "google_drive_folder_id";

const Index = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [folderId, setFolderId] = useState(FOLDER_ID_DEFAULT);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [tempImageId, setTempImageId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();

  // Load saved images on component mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        let storedFolderId = localStorage.getItem(FOLDER_ID_KEY) || FOLDER_ID_DEFAULT;
        
        // Ensure valid folder ID
        if (!storedFolderId.trim()) {
          storedFolderId = FOLDER_ID_DEFAULT;
          localStorage.setItem(FOLDER_ID_KEY, FOLDER_ID_DEFAULT);
        }
        
        setFolderId(storedFolderId);
        
        // Load images from local storage
        const storageKey = `drive_folder_${storedFolderId}`;
        const storedImageIds = localStorage.getItem(storageKey);
        
        if (storedImageIds) {
          try {
            const parsedIds = JSON.parse(storedImageIds);
            
            // Validate array contents
            if (Array.isArray(parsedIds) && parsedIds.every(id => typeof id === 'string')) {
              // Filter out empty strings
              const validIds = parsedIds.filter(id => id.trim());
              setImageIds(validIds);
              setImages(validIds.map(id => getGoogleDriveImageUrl(id)));
            } else {
              // Invalid data structure - reset
              localStorage.removeItem(storageKey);
            }
          } catch (error) {
            // JSON parse error - reset
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        // Handle any localStorage access errors
        console.error("Error loading images:", error);
      }
    };
    
    loadImages();
    
    // Handle config toggle event
    const handleToggleConfig = () => setIsConfiguring(prev => !prev);
    window.addEventListener('toggleCarouselConfig', handleToggleConfig);
    
    return () => window.removeEventListener('toggleCarouselConfig', handleToggleConfig);
  }, []);

  const handleSaveConfig = () => {
    try {
      if (imageIds.length === 0) {
        toast({
          title: "No images added",
          description: "Please add at least one image before saving.",
          variant: "destructive"
        });
        return;
      }

      const finalFolderId = folderId.trim() || FOLDER_ID_DEFAULT;
      localStorage.setItem(FOLDER_ID_KEY, finalFolderId);
      storeImagesForFolder(finalFolderId, imageIds);
      
      setImages(imageIds.map(id => getGoogleDriveImageUrl(id)));
      setIsConfiguring(false);
      
      toast({
        title: "Configuration saved",
        description: `${imageIds.length} images configured successfully.`
      });
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddImage = () => {
    try {
      const input = tempImageId.trim();
      if (!input) return;
      
      const id = input.startsWith('http') 
        ? extractGoogleDriveFileId(input) || ""
        : input;
      
      if (!id) {
        toast({
          title: "Invalid image ID or URL",
          description: "Please enter a valid Google Drive image ID or URL",
          variant: "destructive"
        });
        return;
      }
      
      if (imageIds.includes(id)) {
        toast({
          title: "Duplicate image",
          description: "This image is already in the carousel",
          variant: "destructive"
        });
        return;
      }
      
      setImageIds(prev => [...prev, id]);
      setTempImageId("");
      toast({ 
        title: "Image added", 
        description: "Image added to carousel" 
      });
    } catch (error) {
      toast({
        title: "Error adding image",
        description: "Failed to add the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    try {
      if (index < 0 || index >= imageIds.length) return;
      
      const newImageIds = [...imageIds];
      newImageIds.splice(index, 1);
      setImageIds(newImageIds);
    } catch (error) {
      toast({
        title: "Error removing image",
        description: "Failed to remove the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClearAllImages = () => {
    try {
      setImageIds([]);
      clearStoredImagesForFolder(folderId);
      setImages([]);
      
      toast({
        title: "All images cleared",
        description: "The configuration has been reset."
      });
    } catch (error) {
      toast({
        title: "Error clearing images",
        description: "Failed to clear images. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="notion-transparent">
      <NotionCarousel 
        images={images} 
        className="notion-transparent"
        height={480}
      />

      {isConfiguring && (
        <div className={cn(
          "p-4 max-w-[800px] mx-auto mt-4 rounded-lg",
          "bg-white/60 backdrop-blur-sm border border-gray-200 shadow-md"
        )}>
          <div className="space-y-4">
            <Alert className={cn(
              "mb-4 bg-blue-100 border-blue-200 text-blue-800"
            )}>
              <AlertCircle className="h-4 w-4 border-blue-700 text-blue-600" />
              <AlertTitle className="text-blue-800 font-medium">Configure Images</AlertTitle>
              <AlertDescription className="text-blue-800">
                <p>Add Google Drive image IDs or sharing URLs. Make sure images are shared with <strong>"Anyone with the link can view"</strong> permission.</p>
              </AlertDescription>
            </Alert>
            
            <label htmlFor="image-input" className="text-sm font-medium mb-1 block text-gray-700">
              Add Google Drive Images
            </label>
            <div className="flex gap-2">
              <Input
                id="image-input"
                placeholder="Paste Google Drive image ID or URL"
                value={tempImageId}
                onChange={(e) => setTempImageId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                className="bg-white border-gray-300"
                maxLength={200}
              />
              <Button 
                size="icon"
                onClick={handleAddImage}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Add image"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex justify-between items-center text-gray-700">
                <span>Selected Images ({imageIds.length})</span>
                {imageIds.length > 0 && (
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="h-8 bg-white/80 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleClearAllImages}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className={cn(
                "divide-y rounded-md overflow-hidden", 
                "border border-gray-200 bg-white/80"
              )}>
                {imageIds.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No images added yet
                  </div>
                ) : (
                  imageIds.map((id, index) => (
                    <div 
                      key={index} 
                      className="p-2 flex items-center justify-between bg-white/80"
                    >
                      <div className="text-sm truncate max-w-[200px] text-gray-600">
                        {id}
                      </div>
                      <div className="flex gap-1">
                        <a 
                          href={`https://drive.google.com/uc?export=view&id=${id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          aria-label="View image"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleRemoveImage(index)}
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
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
                className="mr-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveConfig}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
