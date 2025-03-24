
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Attachment, Song } from "@/types";
import { useAuth } from "./auth-context";

interface SongsContextType {
  songs: Song[];
  addSong: (song: Omit<Song, "id" | "createdAt" | "userId" | "username">) => Promise<string>;
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
    const storedSongs = localStorage.getItem("melody-songs");
    if (storedSongs) {
      setSongs(JSON.parse(storedSongs));
    }
    setIsLoading(false);
  }, []);

  const saveSongs = (updatedSongs: Song[]) => {
    localStorage.setItem("melody-songs", JSON.stringify(updatedSongs));
    setSongs(updatedSongs);
  };

  const addSong = async (songData: Omit<Song, "id" | "createdAt" | "userId" | "username">): Promise<string> => {
    if (!user) {
      toast.error("You must be logged in to add a song");
      return Promise.reject("Not authenticated");
    }

    try {
      const newSong: Song = {
        ...songData,
        id: crypto.randomUUID(),
        userId: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        attachments: []
      };

      const updatedSongs = [...songs, newSong];
      saveSongs(updatedSongs);
      
      toast.success(`"${songData.name}" by ${songData.singer} added successfully`);
      return newSong.id;
    } catch (error) {
      console.error("Add song error:", error);
      toast.error("Failed to add song. Please try again.");
      return Promise.reject(error);
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

      // Only allow admins or the user who created the song to delete it
      if (user.role !== "admin" && song.userId !== user.id) {
        toast.error("You don't have permission to delete this song");
        return;
      }

      const updatedSongs = songs.filter(s => s.id !== id);
      saveSongs(updatedSongs);
      
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
      const songIndex = songs.findIndex(s => s.id === songId);
      
      if (songIndex === -1) {
        toast.error("Song not found");
        return;
      }

      const newAttachment: Attachment = {
        ...attachmentData,
        id: crypto.randomUUID(),
        songId
      };

      const updatedSongs = [...songs];
      updatedSongs[songIndex] = {
        ...updatedSongs[songIndex],
        attachments: [...updatedSongs[songIndex].attachments, newAttachment]
      };

      saveSongs(updatedSongs);
      toast.success(`Attachment added successfully`);
    } catch (error) {
      console.error("Add attachment error:", error);
      toast.error("Failed to add attachment. Please try again.");
    }
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
