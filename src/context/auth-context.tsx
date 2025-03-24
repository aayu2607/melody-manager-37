
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (username: string, code: string) => Promise<void>;
  register: (username: string, code: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("melody-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const saveUser = (user: User) => {
    localStorage.setItem("melody-user", JSON.stringify(user));
    setUser(user);
  };

  const validateCode = (code: string): UserRole | null => {
    if (code === "Suyog") return "user";
    if (code === "Ayush") return "admin";
    return null;
  };

  const login = async (username: string, code: string) => {
    setIsLoading(true);
    try {
      // Validate users from localStorage
      const usersJSON = localStorage.getItem("melody-users") || "[]";
      const users: User[] = JSON.parse(usersJSON);
      
      const existingUser = users.find(u => u.username === username);
      
      if (!existingUser) {
        toast.error("User not found. Please register first.");
        setIsLoading(false);
        return;
      }
      
      if (existingUser.banned) {
        toast.error("Your account has been banned. Please contact an administrator.");
        setIsLoading(false);
        return;
      }
      
      const role = validateCode(code);
      
      if (!role) {
        toast.error("Invalid code. Please try again.");
        setIsLoading(false);
        return;
      }
      
      if (role !== existingUser.role) {
        toast.error(`This user is registered as a ${existingUser.role}, not a ${role}.`);
        setIsLoading(false);
        return;
      }

      // Successful login
      saveUser(existingUser);
      toast.success(`Welcome back, ${username}!`);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, code: string) => {
    setIsLoading(true);
    try {
      const role = validateCode(code);
      
      if (!role) {
        toast.error("Invalid code. Please use 'Suyog' for users or 'Ayush' for admins.");
        setIsLoading(false);
        return;
      }

      // Check if username exists
      const usersJSON = localStorage.getItem("melody-users") || "[]";
      const users: User[] = JSON.parse(usersJSON);
      
      if (users.some(u => u.username === username)) {
        toast.error("Username already exists. Please choose another one.");
        setIsLoading(false);
        return;
      }

      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        role,
        banned: false,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem("melody-users", JSON.stringify([...users, newUser]));
      
      // Log in the new user
      saveUser(newUser);
      toast.success(`Welcome, ${username}! You are registered as a ${role}.`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("melody-user");
    setUser(null);
    toast.success("Logged out successfully");
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
