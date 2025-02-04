import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types/Note'; 

// Função para salvar as notas no AsyncStorage
export const saveNotes = async (notes: Note[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('notes', JSON.stringify(notes));
  } catch (error) {
    console.error('Erro ao salvar as notas:', error);
  }
};

// Função para carregar as notas do AsyncStorage
export const loadNotes = async (): Promise<Note[]> => {
  try {
    const notes = await AsyncStorage.getItem('notes');
    return notes != null ? JSON.parse(notes) : []; // Retorna um array vazio se não houver notas salvas
  } catch (error) {
    console.error('Erro ao carregar as notas:', error);
    return []; // Retorna um array vazio em caso de erro
  }
};
