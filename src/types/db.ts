export type Role = "admin" | "teacher" | "student";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
};

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};
