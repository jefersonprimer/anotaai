import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

type CategoryContextType = {
  categories: Category[];
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  loadCategories: () => Promise<void>;
};

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    try {
      const savedCategories = await AsyncStorage.getItem('categories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const saveCategories = async (newCategories: Category[]) => {
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(newCategories));
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
    }
  };

  const addCategory = async (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      createdAt: new Date()
    };
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    await saveCategories(newCategories);
  };

  const deleteCategory = async (id: string) => {
    const newCategories = categories.filter(cat => cat.id !== id);
    setCategories(newCategories);
    await saveCategories(newCategories);
  };

  const updateCategory = async (id: string, name: string) => {
    const newCategories = categories.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    );
    setCategories(newCategories);
    await saveCategories(newCategories);
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      addCategory,
      deleteCategory,
      updateCategory,
      loadCategories
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
