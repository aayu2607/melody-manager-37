
import { useAuth } from "@/context/auth-context";
import { useSongs } from "@/context/songs-context";
import { formatDate, truncateText } from "@/lib/utils";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { File, FileText, Image, Trash } from "lucide-react";
import { useState } from "react";
import { SongAttachments } from "./song-attachments";
import { UploadAttachment } from "./upload-attachment";

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  const { user } = useAuth();
  const { deleteSong } = useSongs();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const canDelete = user?.role === "admin" || user?.id === song.userId;

  const handleDelete = async () => {
    await deleteSong(song.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="song-card-hover overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative overflow-hidden">
        {song.imageUrl ? (
          <img
            src={song.imageUrl}
            alt={song.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{truncateText(song.name, 28)}</CardTitle>
        <CardDescription>{truncateText(song.singer, 24)}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex-grow">
        <div className="flex justify-between items-center">
          <div>Added by: {song.username}</div>
          <div>{formatDate(song.createdAt)}</div>
        </div>
        
        <div className="mt-2 flex items-center gap-1">
          <span>Attachments:</span>
          <span className="flex items-center gap-1">
            <span className="flex items-center">
              <Image className="h-3 w-3" /> 
              <span className="ml-1">{song.attachments.filter(a => a.type === "image").length}</span>
            </span>
            <span className="flex items-center ml-2">
              <File className="h-3 w-3" /> 
              <span className="ml-1">{song.attachments.filter(a => a.type === "pdf").length}</span>
            </span>
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAttachments(!showAttachments)}
        >
          {showAttachments ? "Hide Notes" : "View Notes"}
        </Button>
        
        {canDelete && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{song.name}" by {song.singer}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
      
      {showAttachments && (
        <div className="p-4 pt-0 border-t">
          <h4 className="text-sm font-medium mb-2">Notes & Attachments</h4>
          <SongAttachments song={song} />
          <div className="mt-3">
            <UploadAttachment songId={song.id} />
          </div>
        </div>
      )}
    </Card>
  );
}
