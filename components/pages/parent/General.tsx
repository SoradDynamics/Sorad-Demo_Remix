{/* General.tsx */}
// app/components/General.tsx
import React, { useState, useEffect } from 'react';
import Menu from '../../common/Menu';
import TopBar from '../../common/TopBar';
import { CogIcon, CalendarDaysIcon, BookOpenIcon, BuildingOfficeIcon, DocumentTextIcon, ChevronDownIcon, ChevronUpIcon, UserCircleIcon, AdjustmentsHorizontalIcon, HomeIcon } from '@heroicons/react/24/outline'; // Example icons
// import Faculty from './components/Faculty';
// import Section from './components/Section';
import { BookIcon, BusIcon, CalendarIcon, ImportIcon, UserIcon, UsersIcon } from 'components/icons';
import { BookOpenCheck, Images, LucideAlignVerticalJustifyCenter, NotebookTabs } from 'lucide-react';
import { MdOutlineAssignment, MdOutlinePlayLesson, MdOutlineRateReview, MdOutlineSchedule } from 'react-icons/md';
import { PiExam } from 'react-icons/pi';

import ParentExamViewPage from "./components/Exam";
import ParentAttendancePage from "./components/Attendance/ParentAttendancePage";
import ViewStudentRoutinePage from "./components/Routine/ViewStudentRoutinePage";
import ParentNotesPage from "./components/Notes/ParentNotesPage";
import ParentGalleryPage from "./components/Gallery/ParentGalleryPage";
import ParentLessonPlansPage from "./components/Lesson/ParentLessonPlansPage";
import ParentStudentReviewsPage from "./components/Review/ParentStudentReviewsPage";
import ParentAssignmentsPage from "./components/Assignment/ParentAssignmentsPage";
import ParentResultsPage from "./components/Result/ParentResultsPage";
import ParentDashboardPage from "./components/Dashboard";
import MapComponent from '../common/MapComponent';

import Leave from "./components/Leave/Leave";
import Profile from './components/Profile';


interface GeneralComponentProps {
    initialMenuItem?: string | null; // Add initialMenuItem prop
}

interface MenuItem {
    name: string;
    icon: React.ReactNode;
    component?: React.ComponentType<any>; // Optional component to render
    subMenu?: Omit<MenuItem, 'subMenu'>[]; // Optional submenu items - IMPORTANT OMIT
    onClick: () => void; // IMPORTANT ADD
    isSubMenuOpen?: boolean;
    onSubMenuItemClick?: (name: string) => void;
}

