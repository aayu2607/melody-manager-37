
import { useSongs } from "@/context/songs-context";
import { SongCard } from "./song-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { AddSongForm } from "./add-song-form";
import { useState } from "react";

export function SongGrid() {
  const { songs } = useSongs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {songs.length} {songs.length === 1 ? "Song" : "Songs"}
        </h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Song
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <AddSongForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {songs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium">No songs yet</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Add your first song to get started
          </p>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Song
            </Button>
          </DialogTrigger>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
