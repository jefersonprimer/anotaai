import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import HeaderBack from '../components/HeaderBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

interface Note {
  id: string;
  title: string;
  content: string;
  deletedAt?: string;
}

const TrashScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);

  useEffect(() => {
    loadTrashedNotes();
  }, []);

  const loadTrashedNotes = async () => {
    try {
      const savedTrash = await AsyncStorage.getItem('trash');
      if (savedTrash) {
        setTrashedNotes(JSON.parse(savedTrash));
      }
    } catch (error) {
      console.error('Erro ao carregar notas da lixeira:', error);
    }
  };

  const restoreNote = async (note: Note) => {
    try {
      // Remover da lixeira
      const updatedTrash = trashedNotes.filter(n => n.id !== note.id);
      await AsyncStorage.setItem('trash', JSON.stringify(updatedTrash));

      // Adicionar de volta às notas
      const savedNotes = await AsyncStorage.getItem('notes');
      const notesArray = savedNotes ? JSON.parse(savedNotes) : [];
      const restoredNote = { ...note };
      delete restoredNote.deletedAt; // Remove a data de exclusão
      notesArray.push(restoredNote);
      await AsyncStorage.setItem('notes', JSON.stringify(notesArray));

      setTrashedNotes(updatedTrash);
      Alert.alert('Sucesso', 'Nota restaurada com sucesso!');
    } catch (error) {
      console.error('Erro ao restaurar nota:', error);
      Alert.alert('Erro', 'Não foi possível restaurar a nota');
    }
  };

  const deleteNotePermanently = async (noteId: string) => {
    try {
      const updatedTrash = trashedNotes.filter(note => note.id !== noteId);
      await AsyncStorage.setItem('trash', JSON.stringify(updatedTrash));
      setTrashedNotes(updatedTrash);
      Alert.alert('Sucesso', 'Nota excluída permanentemente!');
    } catch (error) {
      console.error('Erro ao excluir nota permanentemente:', error);
      Alert.alert('Erro', 'Não foi possível excluir a nota');
    }
  };

  const confirmPermanentDelete = (noteId: string) => {
    Alert.alert(
      'Excluir Permanentemente',
      'Esta ação não poderá ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteNotePermanently(noteId)
        }
      ]
    );
  };

  const emptyTrash = async () => {
    Alert.alert(
      'Esvaziar Lixeira',
      'Todas as notas serão excluídas permanentemente. Esta ação não poderá ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Esvaziar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('trash', JSON.stringify([]));
              setTrashedNotes([]);
              Alert.alert('Sucesso', 'Lixeira esvaziada com sucesso!');
            } catch (error) {
              console.error('Erro ao esvaziar lixeira:', error);
              Alert.alert('Erro', 'Não foi possível esvaziar a lixeira');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day} de ${month}`;
  };

  const renderNote = ({ item: note }) => {
    const deletedDate = note.deletedAt ? formatDate(note.deletedAt) : '';

    return (
      <View style={[styles.noteItem, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
        <View style={styles.noteContent}>
          <Text style={[styles.noteTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
            {note.title}
          </Text>
          <Text style={[styles.noteDate, { color: isDarkMode ? '#ccc' : '#666' }]}>
            Excluído em {deletedDate}
          </Text>
        </View>
        <View style={styles.noteActions}>
          <TouchableOpacity onPress={() => restoreNote(note)} style={styles.actionButton}>
            <Feather name="refresh-ccw" size={20} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmPermanentDelete(note.id)} style={styles.actionButton}>
            <Feather name="trash-2" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={styles.header}>
        <HeaderBack title="Lixeira" />
        {trashedNotes.length > 0 && (
          <TouchableOpacity onPress={emptyTrash} style={styles.emptyButton}>
            <Text style={[styles.emptyButtonText, { color: '#ff4444' }]}>
              Esvaziar Lixeira
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {trashedNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDarkMode ? '#fff' : '#000' }]}>
            Lixeira vazia
          </Text>
        </View>
      ) : (
        <FlatList
          data={trashedNotes}
          renderItem={renderNote}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notesList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  emptyButton: {
    padding: 8,
  },
  emptyButtonText: {
    fontSize: 14,
  },
  notesList: {
    padding: 16,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default TrashScreen; 