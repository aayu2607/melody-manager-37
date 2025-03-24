
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/admin-context";
import { formatDate } from "@/lib/utils";
import { Ban, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function UserTable() {
  const { users, banUser, unbanUser, isLoading } = useAdmin();
  const { user: currentUser } = useAuth();
  
  // Filter out admin users from the table
  const regularUsers = users.filter(user => user.role === "user");
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regularUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              regularUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.banned
                          ? "bg-destructive/10 text-destructive"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.banned ? "Banned" : "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.banned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unbanUser(user.id)}
                        disabled={isLoading || !currentUser || currentUser.role !== "admin"}
                        className="btn-hover"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Unban
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => banUser(user.id)}
                        disabled={isLoading || !currentUser || currentUser.role !== "admin"}
                        className="text-destructive border-destructive hover:bg-destructive/10 btn-hover"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Ban
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
