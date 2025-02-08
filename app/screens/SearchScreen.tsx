import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import { Note } from './MainScreen';
import { loadNotes } from '../utils/storage';

interface SearchScreenProps {
  navigation: any;
  route: any;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notes = await loadNotes();
        setAllNotes(notes || []);
      } catch (error) {
        console.error('Erro ao carregar notas:', error);
        setAllNotes([]);
      }
    };
    
    fetchNotes();
  }, []);

  // Modificado para mostrar notas apenas quando houver texto de busca
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredNotes([]);
      return;
    }

    const filtered = allNotes.filter(note => {
      const searchLower = search.toLowerCase();
      const titleMatch = note.title ? note.title.toLowerCase().includes(searchLower) : false;
      const contentMatch = note.content ? note.content.toLowerCase().includes(searchLower) : false;
      return titleMatch || contentMatch;
    });
    setFilteredNotes(filtered);
  }, [search, allNotes]);

  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetails', { noteId: note.id });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar notas..."
        value={search}
        onChangeText={setSearch}
        autoFocus
      />

      <FlatList
        data={filteredNotes}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <Text 
              style={styles.noteTitle}
              onPress={() => handleNotePress(item)}
            >
              {item.title || 'Sem título'}
            </Text>
            <Text 
              numberOfLines={2} 
              style={styles.noteContent}
              onPress={() => handleNotePress(item)}
            >
              {item.content || 'Sem conteúdo'}
            </Text>
          </View>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          search.trim() !== '' ? (
            <Text style={styles.emptyText}>
              Nenhuma nota encontrada
            </Text>
          ) : null
        }
      />
    </View>
  );
};


// ... resto do código permanece igual ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  noteCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  }
});

export default SearchScreen;