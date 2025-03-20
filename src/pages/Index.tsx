import NotionCarousel from "@/components/NotionCarousel";

/**
 * Index page - The main page of the application
 * All configuration has been moved into the NotionCarousel component
 */
const Index = () => (
  <div className="notion-container">
    <NotionCarousel height={480} />
  </div>
);

export default Index;
