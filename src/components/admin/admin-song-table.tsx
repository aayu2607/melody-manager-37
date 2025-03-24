
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSongs } from "@/context/songs-context";
import { formatDate, truncateText } from "@/lib/utils";
import { Trash } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function AdminSongTable() {
  const { songs, deleteSong } = useSongs();
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  
  const handleDelete = async () => {
    if (songToDelete) {
      await deleteSong(songToDelete);
      setSongToDelete(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Song</TableHead>
              <TableHead>Singer</TableHead>
              <TableHead>Added By</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead>Attachments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No songs found
                </TableCell>
              </TableRow>
            ) : (
              songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">
                    {truncateText(song.name, 20)}
                  </TableCell>
                  <TableCell>{truncateText(song.singer, 20)}</TableCell>
                  <TableCell>{song.username}</TableCell>
                  <TableCell>{formatDate(song.createdAt)}</TableCell>
                  <TableCell>{song.attachments.length}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive/10 btn-hover"
                          onClick={() => setSongToDelete(song.id)}
                        >
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
