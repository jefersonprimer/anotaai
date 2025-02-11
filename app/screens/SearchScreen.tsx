import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Note } from './MainScreen';
import { loadNotes } from '../utils/storage';
import HeaderBack from '../components/HeaderBack';
import { useCategories } from '../context/CategoryContext';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoteCard from '../components/NoteCard';

interface SearchScreenProps {
  navigation: any;
  route: any;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState<Array<Note | Checklist>>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [allChecklists, setAllChecklists] = useState<Checklist[]>([]);
  const { categories } = useCategories();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [savedNotes, savedChecklists] = await Promise.all([
          AsyncStorage.getItem('notes'),
          AsyncStorage.getItem('checklists')
        ]);

        if (savedNotes) {
          setAllNotes(JSON.parse(savedNotes));
        }
        if (savedChecklists) {
          setAllChecklists(JSON.parse(savedChecklists));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setAllNotes([]);
        setAllChecklists([]);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const searchLower = search.toLowerCase();
    
    const filteredNotes = allNotes.filter(note => {
      const titleMatch = note.title ? note.title.toLowerCase().includes(searchLower) : false;
      const contentMatch = note.content ? note.content.toLowerCase().includes(searchLower) : false;
      return titleMatch || contentMatch;
    });

    const filteredChecklists = allChecklists.filter(checklist => {
      const titleMatch = checklist.title ? checklist.title.toLowerCase().includes(searchLower) : false;
      const itemsMatch = checklist.items.some(item => 
        item.text.toLowerCase().includes(searchLower)
      );
      return titleMatch || itemsMatch;
    });

    setFilteredItems([...filteredNotes, ...filteredChecklists]);
  }, [search, allNotes, allChecklists]);

  const renderItem = ({ item }) => {
    const isChecklist = 'items' in item;
    
    return (
      <NoteCard
        note={{
          id: item.id,
          title: item.title,
          content: isChecklist 
            ? `${item.items.length} itens • ${item.items.filter(i => i.isChecked).length} concluídos`
            : item.content,
          starred: item.starred || false,
          categoryId: item.categoryId,
          createdAt: item.createdAt
        }}
        onPress={() => {
          if (isChecklist) {
            navigation.navigate('Checklist', { checklist: item });
          } else {
            navigation.navigate('NoteDetails', { note: item });
          }
        }}
        onFavoriteToggle={() => {}} // Desativado na pesquisa
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <HeaderBack title="Procurar" />

      <TextInput
        style={[styles.searchInput, { 
          backgroundColor: isDarkMode ? '#333' : '#f8f8f8',
          color: isDarkMode ? '#fff' : '#000'
        }]}
        placeholder="Pesquisar notas e listas..."
        placeholderTextColor={isDarkMode ? '#666' : '#999'}
        value={search}
        onChangeText={setSearch}
        autoFocus
      />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          search.trim() !== '' ? (
            <Text style={[styles.emptyText, { 
              color: isDarkMode ? '#fff' : '#666'
            }]}>
              Nenhum resultado encontrado
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 50,
    borderWidth: 0,
    outlineStyle: 'none',
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderRadius: 8,
  },
  noteCard: {
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
  noteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontStyle: 'italic',
  }
});

export default SearchScreen;