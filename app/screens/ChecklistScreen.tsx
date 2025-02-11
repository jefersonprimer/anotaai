import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useIconColor } from '../context/IconColorContext';
import HeaderBack from '../components/HeaderBack';
import { useCategories } from '../context/CategoryContext';
import { Checklist, ChecklistItem } from '../types/Checklist';

const ChecklistScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const { iconColor } = useIconColor();
  const { categories } = useCategories();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [checklistToRename, setChecklistToRename] = useState<Checklist | null>(null);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const savedChecklists = await AsyncStorage.getItem('checklists');
      if (savedChecklists) {
        setChecklists(JSON.parse(savedChecklists));
      }
    } catch (error) {
      console.error('Erro ao carregar checklists:', error);
    }
  };

  const saveChecklists = async (updatedChecklists: Checklist[]) => {
    try {
      await AsyncStorage.setItem('checklists', JSON.stringify(updatedChecklists));
      setChecklists(updatedChecklists);
    } catch (error) {
      console.error('Erro ao salvar checklists:', error);
    }
  };

  const createNewChecklist = () => {
    if (newListTitle.trim()) {
      const newChecklist: Checklist = {
        id: Date.now().toString(),
        title: newListTitle.trim(),
        items: [],
        createdAt: new Date().toISOString(),
      };
      saveChecklists([...checklists, newChecklist]);
      setNewListTitle('');
      setShowNewListModal(false);
    }
  };

  const addItemToChecklist = (checklistId: string) => {
    if (newItemText.trim()) {
      const updatedChecklists = checklists.map(checklist => {
        if (checklist.id === checklistId) {
          return {
            ...checklist,
            items: [
              ...checklist.items,
              {
                id: Date.now().toString(),
                text: newItemText.trim(),
                isChecked: false,
              }
            ]
          };
        }
        return checklist;
      });
      saveChecklists(updatedChecklists);
      setNewItemText('');
    }
  };

  const toggleItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item => {
            if (item.id === itemId) {
              return { ...item, isChecked: !item.isChecked };
            }
            return item;
          })
        };
      }
      return checklist;
    });
    saveChecklists(updatedChecklists);
  };

  const deleteChecklist = (checklistId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja excluir esta lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const updatedChecklists = checklists.filter(
              checklist => checklist.id !== checklistId
            );
            saveChecklists(updatedChecklists);
          }
        }
      ]
    );
  };

  const handleRename = () => {
    if (renameText.trim() && checklistToRename) {
      const updatedChecklists = checklists.map(c => {
        if (c.id === checklistToRename.id) {
          return { ...c, title: renameText.trim() };
        }
        return c;
      });
      saveChecklists(updatedChecklists);
      setShowRenameModal(false);
      setRenameText('');
      setChecklistToRename(null);
    }
  };

  const openRenameModal = (checklist: Checklist) => {
    setChecklistToRename(checklist);
    setRenameText(checklist.title);
    setShowRenameModal(true);
  };

  const renderChecklist = ({ item: checklist }: { item: Checklist }) => {
    const category = categories.find(cat => cat.id === checklist.categoryId);

    return (
      <View style={[styles.checklistCard, { 
        backgroundColor: isDarkMode ? '#333' : '#fff' 
      }]}>
        <View style={styles.checklistHeader}>
          <Text style={[styles.checklistTitle, { 
            color: isDarkMode ? '#fff' : '#000' 
          }]}>
            {checklist.title}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => openRenameModal(checklist)}>
              <Feather name="edit-2" size={20} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setEditingChecklist(checklist)}
              style={{ marginLeft: 16 }}
            >
              <Feather name="list" size={20} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteChecklist(checklist.id)}
              style={{ marginLeft: 16 }}
            >
              <Feather name="trash-2" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        {category && (
          <Text style={[styles.categoryText, { 
            color: isDarkMode ? '#ccc' : '#666' 
          }]}>
            {category.name}
          </Text>
        )}

        <FlatList
          data={checklist.items}
          renderItem={({ item: checkItem }) => (
            <TouchableOpacity
              style={styles.checkItem}
              onPress={() => toggleItem(checklist.id, checkItem.id)}
            >
              <View style={[styles.checkbox, {
                borderColor: iconColor,
                backgroundColor: checkItem.isChecked ? iconColor : 'transparent'
              }]}>
                {checkItem.isChecked && (
                  <Feather name="check" size={14} color="#fff" />
                )}
              </View>
              <Text style={[
                styles.itemText,
                { color: isDarkMode ? '#fff' : '#000' },
                checkItem.isChecked && styles.checkedText
              ]}>
                {checkItem.text}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />

        <View style={styles.addItemContainer}>
          <TextInput
            style={[styles.input, { 
              color: isDarkMode ? '#fff' : '#000',
              backgroundColor: isDarkMode ? '#444' : '#f5f5f5'
            }]}
            placeholder="Adicionar item..."
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={newItemText}
            onChangeText={setNewItemText}
            onSubmitEditing={() => addItemToChecklist(checklist.id)}
          />
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: iconColor }]}
            onPress={() => addItemToChecklist(checklist.id)}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNewListModal = () => (
    <Modal
      transparent
      visible={showNewListModal}
      onRequestClose={() => setShowNewListModal(false)}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowNewListModal(false)}
      >
        <View style={[
          styles.modalContent,
          { backgroundColor: isDarkMode ? '#333' : '#fff' }
        ]}>
          <Text style={[
            styles.modalTitle,
            { color: isDarkMode ? '#fff' : '#000' }
          ]}>
            Nova Lista
          </Text>
          
          <TextInput
            style={[
              styles.modalInput,
              { 
                color: isDarkMode ? '#fff' : '#000',
                backgroundColor: isDarkMode ? '#444' : '#f5f5f5'
              }
            ]}
            placeholder="Digite o título da lista..."
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={newListTitle}
            onChangeText={setNewListTitle}
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: iconColor }]}
              onPress={() => {
                setNewListTitle('');
                setShowNewListModal(false);
              }}
            >
              <Text style={[styles.modalButtonText, { color: iconColor }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: iconColor }]}
              onPress={createNewChecklist}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                Criar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderRenameModal = () => (
    <Modal
      transparent
      visible={showRenameModal}
      onRequestClose={() => setShowRenameModal(false)}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowRenameModal(false)}
      >
        <View style={[
          styles.modalContent,
          { backgroundColor: isDarkMode ? '#333' : '#fff' }
        ]}>
          <Text style={[
            styles.modalTitle,
            { color: isDarkMode ? '#fff' : '#000' }
          ]}>
            Renomear Lista
          </Text>
          
          <TextInput
            style={[
              styles.modalInput,
              { 
                color: isDarkMode ? '#fff' : '#000',
                backgroundColor: isDarkMode ? '#444' : '#f5f5f5'
              }
            ]}
            placeholder="Digite o novo título..."
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={renameText}
            onChangeText={setRenameText}
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: iconColor }]}
              onPress={() => {
                setShowRenameModal(false);
                setRenameText('');
                setChecklistToRename(null);
              }}
            >
              <Text style={[styles.modalButtonText, { color: iconColor }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: iconColor }]}
              onPress={handleRename}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                Renomear
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={[styles.container, { 
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' 
    }]}>
      <HeaderBack title="Listas de Verificação" />
      
      <FlatList
        data={checklists}
        renderItem={renderChecklist}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { 
            color: isDarkMode ? '#fff' : '#666' 
          }]}>
            Nenhuma lista criada
          </Text>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: iconColor }]}
        onPress={() => setShowNewListModal(true)}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {renderNewListModal()}
      {renderRenameModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  checklistCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  addItemContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChecklistScreen; 