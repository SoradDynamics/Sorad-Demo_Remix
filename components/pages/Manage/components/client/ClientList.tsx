// src/components/client/ClientList.tsx
import React from 'react';
import { ClientMetadata } from '../../types';
import ClientCard from './ClientCard';

interface ClientListProps {
    clients: ClientMetadata[];
    onClientSelect: (client: ClientMetadata) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onClientSelect }) => {
    if (clients.length === 0) {
        return <p className="text-center text-slate-500 py-8">No clients found matching your criteria.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients.map(client => (
                <ClientCard key={client.$id} client={client} onClick={() => onClientSelect(client)} />
            ))}
        </div>
    );
};

export default ClientList;