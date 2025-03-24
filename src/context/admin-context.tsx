
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "@/types";
import { useAuth } from "./auth-context";

interface AdminContextType {
  users: User[];
  banUser: (userId: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = localStorage.getItem("melody-users");
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      setIsLoading(false);
    };

    loadUsers();
    
    // Add event listener for storage changes
    window.addEventListener("storage", loadUsers);
    
    return () => {
      window.removeEventListener("storage", loadUsers);
    };
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem("melody-users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    // Trigger storage event for cross-tab consistency
    window.dispatchEvent(new Event("storage"));
  };

  const banUser = async (userId: string) => {
    if (!user || user.role !== "admin") {
      toast.error("You must be an admin to ban users");
      return;
    }

    try {
      const userToBan = users.find(u => u.id === userId);
      
      if (!userToBan) {
        toast.error("User not found");
        return;
      }

      if (userToBan.role === "admin") {
        toast.error("Cannot ban an admin");
        return;
      }

      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, banned: true } : u
      );
      
      saveUsers(updatedUsers);
      toast.success(`User ${userToBan.username} has been banned`);
    } catch (error) {
      console.error("Ban user error:", error);
      toast.error("Failed to ban user. Please try again.");
    }
  };

  const unbanUser = async (userId: string) => {
    if (!user || user.role !== "admin") {
      toast.error("You must be an admin to unban users");
      return;
    }

    try {
      const userToUnban = users.find(u => u.id === userId);
      
      if (!userToUnban) {
        toast.error("User not found");
        return;
      }

      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, banned: false } : u
      );
      
      saveUsers(updatedUsers);
      toast.success(`User ${userToUnban.username} has been unbanned`);
    } catch (error) {
      console.error("Unban user error:", error);
      toast.error("Failed to unban user. Please try again.");
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
