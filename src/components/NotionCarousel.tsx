
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NotionCarouselProps {
  images: string[];
  className?: string;
}

const NotionCarousel = ({ images, className }: NotionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
  };

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto group", className)}>
      <div className="relative h-[500px] overflow-hidden rounded-lg bg-muted">
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

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "bg-white w-4"
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
