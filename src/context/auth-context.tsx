
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, code: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          username: data.username,
          role: data.role as UserRole,
          banned: data.banned,
          createdAt: data.created_at
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateCode = (code: string): UserRole | null => {
    if (code === "Ayush") return "user";
    if (code === "Suyog") return "admin";
    return null;
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@melody.app`, // Using username as email
        password: password
      });

      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        toast.success(`Welcome back, ${username}!`);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, code: string) => {
    setIsLoading(true);
    try {
      const role = validateCode(code);
      
      if (!role) {
        toast.error("Invalid access code. Please try again.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: `${username}@melody.app`, // Using username as email
        password: password,
        options: {
          data: {
            username: username,
            role: role
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        toast.success(`Welcome, ${username}! Your account has been created.`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
