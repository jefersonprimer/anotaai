import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IconColorContextData {
  iconColor: string;
  setIconColor: (color: string) => Promise<void>;
}

const IconColorContext = createContext<IconColorContextData>({} as IconColorContextData);

export const IconColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [iconColor, setIconColorState] = useState('#000000');

  const setIconColor = async (color: string) => {
    try {
      await AsyncStorage.setItem('iconColor', color);
      setIconColorState(color);
    } catch (error) {
      console.error('Erro ao salvar cor dos ícones:', error);
    }
  };

  // Carregar cor salva quando o app iniciar
  React.useEffect(() => {
    const loadSavedColor = async () => {
      try {
        const savedColor = await AsyncStorage.getItem('iconColor');
        if (savedColor) {
          setIconColorState(savedColor);
        }
      } catch (error) {
        console.error('Erro ao carregar cor dos ícones:', error);
      }
    };
    loadSavedColor();
  }, []);

  return (
    <IconColorContext.Provider value={{ iconColor, setIconColor }}>
      {children}
    </IconColorContext.Provider>
  );
};

export const useIconColor = () => useContext(IconColorContext); 