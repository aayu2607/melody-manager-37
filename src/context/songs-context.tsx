
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Attachment, Song } from "@/types";
import { useAuth } from "./auth-context";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

interface SongsContextType {
  songs: Song[];
  addSong: (song: Omit<Song, "id" | "createdAt" | "userId" | "username" | "attachments">) => Promise<string | null>;
  deleteSong: (id: string) => Promise<void>;
  addAttachment: (songId: string, attachment: Omit<Attachment, "id" | "songId">) => Promise<void>;
  isLoading: boolean;
}

const SongsContext = createContext<SongsContextType | undefined>(undefined);

export function SongsProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSongs();
    } else {
      setSongs([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      // Fetch songs with user information
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select(`
          id,
          name,
          singer,
          image_url,
          user_id,
          created_at,
          users:user_id (username)
        `)
        .order('created_at', { ascending: false });

      if (songsError) {
        throw songsError;
      }

      // Fetch attachments for each song
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*');

      if (attachmentsError) {
        throw attachmentsError;
      }

      // Map the data to our application's format
      const formattedSongs: Song[] = songsData.map(song => {
        const songAttachments = attachmentsData.filter(att => att.song_id === song.id).map(att => ({
          id: att.id,
          name: att.name,
          url: att.url,
          type: att.type as 'image' | 'pdf',
          songId: att.song_id
        }));

        return {
          id: song.id,
          name: song.name,
          singer: song.singer,
          imageUrl: song.image_url || '',
          userId: song.user_id,
          username: song.users?.username || 'Unknown',
          createdAt: song.created_at,
          attachments: songAttachments
        };
      });

      setSongs(formattedSongs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      toast.error("Failed to load songs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSong = async (songData: Omit<Song, "id" | "createdAt" | "userId" | "username" | "attachments">): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to add a song");
      return null;
    }

    try {
      let imageUrl = songData.imageUrl;

      // If there's an image to upload, handle it first
      if (imageUrl && imageUrl.startsWith('data:')) {
        const fileName = `song-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const fileExtension = imageUrl.split(';')[0].split('/')[1];
        const filePath = `${user.id}/${fileName}.${fileExtension}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('song_assets')
          .upload(filePath, base64ToBlob(imageUrl), {
            contentType: `image/${fileExtension}`,
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('song_assets')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // Insert song data into the database
      const { data, error } = await supabase
        .from('songs')
        .insert([
          {
            name: songData.name,
            singer: songData.singer,
            image_url: imageUrl,
            user_id: user.id
          }
        ])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      toast.success(`"${songData.name}" by ${songData.singer} added successfully`);
      
      // Refresh the songs list
      fetchSongs();
      
      return data.id;
    } catch (error) {
      console.error("Add song error:", error);
      toast.error("Failed to add song. Please try again.");
      return null;
    }
  };

  const deleteSong = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete a song");
      return;
    }

    try {
      const song = songs.find(s => s.id === id);
      
      if (!song) {
        toast.error("Song not found");
        return;
      }

      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      
      // Update UI immediately
      setSongs(songs.filter(s => s.id !== id));
      toast.success(`"${song.name}" removed successfully`);
    } catch (error) {
      console.error("Delete song error:", error);
      toast.error("Failed to delete song. Please try again.");
    }
  };

  const addAttachment = async (songId: string, attachmentData: Omit<Attachment, "id" | "songId">) => {
    if (!user) {
      toast.error("You must be logged in to add an attachment");
      return;
    }

    try {
      const song = songs.find(s => s.id === songId);
      
      if (!song) {
        toast.error("Song not found");
        return;
      }

      // If attachment is a data URL, upload it to storage first
      let attachmentUrl = attachmentData.url;
      if (attachmentUrl.startsWith('data:')) {
        const fileName = `attachment-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const fileExtension = attachmentData.type === 'image' 
          ? attachmentUrl.split(';')[0].split('/')[1]
          : 'pdf';
        const filePath = `${user.id}/${fileName}.${fileExtension}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('song_assets')
          .upload(filePath, base64ToBlob(attachmentUrl), {
            contentType: attachmentData.type === 'image' 
              ? `image/${fileExtension}`
              : 'application/pdf',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('song_assets')
          .getPublicUrl(filePath);

        attachmentUrl = publicUrlData.publicUrl;
      }

      // Insert attachment into database
      const { data, error } = await supabase
        .from('attachments')
        .insert([
          {
            name: attachmentData.name,
            url: attachmentUrl,
            type: attachmentData.type,
            song_id: songId
          }
        ])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Update songs state with new attachment
      const newAttachment: Attachment = {
        id: data.id,
        name: attachmentData.name,
        url: attachmentUrl,
        type: attachmentData.type,
        songId
      };

      setSongs(prevSongs => {
        return prevSongs.map(s => {
          if (s.id === songId) {
            return {
              ...s,
              attachments: [...s.attachments, newAttachment]
            };
          }
          return s;
        });
      });

      toast.success(`Attachment added successfully`);
    } catch (error) {
      console.error("Add attachment error:", error);
      toast.error("Failed to add attachment. Please try again.");
    }
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <SongsContext.Provider value={{ songs, addSong, deleteSong, addAttachment, isLoading }}>
      {children}
    </SongsContext.Provider>
  );
}

export function useSongs() {
  const context = useContext(SongsContext);
  if (context === undefined) {
    throw new Error("useSongs must be used within a SongsProvider");
  }
  return context;
}
