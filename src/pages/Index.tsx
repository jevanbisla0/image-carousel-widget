import { useState, useEffect } from "react";
import NotionCarousel from "@/components/NotionCarousel";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Save, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  extractGoogleDriveFileId, 
  processGoogleDriveUrls, 
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
  const [folderUrl, setFolderUrl] = useState("");
  const { toast } = useToast();

  // Load images on first render
  useEffect(() => {
    const loadImages = async () => {
      // Check if we have a folder ID stored
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

    // Store the folder ID
    localStorage.setItem("google_drive_folder_id", folderId);
    
    // Store the images
    storeImagesForFolder(folderId, imageIds);
    
    // Process the images to get direct URLs
    const processedImages = processGoogleDriveUrls(imageIds);
    setImages(processedImages);
    
    // Exit configuration mode
    setIsConfiguring(false);
    
    toast({
      title: "Configuration saved",
      description: `${imageIds.length} images configured successfully.`
    });
  };

  const handleAddImage = () => {
    if (!tempImageId) return;
    
    // If it's a URL, extract the ID
    let id = tempImageId;
    if (tempImageId.startsWith('http')) {
      const extractedId = extractGoogleDriveFileId(tempImageId);
      if (extractedId) {
        id = extractedId;
      }
    }
    
    // Add to list if not already there
    if (id && !imageIds.includes(id)) {
      setImageIds([...imageIds, id]);
      setTempImageId("");
      toast({
        title: "Image added",
        description: "Image added to carousel"
      });
    } else if (imageIds.includes(id)) {
      toast({
        title: "Duplicate image",
        description: "This image is already in the carousel",
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
    if (folderId) {
      clearStoredImagesForFolder(folderId);
    }
  };

  const handleFolderUrlChange = (url: string) => {
    setFolderUrl(url);
    const id = extractGoogleDriveFileId(url);
    if (id) {
      setFolderId(id);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-sm font-medium tracking-wider text-muted-foreground">NOTION WIDGET</h2>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Image Carousel</h1>
          <p className="text-muted-foreground mt-2">Display images from your Google Drive</p>
        </div>
        
        {!isConfiguring ? (
          <>
            {images.length > 0 ? (
              <NotionCarousel images={images} isGoogleDrive={true} />
            ) : (
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="mb-4">No images configured yet.</p>
                <Button onClick={() => setIsConfiguring(true)}>Configure Images</Button>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setIsConfiguring(true)}
                className="mt-4"
              >
                {images.length > 0 ? "Edit Images" : "Configure Images"}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-muted p-6 rounded-lg space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Configure Images</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsConfiguring(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Google Drive Folder URL (Optional)</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://drive.google.com/drive/folders/your-folder-id" 
                    value={folderUrl} 
                    onChange={(e) => handleFolderUrlChange(e.target.value)} 
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  If provided, this will be used to store your image configuration
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Add Images</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Google Drive file ID or sharing URL" 
                    value={tempImageId} 
                    onChange={(e) => setTempImageId(e.target.value)} 
                    className="flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    onClick={handleAddImage}
                    disabled={!tempImageId}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a Google Drive file ID or full sharing URL
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Images ({imageIds.length})</label>
                  {imageIds.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClearAllImages}
                      className="h-8 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                {imageIds.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground border border-dashed rounded-md">
                    No images added yet
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {imageIds.map((id, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded-md border">
                        <span className="text-sm truncate flex-1">{id}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveConfig} disabled={imageIds.length === 0}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-muted p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">How to embed in Notion</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Make sure your images in Google Drive are set to <strong>"Anyone with the link can view"</strong></li>
            <li>In your Notion page, type <code className="bg-background px-2 py-1 rounded text-sm">/embed</code></li>
            <li>Select "Embed" from the menu</li>
            <li>Paste your deployed app URL</li>
            <li>Click "Embed link"</li>
          </ol>
          
          <div className="bg-background p-4 rounded-md mt-2 border border-border">
            <h3 className="font-medium mb-2">Important Note</h3>
            <p className="text-sm text-muted-foreground mb-2">
              For Google Drive images to work properly, you must:
            </p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground ml-2">
              <li>Right-click on your image in Google Drive</li>
              <li>Select "Share"</li>
              <li>Change permissions to "Anyone with the link"</li>
              <li>Copy the link and paste it into this app, or just copy the file ID</li>
            </ol>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">For best results, set the embed width to 100% in Notion</p>
          </div>
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open('https://www.notion.so/help/guides/add-content-with-slash-commands', '_blank')}
            >
              Notion Documentation <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
