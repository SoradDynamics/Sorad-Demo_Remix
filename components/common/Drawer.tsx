// src/common/Drawer.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useId,
} from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
// --- Types ---

type DrawerPosition = 'left' | 'right';
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface DrawerContextProps {
  onClose: () => void;
  titleId: string;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: DrawerPosition;
  size?: DrawerSize;
  title?: string;
  nonDismissable?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

interface DrawerHeaderProps {
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

// --- Context ---

const DrawerContext = createContext<DrawerContextProps | null>(null);

const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer compound components must be used within a Drawer');
  }
  return context;
};

// --- Size Mapping ---

const sizeClasses: Record<DrawerSize, string> = {
  sm: 'w-64 max-w-full',
  md: 'w-96 max-w-full', // Default
  lg: 'w-[32rem] max-w-full', // 512px
  xl: 'w-[48rem] max-w-full', // 768px
  full: 'w-full',
};

// --- Main Drawer Component ---

export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  title,
  nonDismissable = false,
  'aria-labelledby': ariaLabelledbyProp,
  'aria-describedby': ariaDescribedbyProp,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const generatedTitleId = useId();
  const titleId = ariaLabelledbyProp || generatedTitleId;

  // Close on Escape key (conditionally)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!nonDismissable && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, nonDismissable]);

  // Close on overlay click (conditionally)
  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!nonDismissable && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Focus trapping (basic example)
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        if (focusableElements.length === 0) return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      };

      if (firstElement) {
        firstElement.focus();
      } else if (drawerRef.current) {
         drawerRef.current.setAttribute('tabindex', '-1');
         drawerRef.current.focus();
      }

      const currentDrawerRef = drawerRef.current;
      currentDrawerRef?.addEventListener('keydown', handleTabKey);
      return () => currentDrawerRef?.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

   // Prevent body scroll when drawer is open
   useEffect(() => {
      if (isOpen) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = '';
      }
      return () => {
          document.body.style.overflow = '';
      };
  }, [isOpen]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <DrawerContext.Provider value={{ onClose, titleId }}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 dark:bg-gray-900/80 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${nonDismissable ? 'cursor-default' : 'cursor-pointer'
        }`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* --- MODIFIED: Drawer Panel is now a flex container --- */}
      <div
        ref={drawerRef}
        className={`fixed top-0 bottom-0 z-50 flex h-full flex-col bg-white/90 shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          sizeClasses[size]
        } ${position === 'right' ? 'right-0' : 'left-0'} ${
          isOpen
            ? 'translate-x-0'
            : position === 'right'
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedbyProp}
      >
        {/* Render simple title if provided and no Drawer.Header is found */}
        {title && !React.Children.toArray(children).some(child => (child as React.ReactElement).type === DrawerHeader) && (
          <DrawerHeader showCloseButton={!nonDismissable}>
             <h2 id={titleId} className="text-lg font-semibold text-gray-800 dark:text-white">
              {title}
            </h2>
          </DrawerHeader>
        )}

        {/* Render provided children (Header, Body, Footer) as they are */}
        {children}

      </div>
    </DrawerContext.Provider>,
    document.body
  );
}

// --- Drawer Header --- (No changes needed)
const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  children,
  showCloseButton = true,
  className = '',
}) => {
  const { onClose, titleId } = useDrawerContext();
  return (
    <div
      className={`flex shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 ${className}`}
    >
      <div id={titleId} className="flex-grow text-lg font-semibold text-gray-800 dark:text-white">
         {children}
      </div>
      {showCloseButton && (
        <button
          type="button"
          className="-mr-2 ml-4 rounded-md p-1 font-bold text-gray-600 hover:bg-gray-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
          aria-label="Close drawer"
        >
          <XMarkIcon className="h-6 w-6 font-bold" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

// --- MODIFIED: Drawer Body ---
// It now grows to fill space and handles its own scrolling.
const DrawerBody: React.FC<DrawerBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex-1 overflow-y-auto ${className}`}>
      <PerfectScrollbar options={{ suppressScrollX: true }}>
          <div className='p-4'>
              {children}
          </div>
      </PerfectScrollbar>
    </div>
  );
};

// --- MODIFIED: Drawer Footer ---
// Ensures it doesn't shrink. z-index is handled by document flow.
const DrawerFooter: React.FC<DrawerFooterProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`flex shrink-0 -z-50 justify-end space-x-2 border-t border-gray-200 bg-white/90 p-4 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {children}
    </div>
  );
};

// --- Assign Compound Components ---
Drawer.Header = DrawerHeader;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;