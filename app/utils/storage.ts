// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para salvar as notas no AsyncStorage
export const saveNotes = async (notes: Array<any>) => {
  try {
    await AsyncStorage.setItem('notes', JSON.stringify(notes));
  } catch (error) {
    console.error('Erro ao salvar as notas:', error);
  }
};

// Função para carregar as notas do AsyncStorage
export const loadNotes = async (): Promise<Array<any>> => {
  try {
    const notes = await AsyncStorage.getItem('notes');
    return notes != null ? JSON.parse(notes) : []; // Retorna as notas ou um array vazio
  } catch (error) {
    console.error('Erro ao carregar as notas:', error);
    return [];
  }
};

// Função para excluir as notas
export const deleteNotes = async () => {
  try {
    await AsyncStorage.removeItem('notes');
  } catch (error) {
    console.error('Erro ao excluir as notas:', error);
  }
};
