import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoriteContext';
import { useCategories } from '../context/CategoryContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIconColor } from '../context/IconColorContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';

// Definir os tipos de dados para o parâmetro da rota
interface Note {
  id: string;
  title: string;
  content: string;
  starred: boolean;
  createdAt: Date;
}

interface RouteParams {
  note: Note;
}

interface NoteDetailsScreenProps {
  navigation: StackNavigationProp<any>; // Tipagem para a navegação
  route: RouteProp<{ params: RouteParams }, 'params'>; // Tipagem para a rota
}

const NoteDetailsScreen: React.FC<NoteDetailsScreenProps> = ({ route, navigation }) => {
  const { note: initialNote } = route.params as RouteParams;
  const [note, setNote] = useState(initialNote);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showDeleteOption, setShowDeleteOption] = useState(false);
  const { isDarkMode } = useTheme();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { categories } = useCategories();
  const { iconColor } = useIconColor();

  // Adicione este useEffect para atualizar a nota quando retornar da tela de categorias
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const savedNotes = await AsyncStorage.getItem('notes');
        if (savedNotes) {
          const notesArray = JSON.parse(savedNotes);
          const updatedNote = notesArray.find((n: Note) => n.id === note.id);
          if (updatedNote) {
            setNote(updatedNote);
          }
        }
      } catch (error) {
        console.error('Erro ao atualizar nota:', error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const getCategoryName = () => {
    if (!note.categoryId) return 'Categorias';
    const category = categories.find(cat => cat.id === note.categoryId);
    return category?.name || 'Categorias';
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    // Assuming updateNote is called elsewhere in the component
    navigation.goBack();
  };

  const deleteNote = async (noteId: string) => {
    try {
      // Primeiro, vamos pegar a nota atual e todas as notas
      const savedNotes = await AsyncStorage.getItem('notes');
      const savedTrash = await AsyncStorage.getItem('trash');
      
      if (savedNotes) {
        const notesArray = JSON.parse(savedNotes);
        const noteToDelete = notesArray.find((n: Note) => n.id === noteId);
        
        // Remove a nota da lista principal
        const updatedNotes = notesArray.filter((n: Note) => n.id !== noteId);
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));

        // Adiciona a nota à lixeira
        const trashNotes = savedTrash ? JSON.parse(savedTrash) : [];
        const noteWithDeletedDate = {
          ...noteToDelete,
          deletedAt: new Date().toISOString()
        };
        trashNotes.push(noteWithDeletedDate);
        await AsyncStorage.setItem('trash', JSON.stringify(trashNotes));

        // Remove dos favoritos se estiver marcada
        if (isFavorite(noteId)) {
          await removeFavorite(noteId);
        }

        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      Alert.alert('Erro', 'Não foi possível excluir a nota');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja mover esta nota para a lixeira?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            deleteNote(note.id);
          }
        }
      ]
    );
  };

  const toggleStar = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes) {
        const notesArray = JSON.parse(savedNotes);
        const updatedNotes = notesArray.map((n: Note) => {
          if (n.id === note.id) {
            return { ...n, starred: !n.starred };
          }
          return n;
        });
        
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
        
        // Atualiza o estado local
        setNote({ ...note, starred: !note.starred });
        
        // Atualiza os favoritos
        if (!note.starred) {
          await addFavorite(note.id);
        } else {
          await removeFavorite(note.id);
        }

        // Notifica a MainScreen para atualizar
        if (route.params?.onNoteUpdated) {
          route.params.onNoteUpdated();
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o favorito');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Feather 
            name="arrow-left" 
            size={24} 
            color={iconColor}
          />
        </TouchableOpacity>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity 
            onPress={toggleStar}
            style={styles.headerButton}
          >
            <MaterialIcons 
              name={isFavorite(note.id) ? "star" : "star-outline"} 
              size={24} 
              color={iconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setShowDeleteOption(!showDeleteOption)}
            style={styles.headerButton}
          >
            <Feather 
              name="trash-2" 
              size={24} 
              color={iconColor}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Barra de categoria e data */}
      <View style={[styles.categoryDateBar, { 
        backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
        borderBottomColor: isDarkMode ? '#333' : '#e0e0e0' 
      }]}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Categories', { note: note })}
          style={styles.categoryButton}
        >
          <Text style={[styles.categoryText, { 
            color: isDarkMode ? '#fff' : '#000',
            fontStyle: note.categoryId ? 'italic' : 'normal'
          }]}>
            {getCategoryName()}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.dateText, { color: isDarkMode ? '#999' : '#666' }]}>
          {new Date(note.createdAt || Date.now()).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <TextInput
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
          style={[
            styles.titleInput,
            { 
              color: isDarkMode ? '#fff' : '#000',
              borderBottomColor: isDarkMode ? '#444' : '#ddd',
              borderWidth: 0, // Remove qualquer borda padrão
              outlineStyle: 'none'
            }
          ]}
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
        />

        <TextInput
          placeholder="Conteúdo"
          value={content}
          onChangeText={setContent}
          multiline
          style={[
            styles.contentInput,
            { 
              color: isDarkMode ? '#fff' : '#000',
              borderColor: isDarkMode ? '#444' : '#ddd',
              borderWidth: 0, // Remove qualquer borda padrão
              outlineStyle: 'none'
            }
          ]}
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
        />
      </View>

      {/* Botão de deletar */}
      {showDeleteOption && (
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}
          onPress={confirmDelete}
        >
          <Text style={[styles.deleteText, { color: isDarkMode ? '#fff' : '#000' }]}>
            🗑️ Excluir Nota
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  headerIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    fontSize: 24,
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 5,
  },
  contentInput: {
    fontSize: 18,
    flex: 1,
    textAlignVertical: 'top',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryDateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
  },
});

export default NoteDetailsScreen;