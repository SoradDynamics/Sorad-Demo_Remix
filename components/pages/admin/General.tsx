{/* General.tsx */}
// app/components/General.tsx
import React, { useState, useEffect } from 'react';
import Menu from '../../common/Menu';
import TopBar from '../../common/TopBar';
import { CogIcon, CalendarDaysIcon, BookOpenIcon, BuildingOfficeIcon, DocumentTextIcon, ChevronDownIcon, ChevronUpIcon, UserCircleIcon, AdjustmentsHorizontalIcon, BellAlertIcon } from '@heroicons/react/24/outline'; // Example icons
import Faculty from './components/Faculty';
import Section from './components/Section';
import { BookIcon, BusIcon, CalendarIcon, ImportIcon, MapIcon, UserIcon, UsersIcon, WrenchIcon } from 'components/icons';
import Student from './components/Student';
import stdSection from './components/stdSection';
import Calender from './components/Calendar';
import Std_Import from './components/Std_Import';
import Navbar from './Navbar';
import Notification from './components/Notification';
import ApproveLeavePage from './components/LeaveApprove/ApproveLeavePage';
import AdminReviewManagementPage from './components/Review/AdminReviewManagementPage';
import TeacherPage from './components/Teacher';
import AssignClassTeacherPage from './components/ClassTeacher/AssignClassTeacherPage';
import { BookCheck, CoinsIcon, Images, LucideAlignVerticalJustifyCenter, Star } from 'lucide-react';
import AdminLessonPlansPage from './components/LessonPlan/AdminLessonPlansPage';
import GalleryPage from './components/Gallery/GalleryPage';
import Transport from './components/Transport';
import MapComponent from '../common/MapComponent';
import { MdOutlineSchedule } from 'react-icons/md';
import RoutineManagementPage from './components/Routine/RoutineManagementPage';
import TeacherMarksEntryPage from '../common/Result/components/TeacherMarksEntryPage';
import { PiExam, PiExamDuotone } from 'react-icons/pi';
import Profile from './Profile';

const AttendanceComponent = () => <div><h2>Attendance Component</h2><p>This is the Attendance content under Students.</p></div>;


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
                {
                    name: 'Students', icon: <UsersIcon className='h-5 w-5' />, onClick: () => {},
                    subMenu: [
                        { name: 'General', icon: <DocumentTextIcon className='h-5 w-5' />, component: Student, onClick: () => {} },
                        { name: 'Section', icon: <BookIcon className='h-5 w-5' />, component: stdSection, onClick: () => {} },
                        { name: 'Attendance', icon: <AdjustmentsHorizontalIcon className='h-5 w-5' />, component: AttendanceComponent, onClick: () => {} },
                        // { name: 'Import Data', icon: <ImportIcon className='h-5 w-5' />, component: Std_Import, onClick: () => {} }
                        { name: 'Leave', icon: <LucideAlignVerticalJustifyCenter className='h-5 w-5' />, component: ApproveLeavePage, onClick: () => {} },
                        { name: 'Review', icon: <Star className='h-5 w-5' />, component: AdminReviewManagementPage, onClick: () => {} },
                    
                    ]
                },
                {
                    name: 'Teacher', icon: <UserCircleIcon className='h-5 w-5' />, onClick: () => {},
                    subMenu: [
                        { name: 'Teach_General', icon: <DocumentTextIcon className='h-5 w-5' />, component: TeacherPage, onClick: () => {} },
                        { name: 'ClassTeacher', icon: <BookIcon className='h-5 w-5' />, component: AssignClassTeacherPage, onClick: () => {} },
                        { name: 'Lesson', icon: <BookCheck className='h-5 w-5' />, component: AdminLessonPlansPage, onClick: () => {} },
                       
                    ]
                },
                { name: 'Routine', icon: <MdOutlineSchedule className="h-5 w-5" />, component: RoutineManagementPage, onClick: () => {} },
                { name: 'Calendar', icon: <CalendarIcon className="h-5 w-5" />, component: Calender, onClick: () => {} },
                { name: 'Gallery', icon: <Images className="h-5 w-5" />, component: GalleryPage, onClick: () => {} },
                { name: 'Notification', icon: <BellAlertIcon className="h-5 w-5" />, component: Notification, onClick: () => {} },


                {
                    name: 'Transport', icon: <BusIcon className='h-6 w-6' />, onClick: () => {},
                    subMenu: [
                        { name: 'Configure', icon: <WrenchIcon className='h-5 w-5' />, component: Transport, onClick: () => {} },
                        { name: 'Map', icon: <MapIcon className='h-5 w-5' />, component: MapComponent, onClick: () => {} },

                    ]
                },
                { name: 'Result', icon: <CoinsIcon className="h-5 w-5" />, component: TeacherMarksEntryPage, onClick: () => {} },

                {
                    name: 'Configure', icon: <CogIcon className='h-6 w-6' />, onClick: () => {},
                    subMenu: [
                        { name: 'Faculty & Class', icon: <BuildingOfficeIcon className='h-5 w-5' />, component: Faculty, onClick: () => {} },
                        { name: 'Section & Subject', icon: <BookIcon className='h-5 w-5' />, component: Section, onClick: () => {} },
                        { name: 'Exams', icon: <PiExam className='h-5 w-5' />, component: Faculty, onClick: () => {} },

                    ]
                },


                { name: 'Profile', icon: <UserIcon className="h-5 w-5" />, component: Profile, onClick: () => {} },
            ],
        },
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