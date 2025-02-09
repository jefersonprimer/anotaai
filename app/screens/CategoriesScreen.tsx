import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import { useCategories } from '../context/CategoryContext';
import { useTheme } from '../context/ThemeContext';
import HeaderBack from '../components/HeaderBack';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
}

const CategoriesScreen = ({ route, navigation }) => {
  const { categories, addCategory, deleteCategory } = useCategories();
  const { isDarkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Carregar notas
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  // Contar notas por categoria
  const getNotesCount = (categoryId: string) => {
    return notes.filter(note => note.categoryId === categoryId).length;
  };

  // Atualizar categoria da nota
  const updateNoteCategory = async (noteId: string, categoryId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, categoryId } : note
    );
    setNotes(updatedNotes);
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      Alert.alert('Sucesso', 'Nota atualizada com sucesso!');
      loadNotes(); // Recarregar notas
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setModalVisible(false);
    } else {
      Alert.alert('Erro', 'O nome da categoria não pode estar vazio');
    }
  };

  const handleDeleteCategory = (id: string) => {
    Alert.alert(
      'Confirmação',
      'Deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => deleteCategory(id),
          style: 'destructive'
        }
      ]
    );
  };

  const renderCategory = ({ item: category }) => {
    const notesCount = getNotesCount(category.id);
    const isSelected = selectedCategory === category.id;

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { backgroundColor: isDarkMode ? '#333' : '#fff' },
          isSelected && styles.selectedCategory
        ]}
        onPress={() => setSelectedCategory(isSelected ? null : category.id)}
      >
        <Text style={[styles.categoryName, { color: isDarkMode ? '#fff' : '#000' }]}>
          {category.name}
        </Text>
        <Text style={[styles.notesCount, { color: isDarkMode ? '#ccc' : '#666' }]}>
          {notesCount} {notesCount === 1 ? 'nota' : 'notas'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderNote = ({ item: note }) => {
    if (!selectedCategory) return null;

    return (
      <TouchableOpacity
        style={[
          styles.noteItem,
          { backgroundColor: isDarkMode ? '#444' : '#f5f5f5' }
        ]}
        onPress={() => updateNoteCategory(note.id, selectedCategory)}
      >
        <Text style={[styles.noteTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          {note.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <HeaderBack title="Categorias" />
      
      <View style={styles.content}>
        <View style={styles.categoriesList}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.categoryListContent}
          />
        </View>

        {selectedCategory && (
          <View style={styles.notesList}>
            <Text style={[styles.notesTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
              Notas Disponíveis
            </Text>
            <FlatList
              data={notes.filter(note => !note.categoryId)}
              renderItem={renderNote}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.notesListContent}
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: isDarkMode ? '#444' : '#ddd' }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.addButtonText, { color: isDarkMode ? '#fff' : '#000' }]}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
              Nova Categoria
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDarkMode ? '#444' : '#f5f5f5',
                color: isDarkMode ? '#fff' : '#000'
              }]}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Nome da categoria"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  categoriesList: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  categoryListContent: {
    padding: 16,
  },
  categoryItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesCount: {
    fontSize: 14,
  },
  notesList: {
    flex: 1,
    padding: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  notesListContent: {
    flexGrow: 1,
  },
  noteItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  noteTitle: {
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 10,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
  },
});

export default CategoriesScreen; 