
import { useEffect, useState } from "react";
import NotionCarousel from "@/components/NotionCarousel";
import { processGoogleDriveUrls, fetchImagesFromFolder } from "@/lib/googleDriveUtils";

const EmbeddedCarousel = () => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      // Check if we have a folder ID stored
      const storedFolderId = localStorage.getItem("google_drive_folder_id");
      
      if (storedFolderId) {
        const loadedImages = await fetchImagesFromFolder(storedFolderId);
        setImages(loadedImages);
      }
      
      setLoading(false);
    };
    
    loadImages();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading carousel...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-4 text-center">
        <div>
          <p className="mb-2">No images configured.</p>
          <p className="text-sm text-muted-foreground">
            Please configure images in the main application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <NotionCarousel images={images} isGoogleDrive={true} />
    </div>
  );
};

export default EmbeddedCarousel;
