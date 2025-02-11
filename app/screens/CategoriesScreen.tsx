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
import { Feather } from '@expo/vector-icons';
import { useIconColor } from '../context/IconColorContext';

interface Note {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
}

const CategoriesScreen = ({ route, navigation }) => {
  const { categories, addCategory, deleteCategory, updateCategory, loadCategories } = useCategories();
  const { isDarkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const note = route.params?.note; // Pega a nota se foi passada como parâmetro
  const isSelectingForNote = !!note; // Verifica se estamos selecionando para uma nota
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
  const { iconColor } = useIconColor();

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

  // Adicione esta função para atualizar a nota
  const updateNote = async (updatedNote: Note) => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes) {
        const notesArray = JSON.parse(savedNotes);
        const updatedNotes = notesArray.map((n: Note) => 
          n.id === updatedNote.id ? updatedNote : n
        );
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
        setNotes(updatedNotes);
        Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      throw new Error('Não foi possível atualizar a categoria da nota');
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

  const handleCategorySelect = async (categoryId: string | null) => {
    if (isSelectingForNote && note) {
      try {
        await updateNote({
          ...note,
          categoryId: categoryId === 'uncategorized' ? null : categoryId
        });
        navigation.goBack();
      } catch (error) {
        console.error('Erro ao atualizar categoria da nota:', error);
        Alert.alert('Erro', 'Não foi possível atualizar a categoria da nota');
      }
    } else {
      setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    }
  };

  const handleEditCategory = async () => {
    if (editCategoryName.trim() && editingCategory) {
      try {
        await updateCategory(editingCategory, editCategoryName.trim());
        setEditModalVisible(false);
        setEditingCategory(null);
        setEditCategoryName('');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar a categoria');
      }
    }
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (
      (direction === 'up' && categoryIndex > 0) ||
      (direction === 'down' && categoryIndex < categories.length - 1)
    ) {
      const newCategories = [...categories];
      const swapIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;
      [newCategories[categoryIndex], newCategories[swapIndex]] = 
      [newCategories[swapIndex], newCategories[categoryIndex]];
      
      try {
        await AsyncStorage.setItem('categories', JSON.stringify(newCategories));
        await loadCategories();
      } catch (error) {
        console.error('Erro ao mover categoria:', error);
        Alert.alert('Erro', 'Não foi possível mover a categoria');
      }
    }
  };

  // Adicione esta função para contar o total de notas
  const getTotalNotes = () => {
    return notes.length;
  };

  const handleCategoryPress = (category) => {
    if (isSelectingForNote) {
      handleCategorySelect(category.id);
    } else {
      navigation.navigate('CategoryNotes', { 
        category: category.id === 'uncategorized' 
          ? { id: 'uncategorized', name: 'Sem categoria' }
          : category 
      });
    }
  };

  const renderCategory = ({ item: category, index }) => {
    const notesCount = getNotesCount(category.id);
    const isSelected = note?.categoryId === category.id;

    return (
      <View style={[
        styles.categoryItem,
        { backgroundColor: isDarkMode ? '#333' : '#fff' },
        isSelected && styles.selectedCategory
      ]}>
        <TouchableOpacity 
          style={styles.categoryContent}
          onPress={() => handleCategoryPress(category)}
        >
          <Text style={[styles.categoryName, { color: isDarkMode ? '#fff' : '#000' }]}>
            {category.name}
          </Text>
          <Text style={[styles.notesCount, { color: isDarkMode ? '#ccc' : '#666' }]}>
            {notesCount} {notesCount === 1 ? 'nota' : 'notas'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <View style={styles.editButtons}>
            <TouchableOpacity 
              onPress={() => {
                setEditingCategory(category.id);
                setEditCategoryName(category.name);
                setEditModalVisible(true);
              }}
              style={styles.editButton}
            >
              <Feather name="edit-2" size={18} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteCategory(category.id)}
              style={styles.editButton}
            >
              <Feather name="trash-2" size={18} color="#ff4444" />
            </TouchableOpacity>
            <View style={styles.moveButtons}>
              {index > 0 && (
                <TouchableOpacity 
                  onPress={() => handleMoveCategory(category.id, 'up')}
                  style={styles.editButton}
                >
                  <Feather name="chevron-up" size={18} color={iconColor} />
                </TouchableOpacity>
              )}
              {index < categories.length - 1 && (
                <TouchableOpacity 
                  onPress={() => handleMoveCategory(category.id, 'down')}
                  style={styles.editButton}
                >
                  <Feather name="chevron-down" size={18} color={iconColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderUncategorizedSection = () => {
    const uncategorizedNotes = notes.filter(note => !note.categoryId);
    const isSelected = !note?.categoryId;

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { backgroundColor: isDarkMode ? '#333' : '#fff' },
          isSelected && styles.selectedCategory
        ]}
        onPress={() => handleCategoryPress({ id: 'uncategorized', name: 'Sem categoria' })}
      >
        <View style={styles.categoryContent}>
          <Text style={[styles.categoryName, { color: isDarkMode ? '#fff' : '#000' }]}>
            Notas sem categoria
          </Text>
          <Text style={[styles.notesCount, { color: isDarkMode ? '#ccc' : '#666' }]}>
            {uncategorizedNotes.length} {uncategorizedNotes.length === 1 ? 'nota' : 'notas'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={styles.header}>
        <HeaderBack title={isSelectingForNote ? "Selecionar Categoria" : "Categorias"} />
        {!isSelectingForNote && (
          <TouchableOpacity 
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editToggle}
          >
            <Feather 
              name={isEditing ? "x" : "edit"} 
              size={24} 
              color={iconColor} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.categoriesList}>
          <View style={styles.categoryListContent}>
            <View style={styles.totalNotesContainer}>
              <Text style={[styles.totalNotesText, { color: isDarkMode ? '#fff' : '#000' }]}>
                Todas as notas: {getTotalNotes()}
              </Text>
            </View>
            
            {renderUncategorizedSection()}
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.categoryListInner}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: isDarkMode ? '#444' : '#e0e0e0' }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.addButtonText, { color: iconColor }]}>
          +
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: iconColor }]}>
              Nova Categoria
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDarkMode ? '#444' : '#f5f5f5',
                color: iconColor
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

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: iconColor }]}>
              Editar Categoria
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDarkMode ? '#444' : '#f5f5f5',
                color: iconColor
              }]}
              value={editCategoryName}
              onChangeText={setEditCategoryName}
              placeholder="Nome da categoria"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleEditCategory}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedCategory: {
    borderWidth: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesCount: {
    fontSize: 14,
    marginLeft: 'auto',
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
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryListInner: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  editToggle: {
    padding: 8,
  },
  categoryContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  editButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  moveButtons: {
    flexDirection: 'row',
  },
  totalNotesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  totalNotesText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CategoriesScreen; 