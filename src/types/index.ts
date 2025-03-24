
export type UserRole = "user" | "admin";

export type User = {
  id: string;
  username: string;
  role: UserRole;
  banned: boolean;
  createdAt: string;
};

export type Song = {
  id: string;
  name: string;
  singer: string;
  imageUrl: string;
  userId: string;
  username: string;
  createdAt: string;
  attachments: Attachment[];
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf";
  songId: string;
};
