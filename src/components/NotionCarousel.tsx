import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ChevronDown, Plus, Save, Trash2, X, Info, ExternalLink } from 'lucide-react';
import { cn, UI_STYLES } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CarouselDot } from '@/components/ui/carousel-dot';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { extractGoogleDriveFileId, getGoogleDriveImageUrl, imageStorage } from '@/lib/googleDriveUtils';
import { CarouselProps } from '@/lib/types';

// Storage constants
const STORAGE = {
  folderKey: "google_drive_folder_id",
  defaultFolder: "google_drive_images"
};

/**
 * NotionCarousel - An image carousel component with built-in configuration
 */
const NotionCarousel = ({ 
  images: initialImages = [], 
  className,
  autoplay = true, 
  interval = 5000,
  height = 480,
  onConfigureClick,
}: CarouselProps) => {
  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [folderId, setFolderId] = useState(STORAGE.defaultFolder);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [tempImageId, setTempImageId] = useState("");
  const [carouselImages, setCarouselImages] = useState<string[]>(initialImages);
  const { toast } = useToast();
  
  // Refs
  const autoplayRef = React.useRef<number | null>(null);
  const skipTransitionRef = React.useRef(false);
  
  // Prepare slides for infinite effect - duplicate first and last slide
  const allSlides = !carouselImages.length ? [] : [
    carouselImages[carouselImages.length - 1], 
    ...carouselImages, 
    carouselImages[0]
  ];
  
  const totalSlides = allSlides.length;
  const slideWidth = totalSlides ? 100 / totalSlides : 100;
  
  // Load saved configuration on mount
  useEffect(() => {
    // Initialize from localStorage
    const storedFolderId = localStorage.getItem(STORAGE.folderKey) || STORAGE.defaultFolder;
    setFolderId(storedFolderId);
    
    // Load stored images if we don't have initial images
    if (initialImages.length === 0) {
      const loadedIds = imageStorage.loadImages(storedFolderId);
      setImageIds(loadedIds);
      setCarouselImages(loadedIds.map(getGoogleDriveImageUrl));
    }
    
    // Setup autoplay
    startAutoplay();
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [initialImages]);
  
  // Navigation handlers
  const goToNext = useCallback(() => {
    if (isTransitioning || carouselImages.length <= 1) return;
    setIsTransitioning(true);
    setActiveIndex(prev => prev === carouselImages.length - 1 ? carouselImages.length : prev + 1);
  }, [carouselImages.length, isTransitioning]);
  
  const goToPrev = useCallback(() => {
    if (isTransitioning || carouselImages.length <= 1) return;
    setIsTransitioning(true);
    setActiveIndex(prev => prev === 0 ? -1 : prev - 1);
  }, [carouselImages.length, isTransitioning]);
  
  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (autoplay && carouselImages.length > 1) {
      autoplayRef.current = window.setInterval(goToNext, interval);
    }
  }, [autoplay, goToNext, carouselImages.length, interval]);
  
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    if (activeIndex === carouselImages.length) {
      skipTransitionRef.current = true;
      setActiveIndex(0);
    } else if (activeIndex === -1) {
      skipTransitionRef.current = true;
      setActiveIndex(carouselImages.length - 1);
    }
  }, [activeIndex, carouselImages.length]);
  
  // Configuration panel handlers
  const toggleConfigPanel = useCallback(() => {
    setIsConfiguring(prev => !prev);
    if (onConfigureClick) onConfigureClick();
  }, [onConfigureClick]);
  
  const handleAddImage = useCallback(() => {
    const input = tempImageId.trim();
    if (!input) return;
    
    // Extract ID from URL or use direct ID
    const id = input.startsWith('http') ? extractGoogleDriveFileId(input) || "" : input;
    
    if (!id) {
      toast({ title: "Invalid image ID or URL", variant: "destructive" });
      return;
    }
    
    if (imageIds.includes(id)) {
      toast({ title: "Duplicate image", variant: "destructive" });
      return;
    }
    
    setImageIds(prev => [...prev, id]);
    setTempImageId("");
    toast({ title: "Image added" });
  }, [imageIds, tempImageId, toast]);
  
  const handleSaveConfig = useCallback(() => {
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
  }, [folderId, imageIds, toast]);

  const handleRemoveImage = useCallback((index: number) => 
    setImageIds(prev => prev.filter((_, i) => i !== index)), 
  []);
  
  const handleClearAllImages = useCallback(() => {
    setImageIds([]);
    imageStorage.clearImages(folderId);
    setCarouselImages([]);
    toast({ title: "All images cleared" });
  }, [folderId, toast]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => 
    e.key === 'Enter' && handleAddImage();
  
  // Hook up transition end event
  useEffect(() => {
    const element = document.getElementById('carousel-container');
    if (element) {
      element.addEventListener('transitionend', handleTransitionEnd);
      return () => element.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [handleTransitionEnd]);
  
  // Reset transition when it's skipped
  useEffect(() => {
    if (skipTransitionRef.current) {
      requestAnimationFrame(() => { skipTransitionRef.current = false; });
    }
  }, [activeIndex]);
  
  // Restart autoplay when not transitioning
  useEffect(() => {
    if (!isTransitioning) startAutoplay();
  }, [activeIndex, isTransitioning, startAutoplay]);
  
  // Empty state - no images
  if (!carouselImages.length) {
    return (
      <div className={cn("relative max-w-[880px] mx-auto", className)}>
        <div className="flex items-center">
          <div className="h-8 w-8 mr-2" />
          <div className={cn("relative w-full flex items-center justify-center", UI_STYLES.panel)} style={{ height: `${height}px` }}>
            <div className="text-center p-4 space-y-2 rounded-md bg-gray-50 border border-gray-200 shadow-md">
              <ImageIcon className={cn("mx-auto", UI_STYLES.iconSizeMedium, UI_STYLES.textMuted)} />
              <p className={UI_STYLES.textBody}>No images to display</p>
            </div>
          </div>
          <div className="h-8 w-8 ml-2" />
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline"
            onClick={toggleConfigPanel}
            className={cn("h-7 px-2", UI_STYLES.button.secondary)}
            size="sm"
          >
            <ChevronDown className={UI_STYLES.iconSizeSmall} />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative max-w-[880px] mx-auto", className)}>
      {/* Carousel container */}
      <div className="flex items-center">
        {/* Previous button */}
        <Button
          variant="outline"
          size="icon"
          className={cn("h-8 w-8 mr-2", UI_STYLES.button.icon)}
          onClick={goToPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className={UI_STYLES.iconSize} />
        </Button>
        
        {/* Slides container */}
        <div className={cn("relative overflow-hidden rounded-lg w-full", UI_STYLES.panel)} style={{ height: `${height}px` }}>
          <div 
            id="carousel-container"
            className="w-full h-full flex"
            style={{ 
              width: `${totalSlides * 100}%`,
              transform: `translateX(-${(activeIndex + 1) * slideWidth}%)`,
              transition: skipTransitionRef.current ? 'none' : 'transform 500ms ease-in-out'
            }}
          >
            {allSlides.map((src, index) => (
              <div 
                key={`slide-${index}`} 
                className="h-full flex-shrink-0"
                style={{ width: `${slideWidth}%` }}
              >
                <img 
                  src={src} 
                  alt={`Slide ${index === 0 || index === totalSlides - 1 ? 'clone' : index}`}
                  className="w-full h-full object-cover"
                  loading={index === activeIndex + 1 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Next button */}
        <Button
          variant="outline"
          size="icon"
          className={cn("h-8 w-8 ml-2", UI_STYLES.button.icon)}
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ChevronRight className={UI_STYLES.iconSize} />
        </Button>
      </div>
      
      {/* Dots and config button */}
      <div className="mt-4 flex justify-center">
        <div className={cn("flex items-center justify-center gap-2 px-3 py-2 rounded-full", UI_STYLES.actionBar)}>
          {/* Dots navigation */}
          {carouselImages.map((_, index) => (
            <CarouselDot
              key={index}
              active={index === activeIndex}
              onClick={() => {
                if (!isTransitioning) {
                  setActiveIndex(index);
                  startAutoplay();
                }
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          
          {/* Config button */}
          <div className={cn("ml-2 pl-2 border-l", UI_STYLES.border)}>
            <Button 
              variant="outline"
              onClick={toggleConfigPanel}
              className={cn("h-7 px-2", UI_STYLES.button.secondary)}
              size="sm"
            >
              <ChevronDown className={UI_STYLES.iconSizeSmall} />
            </Button>
          </div>
        </div>
      </div>

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
                <label htmlFor="image-input" className="text-sm font-medium mb-2 block text-gray-700">
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
                    className={UI_STYLES.button.secondary}
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
                            variant="outline"
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

export default NotionCarousel;
