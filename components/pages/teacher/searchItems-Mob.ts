{/* searchitem.tsx */}
// app/data/searchItems.ts
import { AdjustmentsHorizontalIcon, CalendarIcon, DocumentTextIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { CogIcon, CalendarDaysIcon, BookOpenIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { BookIcon, MapIcon, UserIcon } from "components/icons";
import { Star, NotebookTabs } from "lucide-react";
import { MdOutlineAssignment, MdOutlinePlayLesson } from "react-icons/md";
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
    id: "1",
    icon: UserIcon,
    title: "Profile",
    description: "View your profile",
    location: "Menu",
    generalMenuLocation: "Profile",
  },
  {
    id: "2",
    icon: DocumentTextIcon,
    title: "Student >> General",
    description: "Students general component (admission)",
    location: "Menu",
    generalMenuLocation: "General",
  },
  {
    id: "3",
    icon: BookIcon,
    title: "Student >> Section",
    description: "Update students sections",
    location: "Menu",
    generalMenuLocation: "Section",
  },
  {
    id: "4",
    icon: AdjustmentsHorizontalIcon,
    title: "Student >> Attendance",
    description: "Manage student attendance",
    location: "Menu",
    generalMenuLocation: "Attendance",
  },
  {
    id: "5",
    icon: BuildingOfficeIcon,
    title: "Configure >> Faculty & Class",
    description: "Configure faculties and classes",
    location: "Faculty & Class",
    generalMenuLocation: "Faculty & Classes",
  },

  // 👇 Added from Teacher Sidebar Items
  {
    id: "6",
    icon: HomeIcon,
    title: "Dashboard",
    description: "Teacher dashboard overview",
    location: "Menu",
    generalMenuLocation: "Dashboard",
  },
  {
    id: "7",
    icon: AdjustmentsHorizontalIcon,
    title: "Students >> Leave",
    description: "Approve student leave requests",
    location: "Menu",
    generalMenuLocation: "Leave",
  },
  {
    id: "8",
    icon: Star,
    title: "Students >> Review",
    description: "Student performance reviews",
    location: "Menu",
    generalMenuLocation: "Std Review",
  },
  {
    id: "9",
    icon: MdOutlineAssignment,
    title: "Assignment",
    description: "Manage assignments",
    location: "Menu",
    generalMenuLocation: "Assignment",
  },
  {
    id: "10",
    icon: CalendarIcon,
    title: "Calendar",
    description: "Academic calendar",
    location: "Menu",
    generalMenuLocation: "Calendar",
  },
  {
    id: "11",
    icon: NotebookTabs,
    title: "Notes",
    description: "Subject notes and resources",
    location: "Menu",
    generalMenuLocation: "Notes",
  },
  {
    id: "12",
    icon: MdOutlinePlayLesson,
    title: "Lesson Plan",
    description: "View and create lesson plans",
    location: "Menu",
    generalMenuLocation: "Lesson Plan",
  },
  {
    id: "13",
    icon: MapIcon,
    title: "Bus",
    description: "Bus location and routes",
    location: "Menu",
    generalMenuLocation: "Bus",
  },
  {
    id: "14",
    icon: PiExam,
    title: "Result",
    description: "Marks entry and result view",
    location: "Menu",
    generalMenuLocation: "Result",
  },
];
