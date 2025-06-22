// app/data/searchItems.ts
import { AdjustmentsHorizontalIcon, BuildingOfficeIcon, DocumentTextIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { BookIcon, CalendarIcon, MapIcon } from "components/icons";
import { Star, NotebookTabs } from "lucide-react";
import { MdOutlineAssignment, MdOutlinePlayLesson } from "react-icons/md";
import { PiExam } from "react-icons/pi";

export type SearchItem = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  location: string; // Add the location property
};

export const searchItems: SearchItem[] = [
  {
    id: "1",
    icon: HomeIcon,
    title: "Dashboard",
    description: "View your dashboard",
    location: "Menu",
  },
  {
    id: "2",
    icon: AdjustmentsHorizontalIcon,
    title: "Students >> Leave",
    description: "Approve student leave requests",
    location: "Students",
  },
  {
    id: "3",
    icon: Star,
    title: "Students >> Review",
    description: "Review student performance and feedback",
    location: "Students",
  },
  {
    id: "4",
    icon: MdOutlineAssignment,
    title: "Assignment",
    description: "Manage and review assignments",
    location: "Menu",
  },
  {
    id: "5",
    icon: CalendarIcon,
    title: "Calendar",
    description: "Nepali calendar view",
    location: "Menu",
  },
  {
    id: "6",
    icon: NotebookTabs,
    title: "Notes",
    description: "View and manage notes",
    location: "Menu",
  },
  {
    id: "7",
    icon: MdOutlinePlayLesson,
    title: "Lesson Plan",
    description: "Access and edit lesson plans",
    location: "Menu",
  },
  {
    id: "8",
    icon: MapIcon,
    title: "Bus",
    description: "Track school bus location",
    location: "Menu",
  },
  {
    id: "9",
    icon: PiExam,
    title: "Result",
    description: "Enter and manage exam results",
    location: "Menu",
  },
];
