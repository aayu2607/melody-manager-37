
import { Button } from "@/components/ui/button";
import { FileText, Image } from "lucide-react";
import { Song } from "@/types";

interface SongAttachmentsProps {
  song: Song;
}

export function SongAttachments({ song }: SongAttachmentsProps) {
  if (song.attachments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic py-2">
        No attachments yet. Add notes or files below.
      </div>
    );
  }

  const openAttachment = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-2">
      {song.attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border text-sm"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {attachment.type === "image" ? (
              <Image className="h-4 w-4 flex-shrink-0" />
            ) : (
              <FileText className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="truncate">{attachment.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => openAttachment(attachment.url)}
          >
            View
          </Button>
        </div>
      ))}
    </div>
  );
}
