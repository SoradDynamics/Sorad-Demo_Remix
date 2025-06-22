// app/data/searchItems.ts
import { AdjustmentsHorizontalIcon, BuildingOfficeIcon, DocumentTextIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { BookIcon, BusIcon, CalendarIcon, DetailIcon, FileIcon } from "components/icons";
import { BookOpenCheck, CalendarSync, Images, NotebookTabs } from "lucide-react";
import { MdOutlineAssignment, MdOutlinePlayLesson, MdOutlineRateReview } from "react-icons/md";
import { PiExam } from "react-icons/pi";

export type SearchItem = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  location: string; // Add the location property
};

export const searchItems: SearchItem[]  = [
  {
    id: "1",
    icon: HomeIcon,
    title: "Dashboard",
    description: "View your student dashboard",
    location: "Dashboard",
  },
  {
    id: "2",
    icon: MdOutlineAssignment,
    title: "Assignment",
    description: "View your assignments",
    location: "Assignment",
  },
  {
    id: "3",
    icon: CalendarIcon,
    title: "Attendance >> Details",
    description: "View attendance details",
    location: "Details",
  },
  {
    id: "4",
    icon: FileIcon,
    title: "Attendance >> Leave Form",
    description: "Submit leave form",
    location: "Leave Form",
  },
  {
    id: "5",
    icon: DetailIcon,
    title: "Attendance >> Leave Details",
    description: "View leave history and status",
    location: "Leave Details",
  },
  {
    id: "6",
    icon: BusIcon,
    title: "Bus Location",
    description: "Track your school bus location",
    location: "Bus Location",
  },
  {
    id: "7",
    icon: CalendarIcon,
    title: "Calendar",
    description: "View academic calendar",
    location: "Calendar",
  },
  {
    id: "8",
    icon: BookOpenCheck,
    title: "Exam",
    description: "View exam details and schedule",
    location: "Exam",
  },
  {
    id: "9",
    icon: Images,
    title: "Gallery",
    description: "Browse school gallery",
    location: "Gallery",
  },
  {
    id: "10",
    icon: MdOutlinePlayLesson,
    title: "Lessons",
    description: "Access lesson plans",
    location: "Lessons",
  },
  {
    id: "11",
    icon: NotebookTabs,
    title: "Notes",
    description: "View class notes and materials",
    location: "Notes",
  },
  {
    id: "12",
    icon: PiExam,
    title: "Result",
    description: "View your exam results",
    location: "Result",
  },
  {
    id: "13",
    icon: MdOutlineRateReview,
    title: "Review",
    description: "Check your reviews and feedback",
    location: "Review",
  },
  {
    id: "14",
    icon: CalendarSync,
    title: "Routine",
    description: "View your daily class routine",
    location: "Routine",
  },
];

