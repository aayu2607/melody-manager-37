
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSongs } from "@/context/songs-context";
import { fileToDataUrl, isImageFile, isPdfFile } from "@/lib/utils";
import { FileUp } from "lucide-react";

interface UploadAttachmentProps {
  songId: string;
}

export function UploadAttachment({ songId }: UploadAttachmentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { addAttachment } = useSongs();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (!isImageFile(selectedFile) && !isPdfFile(selectedFile)) {
        toast.error("Please select an image or PDF file.");
        return;
      }
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const fileUrl = await fileToDataUrl(file);
      const fileType = isImageFile(file) ? "image" : "pdf";
      
      await addAttachment(songId, {
        name: file.name,
        url: fileUrl,
        type: fileType
      });
      
      // Reset file input
      setFile(null);
      
      // Reset the file input element
      const fileInput = document.getElementById("attachment-file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast.error("Failed to upload attachment. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="attachment-file" className="text-sm">
        Add Notes (PDF/Image)
      </Label>
      <div className="flex gap-2">
        <Input
          id="attachment-file"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="text-sm"
        />
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          size="sm"
        >
          <FileUp className="h-4 w-4 mr-1" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      {file && (
        <div className="text-xs text-muted-foreground">
          Selected: {file.name}
        </div>
      )}
    </div>
  );
}
