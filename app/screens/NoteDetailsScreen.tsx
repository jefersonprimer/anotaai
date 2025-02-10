import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoriteContext';
import { useCategories } from '../context/CategoryContext';

// Definir os tipos de dados para o parâmetro da rota
interface Note {
  id: string;
  title: string;
  content: string;
  starred: boolean;
  createdAt: Date;
}

interface NoteDetailsRouteParams {
  note: Note;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  onNoteDeleted: () => void;
}

interface NoteDetailsScreenProps {
  navigation: StackNavigationProp<any>; // Tipagem para a navegação
  route: RouteProp<{ params: NoteDetailsRouteParams }, 'params'>; // Tipagem para a rota
}

const NoteDetailsScreen: React.FC<NoteDetailsScreenProps> = ({ route, navigation }) => {
  const { note, updateNote, deleteNote, onNoteDeleted } = route.params;
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showDeleteOption, setShowDeleteOption] = useState(false);
  const { isDarkMode } = useTheme();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { categories } = useCategories();

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
    updateNote(note.id, title.trim(), content.trim());
    navigation.goBack();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta nota permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => {
            console.log('Deletando nota com id:', note.id); // Log para depuração
            deleteNote(note.id); // Chama a função de exclusão corretamente
            onNoteDeleted(); // Função para atualizar a lista de notas na tela principal
            navigation.goBack(); // Vai de volta para a tela anterior após a exclusão
          }
        }
      ]
    );
  };

  const toggleStar = async () => {
    try {
      if (isFavorite(note.id)) {
        await removeFavorite(note.id);
      } else {
        await addFavorite(note.id);
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
          <View>
            {'‹'}
          </View>
        </TouchableOpacity>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity 
            onPress={toggleStar}
            style={styles.headerButton}
          >
             <View>
              {isFavorite(note.id) ? '⭐' : '☆'}
             </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setShowDeleteOption(!showDeleteOption)}
            style={styles.headerButton}
          >
             <View>
             ⋮
              </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Barra de categoria e data */}
      <View style={[styles.categoryDateBar, { 
        backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
        borderBottomColor: isDarkMode ? '#333' : '#e0e0e0' 
      }]}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Categories')}
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
           <View>
            🗑️ Excluir Nota
           </View>
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