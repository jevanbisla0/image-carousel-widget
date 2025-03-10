
import NotionCarousel from "@/components/NotionCarousel";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const Index = () => {
  const images = [
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    "https://images.unsplash.com/photo-1518770660439-4636190af475",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-sm font-medium tracking-wider text-muted-foreground">NOTION WIDGET</h2>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Image Carousel</h1>
        </div>
        
        <NotionCarousel images={images} />
        
        <div className="bg-muted p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">How to embed in Notion</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Deploy this app to a hosting service (Netlify, Vercel, etc.)</li>
            <li>In your Notion page, type <code className="bg-background px-2 py-1 rounded text-sm">/embed</code></li>
            <li>Select "Embed" from the menu</li>
            <li>Paste your deployed app URL</li>
            <li>Click "Embed link"</li>
          </ol>
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
