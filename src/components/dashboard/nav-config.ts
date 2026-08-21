import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  ClipboardList,
  FileText,
  Newspaper,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/db";
import { siteConfig } from "@/config/site";

const { courses: COURSES } = siteConfig.terminology;

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  admin: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      label: "Manage",
      items: [
        { title: "Users", href: "/admin/users", icon: Users },
        { title: COURSES, href: "/admin/courses", icon: BookOpen },
        { title: "Enrollments", href: "/admin/enrollments", icon: ClipboardCheck },
        { title: "News", href: "/admin/news", icon: Newspaper },
      ],
    },
    {
      label: "Marketing",
      items: [
        { title: "Site content", href: "/admin/content", icon: FileText },
      ],
    },
  ],
  teacher: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
      ],
    },
    {
      label: "Teaching",
      items: [
        { title: `My ${COURSES}`, href: "/teacher", icon: BookOpen },
        { title: "Grades", href: "/teacher/grades", icon: ClipboardList },
      ],
    },
  ],
  student: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/student", icon: LayoutDashboard },
      ],
    },
    {
      label: "Learning",
      items: [
        { title: COURSES, href: "/student/courses", icon: BookOpen },
        { title: "My Grades", href: "/student/grades", icon: GraduationCap },
        { title: "Timetable", href: "/student/timetable", icon: Calendar },
      ],
    },
  ],
};

