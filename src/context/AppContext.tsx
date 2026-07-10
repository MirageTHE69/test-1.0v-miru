'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ClientType {
  id: string;
  name: string;
  status: string;
  healthScore: number;
  email: string;
  phone: string;
  createdAt: string;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  botName?: string | null;
}

interface AppContextType {
  activeClient: ClientType | null;
  setActiveClient: (client: ClientType) => void;
  activeUser: UserType | null;
  setActiveUser: (user: UserType) => void;
  isAiPanelOpen: boolean;
  setIsAiPanelOpen: (isOpen: boolean) => void;
  clients: ClientType[];
  users: UserType[];
  isLoading: boolean;
  reloadContext: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeClient, setActiveClientState] = useState<ClientType | null>(null);
  const [activeUser, setActiveUser] = useState<UserType | null>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      const res = await fetch('/api/context-data');
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
        setUsers(data.users || []);
        
        // Default active user
        if (data.users && data.users.length > 0) {
          const defaultUser = data.users.find((u: UserType) => u.role === 'OWNER') || data.users[0];
          setActiveUser(defaultUser);
        }
        
        // Default active client
        if (data.clients && data.clients.length > 0) {
          // Attempt to keep previous selection, or find Bloom Café, or default to first
          const savedClientId = localStorage.getItem('activeClientId');
          const savedClient = data.clients.find((c: ClientType) => c.id === savedClientId);
          if (savedClient) {
            setActiveClientState(savedClient);
          } else {
            const bloom = data.clients.find((c: ClientType) => c.name.includes('Bloom'));
            const defaultClient = bloom || data.clients[0];
            setActiveClientState(defaultClient);
            localStorage.setItem('activeClientId', defaultClient.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load app context data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const setActiveClient = (client: ClientType) => {
    setActiveClientState(client);
    localStorage.setItem('activeClientId', client.id);
  };

  const reloadContext = async () => {
    await fetchInitialData();
  };

  return (
    <AppContext.Provider
      value={{
        activeClient,
        setActiveClient,
        activeUser,
        setActiveUser,
        isAiPanelOpen,
        setIsAiPanelOpen,
        clients,
        users,
        isLoading,
        reloadContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
