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
  // Current displayed slide index
  const [activeIndex, setActiveIndex] = useState(0);
  // For tracking transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Reference to the interval for autoplay
  const autoplayRef = useRef<number | null>(null);
  // Reference to the carousel container
  const carouselRef = useRef<HTMLDivElement>(null);
  // Flag to track if we should skip transition
  const skipTransitionRef = useRef(false);
  
  // Total number of slides including clones
  const totalSlides = images.length + 2; // Original slides + 2 clones (one at each end)
  
  // Calculate slide width as percentage
  const slideWidth = 100 / totalSlides;
  
  // Prepare the slides array with clones for infinite scrolling
  const allSlides = [
    // Last image as first slide (for seamless backward transition)
    images[images.length - 1],
    // All original images in the middle
    ...images,
    // First image as last slide (for seamless forward transition)
    images[0]
  ];
  
  // Handle next slide action
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex(prev => {
      // When we're at the last real slide, go to the clone of the first slide
      if (prev === images.length - 1) {
        return images.length;
      }
      // Otherwise just go to the next slide
      return prev + 1;
    });
  }, [images.length, isTransitioning]);
  
  // Handle previous slide action
  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex(prev => {
      // When we're at the first real slide, go to the clone of the last slide
      if (prev === 0) {
        return -1;
      }
      // Otherwise just go to the previous slide
      return prev - 1;
    });
  }, [isTransitioning]);
  
  // Setup autoplay functionality
  const startAutoplay = useCallback(() => {
    // Clear any existing interval
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    
    // Start a new interval if autoplay is enabled and there's more than one image
    if (autoplay && images.length > 1) {
      autoplayRef.current = window.setInterval(() => {
        goToNext();
      }, interval);
    }
  }, [autoplay, goToNext, images.length, interval]);
  
  // Initialize autoplay on mount and cleanup on unmount
  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [startAutoplay]);
  
  // Handle transition end to reset transition state and handle loop jumps
  const handleTransitionEnd = useCallback(() => {
    // First, mark that the transition is complete
    setIsTransitioning(false);
    
    // If we're at the clone beyond the last slide,
    // jump back to the first real slide without animation
    if (activeIndex === images.length) {
      skipTransitionRef.current = true;
      setActiveIndex(0);
      // Restart autoplay to ensure it continues properly
      startAutoplay();
    } 
    // If we're at the clone before the first slide,
    // jump to the last real slide without animation
    else if (activeIndex === -1) {
      skipTransitionRef.current = true;
      setActiveIndex(images.length - 1);
      // Restart autoplay to ensure it continues properly
      startAutoplay();
    }
  }, [activeIndex, images.length, startAutoplay]);
  
  // Reset the transition skip flag after the state has been updated
  useEffect(() => {
    if (skipTransitionRef.current) {
      // Use RAF to ensure the DOM has updated before clearing the flag
      const rafId = requestAnimationFrame(() => {
        skipTransitionRef.current = false;
      });
      
      return () => cancelAnimationFrame(rafId);
    }
  }, [activeIndex]);
  
  // Listen for transition end events
  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('transitionend', handleTransitionEnd);
    }
    
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [handleTransitionEnd]);
  
  // Reset autoplay when active index changes manually
  useEffect(() => {
    if (!isTransitioning) {
      startAutoplay();
    }
  }, [activeIndex, isTransitioning, startAutoplay]);
  
  // Handle manual navigation to a specific slide
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setActiveIndex(index);
    startAutoplay(); // Reset autoplay timer
  }, [isTransitioning, startAutoplay]);
  
  // Early return for empty images array
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
  
  // Calculate the transform position based on active index
  const getTransformValue = () => {
    // Add 1 to include the first clone slide
    const translateX = -(activeIndex + 1) * slideWidth;
    return `translateX(${translateX}%)`;
  };
  
  // Determine whether transitions should be enabled
  const getTransitionStyle = () => {
    // Disable transitions for immediate jumps between clones and real slides
    if (skipTransitionRef.current) {
      return 'none';
    }
    return 'transform 500ms ease-in-out';
  };
  
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
            startAutoplay();
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
              width: `${totalSlides * 100}%`,
              transform: getTransformValue(),
              transition: getTransitionStyle()
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
            startAutoplay();
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
                index === activeIndex 
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
