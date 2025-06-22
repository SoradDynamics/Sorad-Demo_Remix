// src/components/common/Modal.tsx
import React, { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void; // This is the function to call when the modal SHOULD close (e.g., via X button)
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    // This function will be called by Headless UI's Dialog when it thinks it should close
    // (e.g., on outside click or Escape key). We make it do nothing.
    const handleDialogInternalClose = () => {
        // Intentionally do nothing here to prevent dismissal on outside click or Esc.
        // The actual closing is explicitly handled by the XMarkIcon's onClick.
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            {/* 
                The `onClose` prop of the Headless UI Dialog is the key.
                We pass `handleDialogInternalClose` (which does nothing) to it.
                This prevents the Dialog from closing when the user clicks outside
                or presses the Escape key.
            */}
            <Dialog as="div" className="relative z-10" onClose={handleDialogInternalClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all`}>
                                <div className="flex justify-between items-center mb-4">
                                    {title && (
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                    )}
                                    <button
                                        type="button"
                                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        onClick={onClose} // This `onClose` is the prop passed to our Modal component, for explicit closing.
                                    >
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                
                                {children}

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default Modal;