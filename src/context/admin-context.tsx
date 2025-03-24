
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "@/types";
import { useAuth } from "./auth-context";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextType {
  users: User[];
  banUser: (id: string) => Promise<void>;
  unbanUser: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    if (!user || user.role !== 'admin') {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedUsers: User[] = data.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        banned: u.banned,
        createdAt: u.created_at
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (id: string) => {
    if (!user || user.role !== 'admin') {
      toast.error("You must be an admin to ban users");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ banned: true })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setUsers(users.map(u => 
        u.id === id ? { ...u, banned: true } : u
      ));
      
      toast.success("User banned successfully");
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const unbanUser = async (id: string) => {
    if (!user || user.role !== 'admin') {
      toast.error("You must be an admin to unban users");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ banned: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setUsers(users.map(u => 
        u.id === id ? { ...u, banned: false } : u
      ));
      
      toast.success("User unbanned successfully");
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{ users, banUser, unbanUser, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
