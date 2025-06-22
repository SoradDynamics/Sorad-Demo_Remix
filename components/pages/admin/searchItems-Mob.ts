{/* searchitem.tsx */}
// app/data/searchItems.ts
import { AdjustmentsHorizontalIcon, BellAlertIcon, CalendarIcon, DocumentTextIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { CogIcon, CalendarDaysIcon, BookOpenIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { BookIcon, MapIcon, UserIcon, WrenchIcon } from "components/icons";
import { BookCheck, CoinsIcon, Image, LucideAlignVerticalJustifyCenter, Star } from "lucide-react";
import { MdOutlineSchedule } from "react-icons/md";

export type SearchItem = {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    location: string; // 'Menu', 'Dashboard', etc. - for top-level component
    generalMenuLocation?: string; // Optional: Specific menu item in GeneralComponent
};

export const searchItems: SearchItem[] = [
  { id: "1", icon: UserIcon, title: "Profile", description: "View your profile", location: "Menu", generalMenuLocation: "Profile" },

  // Dashboard
  { id: "2", icon: HomeIcon, title: "Dashboard", description: "Admin dashboard overview", location: "Menu", generalMenuLocation: "Dashboard" },

  // Students
  { id: "3", icon: DocumentTextIcon, title: "Student >> General", description: "Student admission and general info", location: "Students", generalMenuLocation: "General" },
  { id: "4", icon: BookIcon, title: "Student >> Section", description: "Assign students to sections", location: "Students", generalMenuLocation: "Section" },
  { id: "5", icon: AdjustmentsHorizontalIcon, title: "Student >> Attendance", description: "Track and manage student attendance", location: "Students", generalMenuLocation: "Attendance" },
  { id: "6", icon: LucideAlignVerticalJustifyCenter, title: "Student >> Leave", description: "Approve or reject student leave requests", location: "Students", generalMenuLocation: "Leave" },
  { id: "7", icon: Star, title: "Student >> Review", description: "Review student feedback and performance", location: "Students", generalMenuLocation: "Review" },

  // Teacher
  { id: "8", icon: DocumentTextIcon, title: "Teacher >> Teach_General", description: "Manage teacher profiles", location: "Teacher", generalMenuLocation: "Teach_General" },
  { id: "9", icon: BookIcon, title: "Teacher >> ClassTeacher", description: "Assign class teachers", location: "Teacher", generalMenuLocation: "ClassTeacher" },
  { id: "10", icon: BookCheck, title: "Teacher >> Lesson", description: "Manage lesson plans", location: "Teacher", generalMenuLocation: "Lesson" },

  // Routine
  { id: "11", icon: MdOutlineSchedule, title: "Routine", description: "Routine and class scheduling", location: "Routine", generalMenuLocation: "Routine" },

  // Calendar
  { id: "12", icon: CalendarIcon, title: "Calendar", description: "Nepali calendar for planning", location: "Calendar", generalMenuLocation: "Calendar" },

  // Gallery
  { id: "13", icon: Image, title: "Gallery", description: "View and manage image gallery", location: "Gallery", generalMenuLocation: "Gallery" },

  // Notification
  { id: "14", icon: BellAlertIcon, title: "Notification", description: "View and send system notifications", location: "Notification", generalMenuLocation: "Notification" },

  // Transport
  { id: "15", icon: WrenchIcon, title: "Transport >> Configure", description: "Configure school transport details", location: "Transport", generalMenuLocation: "Configure" },
  { id: "16", icon: MapIcon, title: "Transport >> Map", description: "Visualize transport routes and maps", location: "Transport", generalMenuLocation: "Map" },

  // Result
  { id: "17", icon: CoinsIcon, title: "Result", description: "Teacher marks entry system", location: "Result", generalMenuLocation: "Result" },

  // Configure
  { id: "18", icon: BuildingOfficeIcon, title: "Configure >> Faculty & Class", description: "Set up faculties and classes", location: "Configure", generalMenuLocation: "Faculty & Class" },
  { id: "19", icon: BookIcon, title: "Configure >> Section & Subject", description: "Define sections and subjects", location: "Configure", generalMenuLocation: "Section & Subject" },
  { id: "20", icon: DocumentTextIcon, title: "Configure >> Exams", description: "Manage exam settings and schedules", location: "Configure", generalMenuLocation: "Exams" },
];
