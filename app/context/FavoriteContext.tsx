import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FavoritesContextType = {
  favorites: string[];
  addFavorite: (noteId: string) => void;
  removeFavorite: (noteId: string) => void;
  isFavorite: (noteId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    };

    loadFavorites();
  }, []);

  const addFavorite = async (noteId: string) => {
    try {
      const newFavorites = [...favorites, noteId];
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
    }
  };

  const removeFavorite = async (noteId: string) => {
    try {
      const newFavorites = favorites.filter(id => id !== noteId);
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  const isFavorite = (noteId: string) => {
    return favorites.includes(noteId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}