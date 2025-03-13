
import { useState, useEffect } from "react";
import NotionCarousel, { CarouselDots } from "@/components/NotionCarousel";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Save, Trash2, X, ChevronDown, AlertCircle, Info } from "lucide-react";
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

const Index = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [folderId, setFolderId] = useState("google_drive_images");
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [tempImageId, setTempImageId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUsageExpanded, setIsUsageExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  // Load images from localStorage on mount
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
          if (Array.isArray(parsedIds) && parsedIds.length > 0) {
            setImageIds(parsedIds);
            
            // Ensure the image IDs are processed into proper URLs
            const processedUrls = parsedIds
              .map((id: string) => getGoogleDriveImageUrl(id))
              .filter(url => url && url.trim() !== '');
              
            console.log("Processed URLs:", processedUrls);
            
            if (processedUrls.length > 0) {
              setImages(processedUrls);
            } else {
              console.error("No valid URLs were generated from the stored IDs");
            }
          } else {
            console.log("No stored image IDs found or array is empty");
          }
        } catch (error) {
          console.error("Error parsing stored image IDs:", error);
          toast({
            title: "Error loading images",
            description: "There was a problem loading your saved images.",
            variant: "destructive",
          });
        }
      }
    };
    
    loadImages();
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
    
    // Filter out empty URLs
    const processedUrls = imageIds
      .map(id => getGoogleDriveImageUrl(id))
      .filter(url => url && url.trim() !== '');
      
    console.log("Processed URLs for save:", processedUrls);
    
    if (processedUrls.length > 0) {
      setImages(processedUrls);
      setIsConfiguring(false);
      
      toast({
        title: "Configuration saved",
        description: `${imageIds.length} images configured successfully.`
      });
      
      // Reset to first image
      setCurrentIndex(0);
    } else {
      toast({
        title: "Error processing images",
        description: "No valid image URLs were generated. Please check your image IDs.",
        variant: "destructive"
      });
    }
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
    setCurrentIndex(0);
    
    toast({
      title: "All images cleared",
      description: "The configuration has been reset."
    });
  };

  const handleImageIndexChange = (index: number) => {
    console.log("Image index changed to:", index);
    setCurrentIndex(index);
  };

  const toggleUsage = () => {
    setIsUsageExpanded(!isUsageExpanded);
  };

  // Only show dots if there are multiple images
  const shouldShowDots = images.length > 1;

  return (
    <div className="mx-auto px-4 py-8 max-w-5xl notion-transparent">
      <div className="space-y-8 notion-transparent">
        <div className="space-y-4 notion-transparent">
          <NotionCarousel 
            images={images} 
            isGoogleDrive={true}
            className="notion-transparent"
            renderControls={false}
            controlledIndex={currentIndex}
            onIndexChange={handleImageIndexChange}
          />
          
          <div className="flex items-center mt-4 justify-between px-2 notion-transparent">
            {/* Dots on the left */}
            <div className="notion-transparent">
              {shouldShowDots && (
                <CarouselDots 
                  images={images} 
                  currentIndex={currentIndex} 
                  onDotClick={handleImageIndexChange} 
                />
              )}
            </div>
            
            {/* Configure button on the right */}
            <Button 
              variant="outline"
              onClick={() => setIsConfiguring(!isConfiguring)}
              className="bg-white/80 hover:bg-white/90 text-gray-800 border-gray-300"
            >
              {isConfiguring ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Configure
                </>
              )}
            </Button>
          </div>
        </div>

        {isConfiguring && (
          <div className="space-y-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Configure Images</h2>
                
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">Carousel Details</h3>
                      <p className="text-sm text-gray-700">
                        This carousel displays images from Google Drive. Make sure your images are set to "Anyone with the link can view".
                      </p>
                      <div className="pt-2 border-t border-gray-100">
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
                
                <Alert className="mb-4 bg-white/90">
                  <AlertCircle className="h-4 w-4" />
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
                    className="bg-white"
                  />
                  <Button 
                    size="icon"
                    onClick={handleAddImage}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium flex justify-between items-center text-gray-700">
                  <span>Selected Images ({imageIds.length})</span>
                  {imageIds.length > 0 && (
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="h-8 bg-red-500 hover:bg-red-600 text-white border-none" 
                      onClick={handleClearAllImages}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="border rounded-md divide-y bg-white">
                  {imageIds.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No images added yet
                    </div>
                  ) : (
                    imageIds.map((id, index) => (
                      <div 
                        key={index} 
                        className="p-2 flex items-center justify-between"
                      >
                        <div className="text-sm truncate max-w-[200px] text-gray-600">
                          {id}
                        </div>
                        <div className="flex gap-1">
                          <a 
                            href={`https://drive.google.com/uc?export=view&id=${id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button 
                className="w-full bg-green-500 hover:bg-green-600 text-white" 
                onClick={handleSaveConfig}
                disabled={imageIds.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
