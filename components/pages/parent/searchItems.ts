// app/data/searchItems.ts
import { AdjustmentsHorizontalIcon, BuildingOfficeIcon, DocumentTextIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { BookIcon, BusIcon, CalendarIcon } from "components/icons";
import { BookOpenCheck, Images, LucideAlignVerticalJustifyCenter, NotebookTabs } from "lucide-react";
import { MdOutlineAssignment, MdOutlinePlayLesson, MdOutlineRateReview, MdOutlineSchedule } from "react-icons/md";
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
    description: "View your parent dashboard",
    location: "Dashboard",
  },
  {
    id: "2",
    icon: AdjustmentsHorizontalIcon,
    title: "Attendance",
    description: "View your child's attendance records",
    location: "Attendance",
  },
  {
    id: "3",
    icon: LucideAlignVerticalJustifyCenter,
    title: "Leave Validation",
    description: "Review and validate student leave requests",
    location: "Leave Validation",
  },
  {
    id: "4",
    icon: BusIcon,
    title: "Bus Location",
    description: "Check live location of the school bus",
    location: "Bus Location",
  },
  {
    id: "5",
    icon: MdOutlineSchedule,
    title: "Routine",
    description: "View your child's class routine",
    location: "Routine",
  },
  {
    id: "6",
    icon: NotebookTabs,
    title: "Notes",
    description: "Access notes shared by teachers",
    location: "Notes",
  },
  {
    id: "7",
    icon: MdOutlineAssignment,
    title: "Assignment",
    description: "View and track assignments",
    location: "Assignment",
  },
  {
    id: "8",
    icon: Images,
    title: "Gallery",
    description: "Explore photos from school events",
    location: "Gallery",
  },
  {
    id: "9",
    icon: MdOutlinePlayLesson,
    title: "Lesson",
    description: "View lesson plans and study materials",
    location: "Lesson",
  },
  {
    id: "10",
    icon: MdOutlineRateReview,
    title: "Review",
    description: "Check student performance reviews",
    location: "Review",
  },
  {
    id: "11",
    icon: BookOpenCheck,
    title: "Exam",
    description: "View upcoming exams and schedule",
    location: "Exam",
  },
  {
    id: "12",
    icon: PiExam,
    title: "Result",
    description: "View academic results and report cards",
    location: "Result",
  },
];

