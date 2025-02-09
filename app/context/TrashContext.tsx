import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrashNote {
  id: string;
  title: string;
  content: string;
  deletedAt: Date;
}

type TrashContextType = {
  trashedNotes: TrashNote[];
  moveToTrash: (note: { id: string; title: string; content: string }) => Promise<void>;
  restoreFromTrash: (noteId: string) => Promise<TrashNote | null>;
  deletePermantly: (noteId: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
};

const TrashContext = createContext<TrashContextType | undefined>(undefined);

export function TrashProvider({ children }: { children: React.ReactNode }) {
  const [trashedNotes, setTrashedNotes] = useState<TrashNote[]>([]);

  useEffect(() => {
    const loadTrashedNotes = async () => {
      try {
        const saved = await AsyncStorage.getItem('trashedNotes');
        if (saved) {
          const parsed = JSON.parse(saved);
          setTrashedNotes(parsed.map((note: any) => ({
            ...note,
            deletedAt: new Date(note.deletedAt)
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar notas da lixeira:', error);
      }
    };

    loadTrashedNotes();
  }, []);

  const saveTrashedNotes = async (notes: TrashNote[]) => {
    try {
      await AsyncStorage.setItem('trashedNotes', JSON.stringify(notes));
    } catch (error) {
      console.error('Erro ao salvar notas na lixeira:', error);
    }
  };

  const moveToTrash = async (note: { id: string; title: string; content: string }) => {
    const trashedNote: TrashNote = {
      ...note,
      deletedAt: new Date()
    };
    const newTrashedNotes = [...trashedNotes, trashedNote];
    setTrashedNotes(newTrashedNotes);
    await saveTrashedNotes(newTrashedNotes);
  };

  const restoreFromTrash = async (noteId: string) => {
    const noteToRestore = trashedNotes.find(note => note.id === noteId);
    if (noteToRestore) {
      const newTrashedNotes = trashedNotes.filter(note => note.id !== noteId);
      setTrashedNotes(newTrashedNotes);
      await saveTrashedNotes(newTrashedNotes);
      return noteToRestore;
    }
    return null;
  };

  const deletePermantly = async (noteId: string) => {
    const newTrashedNotes = trashedNotes.filter(note => note.id !== noteId);
    setTrashedNotes(newTrashedNotes);
    await saveTrashedNotes(newTrashedNotes);
  };

  const emptyTrash = async () => {
    setTrashedNotes([]);
    await saveTrashedNotes([]);
  };

  return (
    <TrashContext.Provider value={{
      trashedNotes,
      moveToTrash,
      restoreFromTrash,
      deletePermantly,
      emptyTrash
    }}>
      {children}
    </TrashContext.Provider>
  );
}

export function useTrash() {
  const context = useContext(TrashContext);
  if (context === undefined) {
    throw new Error('useTrash must be used within a TrashProvider');
  }
  return context;
}
