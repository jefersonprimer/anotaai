import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import HeaderBack from '../components/HeaderBack';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
}

const CategoryNotesScreen = ({ route, navigation }) => {
  const { isDarkMode } = useTheme();
  const { category } = route.params;
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes) {
        const allNotes = JSON.parse(savedNotes);
        const categoryNotes = category.id === 'uncategorized' 
          ? allNotes.filter((note: Note) => !note.categoryId)
          : allNotes.filter((note: Note) => note.categoryId === category.id);
        setNotes(categoryNotes);
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const renderNote = ({ item: note }) => {
    return (
      <TouchableOpacity
        style={[
          styles.noteItem,
          { backgroundColor: isDarkMode ? '#333' : '#fff' }
        ]}
        onPress={() => navigation.navigate('NoteDetails', { note })}
      >
        <Text style={[styles.noteTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          {note.title}
        </Text>
        {/* <Text 
          style={[styles.notePreview, { color: isDarkMode ? '#ccc' : '#666' }]}
          numberOfLines={2}
        >
          {note.content}
        </Text> */}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <HeaderBack title={category.id === 'uncategorized' ? 'Notas sem categoria' : category.name} />
      
      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDarkMode ? '#fff' : '#000' }]}>
            Nenhuma nota nesta categoria
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
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
  notesList: {
    padding: 16,
  },
  noteItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 14,
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

export default CategoryNotesScreen; 