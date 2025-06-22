// src/components/client/ClientNotes.tsx
import React, { useState } from 'react';
import { ClientMetadata, ClientApiError, CurrentUser } from '../../types';
import { addClientNoteApi } from '../../services/clientApiService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { PencilSquareIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

interface ClientNotesProps {
    client: ClientMetadata;
    onNoteAdded: (updatedClient: ClientMetadata) => void;
    currentUser: CurrentUser;
}

const ClientNotes: React.FC<ClientNotesProps> = ({ client, onNoteAdded, currentUser }) => {
    const [newNote, setNewNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canAddNote = currentUser.labels.includes('pro') || client.by === currentUser.$id;

    const handleAddNote = async () => {
        if (!newNote.trim() || !canAddNote) return;
        setIsLoading(true);
        setError(null);
        try {
            const updatedClient = await addClientNoteApi(client.$id, newNote);
            onNoteAdded(updatedClient);
            setNewNote('');
        } catch (e: any) {
            const apiError = e as ClientApiError;
            setError(apiError.message || "Failed to add note.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6 mr-2 text-blue-500" />
                Client Notes
            </h4>
            {client.client_notes && client.client_notes.length > 0 ? (
                <ul className="space-y-3">
                    {client.client_notes.slice().reverse().map((note, index) => ( // Show newest first
                        <li key={index} className="p-3 bg-slate-50 rounded-md border border-slate-200 text-sm text-slate-600">
                           {note.includes(':') ? (
                             <>
                               <strong className="text-slate-700 block mb-0.5">{new Date(note.substring(0, note.indexOf(':'))).toLocaleString()}:</strong>
                               {note.substring(note.indexOf(':') + 1).trim()}
                             </>
                           ) : note }
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-500">No notes added yet.</p>
            )}

            {canAddNote && (
                <div className="mt-4">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a new note..."
                        rows={3}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm"
                        disabled={isLoading}
                    />
                    <button 
                        type="button"
                        onClick={handleAddNote} 
                        disabled={isLoading || !newNote.trim()}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Adding...</span>
                            </>
                        ) : (
                           <> <PencilSquareIcon className="h-5 w-5 mr-2" /> Add Note </>
                        )}
                    </button>
                    {error && <ErrorMessage message={error} />}
                </div>
            )}
        </div>
    );
};

export default ClientNotes;