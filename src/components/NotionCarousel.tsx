import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UI_STYLES } from '@/lib/styles';

interface NotionCarouselProps {
  images: string[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
  isGoogleDrive?: boolean;
  height?: number;
}

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000,
  isGoogleDrive = false,
  height = 480,
}: NotionCarouselProps) => {
  // Real slide index (in the range of actual images)
  const [currentIndex, setCurrentIndex] = useState(0);
  // Offset index for the infinite scroll effect (includes clones)
  const [offsetIndex, setOffsetIndex] = useState(1);
  // Track if transitions should be enabled
  const [enableTransition, setEnableTransition] = useState(true);
  // Reference to the interval for autoplay
  const autoplayRef = useRef<number | null>(null);
  // Reference to the carousel container for transition detection
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Navigation functions
  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setEnableTransition(true);
    // Mark that we're in a transition
  }, [currentIndex, images.length]);
  
  const goToPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setEnableTransition(true);
  }, [currentIndex, images.length]);

  // Clear any existing intervals and reset them if needed
  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    
    if (autoplay && images.length > 1) {
      autoplayRef.current = window.setInterval(() => {
        goToNext();
      }, interval);
    }
  }, [autoplay, interval, images.length, goToNext]);
  
  // Initialize autoplay
  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [resetAutoplay]);
  
  // Update offsetIndex whenever currentIndex changes
  useEffect(() => {
    setOffsetIndex(currentIndex + 1);
  }, [currentIndex]);
  
  // Handle the slide transition and infinite loop logic
  const handleTransitionEnd = useCallback(() => {
    // If we're at a clone slide, jump to the corresponding real slide without animation
    if (offsetIndex === 0) {
      // We're at the clone of the last slide (index -1)
      setEnableTransition(false);
      setOffsetIndex(images.length); // Jump to the real last slide
    } else if (offsetIndex === images.length + 1) {
      // We're at the clone of the first slide (index images.length)
      setEnableTransition(false);
      setOffsetIndex(1); // Jump to the real first slide
    }
  }, [offsetIndex, images.length]);
  
  // Listen for transition end on the carousel element directly
  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (!carouselElement) return;
    
    carouselElement.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      carouselElement.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [handleTransitionEnd]);
  
  // Re-enable transitions after they've been disabled
  useEffect(() => {
    if (!enableTransition) {
      // Re-enable transitions after the next render cycle
      const timer = setTimeout(() => {
        setEnableTransition(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [enableTransition]);
  
  // Handle manual navigation
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setEnableTransition(true);
    resetAutoplay(); // Reset autoplay when manually navigating
  }, [resetAutoplay]);
  
  if (images.length === 0) {
    return (
      <div className={cn("relative max-w-[880px] mx-auto notion-transparent", className)}>
        <div className="flex items-center notion-transparent">
          <div className="h-8 w-8 mr-2 flex-shrink-0 notion-transparent" />
          <div 
            className={cn(`relative w-full notion-transparent flex items-center justify-center rounded-lg border backdrop-blur-sm bg-white/20 ${UI_STYLES.border}`)}
            style={{ height: `${height}px` }}
          >
            <div className="text-center p-4 space-y-2 notion-transparent rounded-md bg-black/20 backdrop-blur-sm border border-white/10 shadow-lg">
              <ImageIcon className={cn(`mx-auto h-10 w-10 text-white/70`)} />
              <p className="text-white/80 font-medium">No images to display</p>
            </div>
          </div>
          <div className="h-8 w-8 ml-2 flex-shrink-0 notion-transparent" />
        </div>
      </div>
    );
  }
  
  // Create an array with clones at both ends for infinite scroll effect
  const allSlides = [
    images[images.length - 1], // Clone of last slide at the beginning
    ...images,
    images[0] // Clone of first slide at the end
  ];
  
  const slideWidth = 100 / allSlides.length;
  
  return (
    <div className={cn("relative max-w-[880px] mx-auto notion-transparent", className)}>
      <div className="flex items-center notion-transparent">
        {/* Previous button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full notion-transparent flex-shrink-0 bg-white/20",
            UI_STYLES.button.icon,
            "mr-2"
          )}
          onClick={() => {
            goToPrev();
            resetAutoplay();
          }}
        >
          <ChevronLeft className={UI_STYLES.iconSize} />
        </Button>
        
        {/* Carousel container */}
        <div 
          className={cn(`relative overflow-hidden rounded-lg w-full notion-transparent border ${UI_STYLES.border}`)}
          style={{ height: `${height}px` }}
        >
          {/* Sliding track */}
          <div 
            ref={carouselRef}
            className="w-full h-full flex"
            style={{ 
              width: `${allSlides.length * 100}%`,
              transform: `translateX(-${offsetIndex * slideWidth}%)`,
              transition: enableTransition ? 'transform 500ms ease-in-out' : 'none'
            }}
          >
            {/* All slides including clones */}
            {allSlides.map((src, index) => (
              <div 
                key={`slide-${index}`} 
                className="h-full flex-shrink-0"
                style={{ width: `${slideWidth}%` }}
              >
                <img 
                  src={src} 
                  alt={`Slide ${index}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Next button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full notion-transparent flex-shrink-0 bg-white/20",
            UI_STYLES.button.icon,
            "ml-2"
          )}
          onClick={() => {
            goToNext();
            resetAutoplay();
          }}
        >
          <ChevronRight className={UI_STYLES.iconSize} />
        </Button>
      </div>
      
      {/* Dots navigation */}
      <div className="mt-4 flex justify-center w-full notion-transparent">
        <div className={cn("flex items-center justify-center gap-2 notion-transparent bg-white/10 px-3 py-2 rounded-full", UI_STYLES.actionBar)}>
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "rounded-full transition-all shadow-md notion-transparent",
                index === currentIndex 
                  ? "w-5 h-5 bg-white" 
                  : "w-3 h-3 bg-white/60 hover:bg-white/80"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          
          <div className={cn(`ml-2 pl-2 border-l ${UI_STYLES.border}`)}>
            <Button 
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleCarouselConfig'))}
              className={cn("h-7 px-2 bg-white/20", UI_STYLES.button.subtle)}
              size="sm"
            >
              <ChevronDown className={UI_STYLES.iconSizeSmall + " mr-1"} />
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
