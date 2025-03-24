
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { SongGrid } from "@/components/songs/song-grid";
import { useAuth } from "@/context/auth-context";

const SongsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container max-w-screen-xl mx-auto py-12">
      <PageHeader
        title="Your Song Collection"
        description="Browse, add, and manage your songs and musical notes"
        className="mb-8 animate-fade-in"
      />
      
      <div className="animate-slide-up">
        <SongGrid />
      </div>
    </div>
  );
};

export default SongsPage;
