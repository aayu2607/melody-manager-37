
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Music, MusicIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
          <div className="container px-4 md:px-6 space-y-10 text-center">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-balance">
                Welcome to Melody Manager
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                A beautiful place to organize your music collection. Add songs, notes, and collaborate with others.
              </p>
            </div>
            
            <div className="mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate("/songs")}
                  className="btn-hover"
                >
                  <MusicIcon className="mr-2 h-5 w-5" />
                  View Your Songs
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/register")}
                    className="btn-hover"
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate("/login")}
                    className="btn-hover"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-slide-up">
              <div className="flex flex-col items-center space-y-4 glass-morphism p-6 rounded-lg">
                <div className="p-3 rounded-full bg-primary/10">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Organize Music</h3>
                <p className="text-muted-foreground text-center">
                  Easily add and organize your favorite songs with all their details in one place.
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-4 glass-morphism p-6 rounded-lg">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg
                    className="h-6 w-6 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Add Notes & Files</h3>
                <p className="text-muted-foreground text-center">
                  Attach images, PDFs, and other documents to keep all your music resources together.
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-4 glass-morphism p-6 rounded-lg">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg
                    className="h-6 w-6 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">User Management</h3>
                <p className="text-muted-foreground text-center">
                  Control access with user roles and permissions for organized collaboration.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
