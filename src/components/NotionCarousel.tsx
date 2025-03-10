
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NotionCarouselProps {
  images: string[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
}

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000 
}: NotionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      // Get the dimensions of the parent container or window
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setContainerWidth(width);
      setContainerHeight(height);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsLoading(true);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoplay, interval, images.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
  };

  // Calculate height based on container width to maintain aspect ratio
  const carouselHeight = Math.min(500, containerHeight * 0.8);

  return (
    <div className={cn("relative w-full mx-auto", className)} 
         style={{ maxWidth: '100%' }}>
      <div 
        className="relative overflow-hidden rounded-lg bg-muted"
        style={{ height: `${carouselHeight}px` }}
      >
        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className={cn(
            "absolute w-full h-full object-cover transition-all duration-500",
            isLoading ? "scale-105 blur-sm" : "scale-100 blur-0"
          )}
          onLoad={() => setIsLoading(false)}
        />

        {/* Simplified Navigation Buttons - Always visible on small screens */}
        <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Simplified Dots Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "bg-white w-3"
                  : "bg-white/50 hover:bg-white/75"
              )}
              onClick={() => {
                setCurrentIndex(index);
                setIsLoading(true);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
