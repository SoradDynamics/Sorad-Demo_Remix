// app/data/searchItems.ts
import { AdjustmentsHorizontalIcon, BellAlertIcon, BuildingOfficeIcon, DocumentTextIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { BookIcon, CalendarIcon, MapIcon, UserIcon, WrenchIcon } from "components/icons";
import { BookCheck, CoinsIcon, Image, LucideAlignVerticalJustifyCenter, Star } from "lucide-react";
import { MdOutlineSchedule } from "react-icons/md";

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
    location: "Dashboard",
  },
  {
    id: "2",
    icon: DocumentTextIcon,
    title: "Student >> General",
    description: "Students general component (admission)",
    location: "General",
  },
  {
    id: "3",
    icon: BookIcon,
    title: "Student >> Section",
    description: "Update students sections",
    location: "Section",
  },
  {
    id: "4",
    icon: AdjustmentsHorizontalIcon,
    title: "Student >> Attendance",
    description: "Manage student attendance",
    location: "Attendance",
  },
  {
    id: "5",
    icon: LucideAlignVerticalJustifyCenter,
    title: "Student >> Leave",
    description: "Manage student leave approvals",
    location: "Leave",
  },
  {
    id: "6",
    icon: Star,
    title: "Student >> Review",
    description: "Manage student reviews and feedback",
    location: "Review",
  },
  {
    id: "7",
    icon: DocumentTextIcon,
    title: "Teacher >> Teach_General",
    description: "General teacher data and profile management",
    location: "Teach_General",
  },
  {
    id: "8",
    icon: BookIcon,
    title: "Teacher >> ClassTeacher",
    description: "Assign or view class teacher roles",
    location: "ClassTeacher",
  },
  {
    id: "9",
    icon: BookCheck,
    title: "Teacher >> Lesson",
    description: "Manage teacher lesson plans",
    location: "Lesson",
  },
  {
    id: "10",
    icon: MdOutlineSchedule,
    title: "Routine",
    description: "Manage and view daily routines",
    location: "Routine",
  },
  {
    id: "11",
    icon: CalendarIcon,
    title: "Calendar",
    description: "Nepali calendar for your time series",
    location: "Calendar",
  },
  {
    id: "12",
    icon: Image,
    title: "Gallery",
    description: "School gallery of photos and media",
    location: "Gallery",
  },
  {
    id: "13",
    icon: BellAlertIcon,
    title: "Notification",
    description: "Send or view announcements and alerts",
    location: "Notification",
  },
  {
    id: "14",
    icon: WrenchIcon,
    title: "Transport >> Configure",
    description: "Configure school transport details",
    location: "Configure",
  },
  {
    id: "15",
    icon: MapIcon,
    title: "Transport >> Map",
    description: "View transport routes and map",
    location: "Map",
  },
  {
    id: "16",
    icon: CoinsIcon,
    title: "Result",
    description: "Teacher marks entry and result management",
    location: "Result",
  },
  {
    id: "17",
    icon: BuildingOfficeIcon,
    title: "Configure >> Faculty & Class",
    description: "Configure faculties and classes",
    location: "Faculty & Class",
  },
  {
    id: "18",
    icon: BookIcon,
    title: "Configure >> Section & Subject",
    description: "Configure sections and subjects",
    location: "Section & Subject",
  },
  {
    id: "19",
    icon: DocumentTextIcon,
    title: "Configure >> Exams",
    description: "Manage exam schedules and types",
    location: "Exams",
  },
  {
    id: "20",
    icon: UserIcon,
    title: "Profile",
    description: "View your profile",
    location: "Profile",
  },
];

