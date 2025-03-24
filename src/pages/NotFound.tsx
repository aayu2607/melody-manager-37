
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-fade-in">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Oops! We couldn't find the page you're looking for.
      </p>
      <Button onClick={() => navigate("/")} className="btn-hover">
        Return Home
      </Button>
    </div>
  );
};

export default NotFound;
