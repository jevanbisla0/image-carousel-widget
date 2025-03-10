
import NotionCarousel from "@/components/NotionCarousel";

const Index = () => {
  const images = [
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    "https://images.unsplash.com/photo-1518770660439-4636190af475",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
  ];

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-sm font-medium tracking-wider text-muted-foreground">NOTION-STYLE</h2>
          <h1 className="text-4xl font-bold tracking-tight">Image Carousel</h1>
        </div>
        <NotionCarousel images={images} />
      </div>
    </div>
  );
};

export default Index;
