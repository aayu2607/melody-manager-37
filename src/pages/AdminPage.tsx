
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "@/components/admin/user-table";
import { AdminSongTable } from "@/components/admin/admin-song-table";

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);
  
  if (!user || user.role !== "admin") {
    return null;
  }
  
  return (
    <div className="container max-w-screen-xl mx-auto py-12">
      <PageHeader
        title="Admin Dashboard"
        description="Manage users and content"
        className="mb-8 animate-fade-in"
      />
      
      <div className="space-y-8 animate-slide-up">
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="songs">Song Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-muted-foreground mb-4">
              Control user access by banning or unbanning users.
            </p>
            <UserTable />
          </TabsContent>
          
          <TabsContent value="songs" className="space-y-4">
            <h2 className="text-xl font-semibold">Song Management</h2>
            <p className="text-muted-foreground mb-4">
              Review and manage all songs in the system.
            </p>
            <AdminSongTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
