import { useState, useEffect } from "react";
import NotionCarousel from "@/components/NotionCarousel";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Save, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  extractGoogleDriveFileId, 
  storeImagesForFolder,
  fetchImagesFromFolder,
  clearStoredImagesForFolder
} from "@/lib/googleDriveUtils";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [folderId, setFolderId] = useState("");
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [tempImageId, setTempImageId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUsageExpanded, setIsUsageExpanded] = useState(false);
  const { toast } = useToast();

  // Load images on first render
  useEffect(() => {
    const loadImages = async () => {
      const storedFolderId = localStorage.getItem("google_drive_folder_id");
      
      if (storedFolderId) {
        setFolderId(storedFolderId);
        const loadedImages = await fetchImagesFromFolder(storedFolderId);
        setImages(loadedImages);
        
        // Also populate the imageIds for configuration
        const storedImageIds = localStorage.getItem(`drive_folder_${storedFolderId}`);
        if (storedImageIds) {
          setImageIds(JSON.parse(storedImageIds));
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

    // Store configuration
    localStorage.setItem("google_drive_folder_id", folderId);
    storeImagesForFolder(folderId, imageIds);
    
    // Update the UI and fetch images
    fetchImagesFromFolder(folderId).then(loadedImages => {
      setImages(loadedImages);
      setIsConfiguring(false);
      
      toast({
        title: "Configuration saved",
        description: `${imageIds.length} images configured successfully.`
      });
    });
  };

  const handleAddImage = () => {
    if (!tempImageId) return;
    
    // If it's a URL, extract the ID
    const id = tempImageId.startsWith('http') 
      ? extractGoogleDriveFileId(tempImageId) || ""
      : tempImageId;
    
    // Add to list if not already there and valid
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

  const toggleUsage = () => {
    setIsUsageExpanded(!isUsageExpanded);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      <div className="space-y-8">
        {/* Preview and Controls section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Image Carousel Widget</h2>
            <div className="flex gap-2">
              <Button 
                variant={isConfiguring ? "default" : "outline"} 
                onClick={() => setIsConfiguring(!isConfiguring)}
                className="flex items-center gap-1"
              >
                <span>Configure</span>
                {isConfiguring ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                onClick={toggleUsage}
                className="flex items-center gap-1"
              >
                <span>Usage</span>
                {isUsageExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <NotionCarousel 
            images={images} 
            isGoogleDrive={true}
            className="border rounded-lg shadow-sm"
          />
        </div>

        {/* Usage section - Collapsible */}
        {isUsageExpanded && (
          <div className="space-y-4 bg-card p-4 rounded-lg border">
            <h2 className="text-xl font-semibold">Usage</h2>
            <p className="text-sm">
              This widget allows you to display a carousel of images from your Google Drive.
            </p>
            <div className="space-y-2">
              <h3 className="font-medium">How to use:</h3>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li>Click the "Configure" button to get started</li>
                <li>Add Google Drive image IDs or sharing URLs</li>
                <li>Save your configuration</li>
                <li>The carousel will persist your settings for future visits</li>
              </ol>
            </div>
          </div>
        )}

        {/* Configuration section */}
        {isConfiguring && (
          <div className="space-y-4 bg-card p-4 rounded-lg border">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuration</h2>
                <label className="text-sm font-medium mb-1 block">
                  Google Drive Images
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste Google Drive image ID or URL"
                    value={tempImageId}
                    onChange={(e) => setTempImageId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                  />
                  <Button size="icon" onClick={handleAddImage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Image list */}
              <div className="space-y-2">
                <div className="text-sm font-medium flex justify-between items-center">
                  <span>Selected Images ({imageIds.length})</span>
                  {imageIds.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-destructive" 
                      onClick={handleClearAllImages}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                  {imageIds.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No images added yet
                    </div>
                  ) : (
                    imageIds.map((id, index) => (
                      <div 
                        key={index} 
                        className="p-2 flex items-center justify-between"
                      >
                        <div className="text-sm truncate max-w-[200px]">
                          {id}
                        </div>
                        <div className="flex gap-1">
                          <a 
                            href={`https://drive.google.com/file/d/${id}/view`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button 
                className="w-full" 
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
