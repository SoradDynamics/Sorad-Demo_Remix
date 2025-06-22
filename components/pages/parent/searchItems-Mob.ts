{/* searchitem.tsx */}
// app/data/searchItems.ts
import { AdjustmentsHorizontalIcon, CalendarIcon, DocumentTextIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { CogIcon, CalendarDaysIcon, BookOpenIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { BookIcon, BusIcon, UserIcon } from "components/icons";
import { BookOpenCheck, Images, LucideAlignVerticalJustifyCenter, NotebookTabs } from "lucide-react";
import { MdOutlineSchedule, MdOutlineAssignment, MdOutlinePlayLesson, MdOutlineRateReview } from "react-icons/md";
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
  {
    id: "101",
    icon: HomeIcon,
    title: "Dashboard",
    description: "View your dashboard",
    location: "Menu",
    generalMenuLocation: "Dashboard",
  },
  {
    id: "102",
    icon: AdjustmentsHorizontalIcon,
    title: "Attendance",
    description: "View student's attendance",
    location: "Menu",
    generalMenuLocation: "Attendance",
  },
  {
    id: "103",
    icon: LucideAlignVerticalJustifyCenter,
    title: "Leave Validation",
    description: "View leave requests and validations",
    location: "Menu",
    generalMenuLocation: "Leave Validation",
  },
  {
    id: "104",
    icon: BusIcon,
    title: "Bus Location",
    description: "Track school bus location",
    location: "Menu",
    generalMenuLocation: "Bus Location",
  },
  {
    id: "105",
    icon: MdOutlineSchedule,
    title: "Routine",
    description: "View class routine",
    location: "Menu",
    generalMenuLocation: "Routine",
  },
  {
    id: "106",
    icon: NotebookTabs,
    title: "Notes",
    description: "Access class notes",
    location: "Menu",
    generalMenuLocation: "Notes",
  },
  {
    id: "107",
    icon: MdOutlineAssignment,
    title: "Assignment",
    description: "Check your assignments",
    location: "Menu",
    generalMenuLocation: "Assignment",
  },
  {
    id: "108",
    icon: Images,
    title: "Gallery",
    description: "View photo gallery",
    location: "Menu",
    generalMenuLocation: "Gallery",
  },
  {
    id: "109",
    icon: MdOutlinePlayLesson,
    title: "Lesson",
    description: "Access lesson plans",
    location: "Menu",
    generalMenuLocation: "Lesson",
  },
  {
    id: "110",
    icon: MdOutlineRateReview,
    title: "Review",
    description: "Review student performance",
    location: "Menu",
    generalMenuLocation: "Review",
  },
  {
    id: "111",
    icon: BookOpenCheck,
    title: "Exam",
    description: "Check upcoming exams",
    location: "Menu",
    generalMenuLocation: "Exam",
  },
  {
    id: "112",
    icon: PiExam,
    title: "Result",
    description: "View student results",
    location: "Menu",
    generalMenuLocation: "Result",
  },
];