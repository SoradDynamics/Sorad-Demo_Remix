// app/routes/__layout.tsx
import { Outlet } from "@remix-run/react";
import Sidebar from "components/common/Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";
import {
  HomeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import { StudentDataProvider } from "../student/StudentContext";
import ParentDashboardPage from "./components/Dashboard";
import Leave from "./components/Leave/Leave";
import { icon } from "leaflet";
import ParentExamViewPage from "./components/Exam";
import Calender from "../common/Calendaar/Calendar";

import ParentAttendancePage from "./components/Attendance/ParentAttendancePage";
import ViewStudentRoutinePage from "./components/Routine/ViewStudentRoutinePage";
import ParentNotesPage from "./components/Notes/ParentNotesPage";
import ParentGalleryPage from "./components/Gallery/ParentGalleryPage";
import ParentLessonPlansPage from "./components/Lesson/ParentLessonPlansPage";
import ParentStudentReviewsPage from "./components/Review/ParentStudentReviewsPage";
import ParentAssignmentsPage from "./components/Assignment/ParentAssignmentsPage";
import ParentResultsPage from "./components/Result/ParentResultsPage";
import { BookOpenCheck, Calendar, Images, LucideAlignVerticalJustifyCenter, NotebookTabs } from "lucide-react";
import { MdOutlineAssignment, MdOutlinePlayLesson, MdOutlineRateReview, MdOutlineSchedule } from "react-icons/md";
import { BusIcon, CalendarIcon } from "components/icons";
import MapComponent from "../common/MapComponent";
import { PiExam } from "react-icons/pi";


// Define dummy components (as before)
const DashboardComponent = () => {
  return (
    <div>
      <h2>Dashboard Component</h2>
      {/* <DashboardContent />  Use DashboardContent */}
    </div>
  );
};
const GeneralComponent = () => <div><h2>General Component</h2><p>This is the General content under Students.</p></div>;
const AttendanceComponent = () => <div><h2>Attendance Component</h2><p>This is the Attendance content under Students.</p></div>;
const StudentsComponent = () => {
  return (
    <div>
      <h2>Students Main Component</h2>
      {/* <StudentsContent />  Use StudentsContent */}
    </div>
  );
};
const ConfigureComponent = () => <div><h2>Configure Main Component</h2><p>This is the main Configure content.</p></div>;

//New Components

export default function Layout() {
  const [sidebarState, setSidebarState] = useState<number>(() => {
    const storedState = localStorage.getItem('sidebarState');
    return storedState ? parseInt(storedState, 10) : 0;
  });
  const [activeItem, setActiveItem] = useState("Dashboard");

  const toggleSidebar = () => {
    setSidebarState((prevState) => {
      const newState = prevState === 0 ? 1 : 0;
      localStorage.setItem('sidebarState', newState.toString());
      return newState;
    });
  };

  const sidebarItems = [
    { name: "Dashboard", icon: HomeIcon, component: ParentDashboardPage },
    // { name: "Student", icon: HomeIcon, component: StudentsComponent },
    { name: "Attendance", icon: AdjustmentsHorizontalIcon, component:ParentAttendancePage },
    { name: "Leave Validation", icon: LucideAlignVerticalJustifyCenter, component:Leave },
    { name: "Bus Location", icon: BusIcon, component: MapComponent },
    { name: "Calendar", icon: CalendarIcon, component: Calender},
    { name: "Routine", icon: MdOutlineSchedule, component:ViewStudentRoutinePage },
    { name: "Notes", icon: NotebookTabs, component:ParentNotesPage },
    { name: "Assignment", icon: MdOutlineAssignment, component:ParentAssignmentsPage },
    { name: "Gallery", icon: Images, component:ParentGalleryPage },
    { name: "Lesson", icon: MdOutlinePlayLesson, component:ParentLessonPlansPage },
    { name: "Review", icon: MdOutlineRateReview, component:ParentStudentReviewsPage },
    { name: "Exam", icon: BookOpenCheck, component:ParentExamViewPage },
    { name: "Result", icon: PiExam, component:ParentResultsPage },






    // {
    //   name: "Students",
    //   icon: UsersIcon,
    //   component: StudentsComponent,
    //   children: [
    //     { name: "Leave Validation", icon: AdjustmentsHorizontalIcon, component: Leave },
    //   ],
    // },
  ];

  const getActiveComponent = () => {
    const activeSidebarItem = sidebarItems.find(item => item.name === activeItem);
    if (activeSidebarItem && activeSidebarItem.component) {
      return activeSidebarItem.component;
    }
    for (const parentItem of sidebarItems) {
      // if (parentItem.children) {
      //   const activeChildItem = parentItem.children.find(child => child.name === activeItem);
      //   if (activeChildItem && activeChildItem.component) {
      //     return activeChildItem.component;
      //   }
      // }
    }
    return () => <div><h2>Content Not Found</h2><p>No component defined for this menu item.</p></div>;
  };

  const ActiveComponent = getActiveComponent();

  return (
     <StudentDataProvider> 
      <div className="flex min-h-screen max-h-screen bg-gray-100/40">
        <Sidebar
          sidebarState={sidebarState}
          toggleSidebar={toggleSidebar}
          setActiveItem={setActiveItem}
          activeItem={activeItem}
          sidebarItems={sidebarItems}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} setActiveItem={setActiveItem} />

          <main className="flex-1 overflow-auto mb-2 mr-2 max-w-full">
            <ActiveComponent />
            <Outlet />
          </main>
        </div>
      </div>
       </StudentDataProvider> 
  );
}
