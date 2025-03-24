
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSongs } from "@/context/songs-context";
import { fileToDataUrl } from "@/lib/utils";
import { DialogClose } from "@/components/ui/dialog";

interface AddSongFormProps {
  onSuccess?: () => void;
}

export function AddSongForm({ onSuccess }: AddSongFormProps) {
  const [name, setName] = useState("");
  const [singer, setSinger] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSong } = useSongs();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = "";
      
      if (imageFile) {
        imageUrl = await fileToDataUrl(imageFile);
      }
      
      await addSong({
        name,
        singer,
        imageUrl,
        attachments: []
      });
      
      // Reset form
      setName("");
      setSinger("");
      setImageFile(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding song:", error);
      toast.error("Failed to add song. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }
      setImageFile(file);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Add New Song</CardTitle>
        <CardDescription>
          Fill in the details to add a new song
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Song Name</Label>
            <Input
              id="name"
              placeholder="Enter song name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="singer">Singer</Label>
            <Input
              id="singer"
              placeholder="Enter singer name"
              value={singer}
              onChange={(e) => setSinger(e.target.value)}
              required
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Cover Image (Optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="focus-ring"
            />
            {imageFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {imageFile.name}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Song"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