const GeneralComponent: React.FC<GeneralComponentProps> = ({ initialMenuItem }) => { // Accept props
    // Use state to track selected menu item, initialize from localStorage or initialMenuItem prop
    const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(() => {
        return initialMenuItem !== undefined ? initialMenuItem : localStorage.getItem('generalComponentMenuItem') || null;
    });

    // State to track expanded submenus, initialized from localStorage
    const [expandedSubMenus, setExpandedSubMenus] = useState<string[]>(() => {
        const storedExpanded = localStorage.getItem('expandedSubMenus');
        return storedExpanded ? JSON.parse(storedExpanded) : [];
    });

    useEffect(() => {
        localStorage.setItem('generalComponentMenuItem', selectedMenuItem || ''); // Save even null as empty string
        localStorage.setItem('expandedSubMenus', JSON.stringify(expandedSubMenus)); // Save expanded submenus
    }, [selectedMenuItem, expandedSubMenus]);

    const toggleSubMenu = (menuName: string) => {
        setExpandedSubMenus(prev =>
            prev.includes(menuName) ? prev.filter(item => item !== menuName) : [...prev, menuName]
        );
    };


    const menuItemsConfig: { [key: string]: { menu: MenuItem[] } } = {
        General: {
            menu: [
              { name: "Dashboard", icon: <HomeIcon className="h-5 w-5" />, component: ParentDashboardPage, onClick: () => {} },
              { name: "Attendance", icon: <AdjustmentsHorizontalIcon className="h-5 w-5" />, component: ParentAttendancePage, onClick: () => {} },
              { name: "Leave Validation", icon: <LucideAlignVerticalJustifyCenter className="h-5 w-5" />, component: Leave, onClick: () => {} },
              { name: "Bus Location", icon: <BusIcon className="h-5 w-5" />, component: MapComponent, onClick: () => {} },
              { name: "Routine", icon: <MdOutlineSchedule className="h-5 w-5" />, component: ViewStudentRoutinePage, onClick: () => {} },
              { name: "Notes", icon: <NotebookTabs className="h-5 w-5" />, component: ParentNotesPage, onClick: () => {} },
              { name: "Assignment", icon: <MdOutlineAssignment className="h-5 w-5" />, component: ParentAssignmentsPage, onClick: () => {} },
              { name: "Gallery", icon: <Images className="h-5 w-5" />, component: ParentGalleryPage, onClick: () => {} },
              { name: "Lesson", icon: <MdOutlinePlayLesson className="h-5 w-5" />, component: ParentLessonPlansPage, onClick: () => {} },
              { name: "Review", icon: <MdOutlineRateReview className="h-5 w-5" />, component: ParentStudentReviewsPage, onClick: () => {} },
              { name: "Exam", icon: <BookOpenCheck className="h-5 w-5" />, component: ParentExamViewPage, onClick: () => {} },
              { name: "Result", icon: <PiExam className="h-5 w-5" />, component: ParentResultsPage, onClick: () => {} },
              { name: 'Profile', icon: <UserIcon className="h-5 w-5" />, component: Profile, onClick: () => {} },
            ]
          }
          
    };
    

    const currentMenuConfig = menuItemsConfig.General.menu; // For now, just using "General" menu

    const handleMenuItemClick = (itemName: string) => {
        setSelectedMenuItem(itemName);
    };

    const handleBackToMenu = () => {
        setSelectedMenuItem(null);
    };

    const renderContent = () => {
        if (selectedMenuItem) {
            const selectedItemConfig = findMenuItem(currentMenuConfig, selectedMenuItem);
            if (selectedItemConfig && selectedItemConfig.component) {
                return (
                    <div>
                        <TopBar title={selectedMenuItem} onBack={handleBackToMenu} />
                        <div className=" mt-[3.25rem] w-full h-fulll">
                            {React.createElement(selectedItemConfig.component)}
                        </div>
                    </div>
                );
            }
        }
        return (
            <div className="">
                <Menu
                    menuItems={currentMenuConfig.map(item => {
                        const mappedItem = {
                            ...item,
                            onClick: () => {
                                if (item.subMenu) {
                                    toggleSubMenu(item.name);
                                } else {
                                    handleMenuItemClick(item.name);
                                }
                            },
                            isSubMenuOpen: expandedSubMenus.includes(item.name),
                            onSubMenuItemClick: (subItemName: string) => {
                                handleMenuItemClick(subItemName);
                            }
                        };
                        return mappedItem;
                    })}
                    selectedMenuItemName={selectedMenuItem}
                    expandedSubMenus={expandedSubMenus}
                />
            </div>
        );
    };

    // Helper function to find a menu item by name, including in submenus
    const findMenuItem = (menuItems: MenuItem[], itemName: string): MenuItem | undefined => {
        for (const item of menuItems) {
            if (item.name === itemName) {
                return item;
            }
            if (item.subMenu) {
                const foundInSubMenu = findMenuItem(item.subMenu as MenuItem[], itemName); // Type assertion because of Omit
                if (foundInSubMenu) {
                    return foundInSubMenu;
                }
            }
        }
        return undefined;
    };


    // // console.log("GeneralComponent: Rendering - selectedMenuItem:", selectedMenuItem); // ADD THIS LOG

    return (
        <div className="">
            {renderContent()}
        </div>
    );
};

export default GeneralComponent;