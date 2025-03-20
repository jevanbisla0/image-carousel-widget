import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { cn, UI_STYLES } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CarouselDot } from '@/components/ui/carousel-dot';
import { CarouselProps } from '@/lib/types';

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000,
  height = 480,
  onConfigureClick,
}: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const skipTransitionRef = useRef(false);
  
  // Create slides array with first and last duplicated for infinite effect
  const allSlides = !images.length ? [] : [
    images[images.length - 1], 
    ...images, 
    images[0]
  ];
  
  const totalSlides = allSlides.length;
  const slideWidth = totalSlides ? 100 / totalSlides : 100;
  
  // Navigation handlers
  const goToNext = useCallback(() => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setActiveIndex(prev => prev === images.length - 1 ? images.length : prev + 1);
  }, [images.length, isTransitioning]);
  
  const goToPrev = useCallback(() => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setActiveIndex(prev => prev === 0 ? -1 : prev - 1);
  }, [images.length, isTransitioning]);
  
  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (autoplay && images.length > 1) {
      autoplayRef.current = window.setInterval(goToNext, interval);
    }
  }, [autoplay, goToNext, images.length, interval]);
  
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    if (activeIndex === images.length) {
      skipTransitionRef.current = true;
      setActiveIndex(0);
    } else if (activeIndex === -1) {
      skipTransitionRef.current = true;
      setActiveIndex(images.length - 1);
    }
  }, [activeIndex, images.length]);
  
  const handleConfigClick = useCallback(() => {
    if (onConfigureClick) {
      onConfigureClick();
    } else {
      window.dispatchEvent(new CustomEvent('toggleCarouselConfig'));
    }
  }, [onConfigureClick]);
  
  // Setup effects
  useEffect(() => {
    startAutoplay();
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [startAutoplay]);
  
  useEffect(() => {
    const element = carouselRef.current;
    if (element) {
      element.addEventListener('transitionend', handleTransitionEnd);
      return () => element.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [handleTransitionEnd]);
  
  useEffect(() => {
    if (skipTransitionRef.current) {
      requestAnimationFrame(() => { skipTransitionRef.current = false; });
    }
  }, [activeIndex]);
  
  useEffect(() => {
    if (!isTransitioning) startAutoplay();
  }, [activeIndex, isTransitioning, startAutoplay]);
  
  // Empty state - no images
  if (!images.length) {
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
            onClick={handleConfigClick}
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
            ref={carouselRef}
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
          {images.map((_, index) => (
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
              onClick={handleConfigClick}
              className={cn("h-7 px-2", UI_STYLES.button.secondary)}
              size="sm"
            >
              <ChevronDown className={UI_STYLES.iconSizeSmall} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
