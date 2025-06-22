{/* searchitem.tsx */}
// app/data/searchItems.ts
import { AdjustmentsHorizontalIcon, DocumentTextIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { CogIcon, CalendarDaysIcon, BookOpenIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { BookIcon, BusIcon, CalendarIcon, DetailIcon, FileIcon, UserIcon } from "components/icons";
import { BookOpenCheck, CalendarSync, Images, NotebookTabs } from "lucide-react";
import { MdOutlineAssignment, MdOutlinePlayLesson, MdOutlineRateReview } from "react-icons/md";
import { PiExam } from "react-icons/pi";

export type SearchItem = {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    location: string; // 'Menu', 'Dashboard', etc. - for top-level component
    generalMenuLocation?: string; // Optional: Specific menu item in GeneralComponent
};

export const searchItems: SearchItem[] = [
  { id: "1", icon: HomeIcon, title: "Dashboard", description: "Student dashboard overview", location: "Dashboard", generalMenuLocation: "Dashboard" },

  { id: "2", icon: MdOutlineAssignment, title: "Assignment", description: "View your assignments", location: "Assignment", generalMenuLocation: "Assignment" },

  // Attendance Section
  { id: "3", icon: CalendarIcon, title: "Attendance >> Details", description: "Daily attendance details", location: "Attendance", generalMenuLocation: "Details" },
  { id: "4", icon: FileIcon, title: "Attendance >> Leave Form", description: "Submit a leave request", location: "Attendance", generalMenuLocation: "Leave Form" },
  { id: "5", icon: DetailIcon, title: "Attendance >> Leave Details", description: "Track your leave records", location: "Attendance", generalMenuLocation: "Leave Details" },

  { id: "6", icon: BusIcon, title: "Bus Location", description: "Live bus tracking for students", location: "Transport", generalMenuLocation: "Bus Location" },

  { id: "7", icon: CalendarIcon, title: "Calendar", description: "View academic calendar", location: "Calendar", generalMenuLocation: "Calendar" },

  { id: "8", icon: BookOpenCheck, title: "Exam", description: "View your exam schedule and results", location: "Exam", generalMenuLocation: "Exam" },

  { id: "9", icon: Images, title: "Gallery", description: "Explore the image gallery", location: "Gallery", generalMenuLocation: "Gallery" },

  { id: "10", icon: MdOutlinePlayLesson, title: "Lessons", description: "Review your lesson plans", location: "Lessons", generalMenuLocation: "Lessons" },

  { id: "11", icon: NotebookTabs, title: "Notes", description: "Access your study notes", location: "Notes", generalMenuLocation: "Notes" },

  { id: "12", icon: PiExam, title: "Result", description: "View your academic results", location: "Result", generalMenuLocation: "Result" },

  { id: "13", icon: MdOutlineRateReview, title: "Review", description: "Manage and view your reviews", location: "Review", generalMenuLocation: "Review" },

  { id: "14", icon: CalendarSync, title: "Routine", description: "Check your class routine", location: "Routine", generalMenuLocation: "Routine" },
];
