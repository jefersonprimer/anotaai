import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, TouchableOpacity, Text, StyleSheet, Modal, TextInput } from 'react-native';
import { saveNotes, loadNotes } from '../utils/storage';
import NoteCard from '../components/NoteCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { IconButton } from 'react-native-paper'; // Usando IconButton da react-native-paper
import { SvgXml } from 'react-native-svg';  // Importando o SvgXml
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoriteContext';
import { useCategories } from '../context/CategoryContext';
import ColorPalette from '../components/ColorPalette';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIconColor } from '../context/IconColorContext';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

// Definindo o tipo de uma Nota
export interface Note {
  id: string;
  title: string;
  content: string;
  starred: boolean;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  categoryId?: string;
  createdAt: string;
  starred?: boolean;
}

// Tipando a navegação
type MainScreenNavigationProp = StackNavigationProp<any, 'CreateNote'>;

interface MainScreenProps {
  navigation: MainScreenNavigationProp;
}

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const [notes, setNotes] = useState<Note[]>([]); // Tipagem do estado de notas
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [search, setSearch] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites(); // Novo hook
  const { categories, loadCategories } = useCategories(); // Adicione loadCategories aqui
  const [isGridLayout, setIsGridLayout] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [palettePosition, setPalettePosition] = useState({ top: 0, right: 0 });
  const { setIconColor, iconColor } = useIconColor();
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedData();
  }, []);

  // Adicione este useEffect para monitorar mudanças nas categorias
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedData();
      loadCategories(); // Recarrega as categorias
    });

    return unsubscribe;
  }, [navigation]);

  const loadSavedData = async () => {
    try {
      const [savedNotes, savedChecklists] = await Promise.all([
        AsyncStorage.getItem('notes'),
        AsyncStorage.getItem('checklists')
      ]);

      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      }
      if (savedChecklists) {
        const parsedChecklists = JSON.parse(savedChecklists);
        setChecklists(parsedChecklists);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const getIconColor = () => {
    return isDarkMode ? '#ffffff' : '#000000';
  };

  const handleColorSelect = async (color: string) => {
    await setIconColor(color);
    setShowColorPalette(false);
  };

  const handleOpenColorPalette = (event: any) => {
    // Pegar a posição do botão para posicionar a paleta
    const { pageY } = event.nativeEvent;
    setPalettePosition({ 
      top: pageY - 280, // 10px abaixo do botão
      right: 20 
    });
    setShowColorPalette(true);
  };

  const toggleStar = (id: string) => {
    // Atualiza o estado global de favoritos
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
    
    // Atualiza a nota local
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, starred: !note.starred } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const toggleStarChecklist = async (checklistId: string) => {
    try {
      const updatedChecklists = checklists.map(checklist => {
        if (checklist.id === checklistId) {
          return { ...checklist, starred: !checklist.starred };
        }
        return checklist;
      });
      await AsyncStorage.setItem('checklists', JSON.stringify(updatedChecklists));
      setChecklists(updatedChecklists);
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  const updateNote = (id: string, newTitle: string, newContent: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, title: newTitle, content: newContent } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleDeleteNote = async () => {
    if (selectedNoteId) {
      try {
        // Pegar a nota que será movida para a lixeira
        const noteToTrash = notes.find(note => note.id === selectedNoteId);
        
        if (noteToTrash) {
          // Carregar notas da lixeira
          const trashStr = await AsyncStorage.getItem('trash');
          const trashNotes = trashStr ? JSON.parse(trashStr) : [];
          
          // Adicionar a nota à lixeira com timestamp
          const noteWithDeletedAt = {
            ...noteToTrash,
            deletedAt: new Date().toISOString()
          };
          
          // Salvar na lixeira
          await AsyncStorage.setItem('trash', JSON.stringify([...trashNotes, noteWithDeletedAt]));
          
          // Remover da lista principal
          const filteredNotes = notes.filter(note => note.id !== selectedNoteId);
          setNotes(filteredNotes);
          await AsyncStorage.setItem('notes', JSON.stringify(filteredNotes));
        }

        setShowDeleteIcon(false);
        setSelectedNoteId(null);
      } catch (error) {
        console.error('Erro ao mover nota para a lixeira:', error);
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  // Atualize a função que filtra as notas favoritas
  const favoriteItems = [...notes, ...checklists].filter(item => item.starred);

  // Adicione esta função para alternar o layout
  const toggleLayout = () => {
    setIsGridLayout(!isGridLayout);
  };

  const handleLongPress = (noteId: string) => {
    setShowDeleteIcon(true);
    setSelectedNoteId(noteId);
  };

  // Atualize as definições dos SVGs para incluir fill="currentColor"
  const searchSvg = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
    <path fill="currentColor" d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
  </svg>`;

  const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
    <path fill="currentColor" fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"></path>
  </svg>`;

  const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>`;

  const shapesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M4 4h4v4H4V4z"/>
    <path fill="currentColor" d="M14 4l4 4l-4 4V4z"/>
    <path fill="currentColor" d="M4 14h4v4H4v-4z"/>
    <circle fill="currentColor" cx="16" cy="16" r="2"/>
  </svg>`;

  const halfCircleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      fill="${isDarkMode ? '#333333' : '#f5f5f5'}"
      stroke="${isDarkMode ? '#ffffff' : '#000000'}"
      stroke-width="1"
    />
    <path 
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z" 
      fill="${iconColor}"
    />
  </svg>`;

  const renderCreateOptionsModal = () => (
    <Modal
      transparent
      visible={showCreateOptions}
      onRequestClose={() => setShowCreateOptions(false)}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowCreateOptions(false)}
      >
        <View style={[
          styles.modalContent,
          { backgroundColor: isDarkMode ? '#333' : '#fff' }
        ]}>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => {
              setShowCreateOptions(false);
              navigation.navigate('CreateNote', { onNoteCreated: loadSavedData });
            }}
          >
            <Feather name="file-text" size={24} color={iconColor} />
            <Text style={[
              styles.modalOptionText,
              { color: isDarkMode ? '#fff' : '#000' }
            ]}>
              Criar Nota
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => {
              setShowCreateOptions(false);
              navigation.navigate('Checklist');
            }}
          >
            <Feather name="check-square" size={24} color={iconColor} />
            <Text style={[
              styles.modalOptionText,
              { color: isDarkMode ? '#fff' : '#000' }
            ]}>
              Criar Lista
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderItem = ({ item }: { item: Note | Checklist }) => {
    const isChecklist = 'items' in item;
    const category = categories.find(cat => cat.id === item.categoryId);
    
    return (
      <NoteCard
        note={{
          id: item.id,
          title: item.title,
          content: isChecklist 
            ? `${(item as Checklist).items.length} itens • ${(item as Checklist).items.filter(i => i.isChecked).length} concluídos`
            : (item as Note).content,
          starred: item.starred || false,
          createdAt: item.createdAt,
          categoryId: item.categoryId
        }}
        onPress={() => {
          if (isChecklist) {
            navigation.navigate('Checklist', { checklist: item });
          } else {
            navigation.navigate('NoteDetails', { 
              note: item,
              onNoteUpdated: loadSavedData,
              onNoteDeleted: loadSavedData
            });
          }
        }}
        onFavoriteToggle={() => {
          if (isChecklist) {
            toggleStarChecklist(item.id);
          } else {
            toggleStar(item.id);
          }
        }}
        onLongPress={() => handleLongPress(item.id)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }]}>
        {/* Botão de alternar layout */}
        <TouchableOpacity onPress={toggleLayout} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: isDarkMode ? '#fff' : '#000' }]}>
            {isGridLayout ? '☰' : '⊞'}
          </Text>
        </TouchableOpacity>

        {/* Título */}
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          {showDeleteIcon ? 'Excluir nota' : 'Anotaai'}
        </Text>

        {/* Botão de configurações ou lixeira */}
        {showDeleteIcon ? (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleDeleteNote}
          >
            <MaterialIcons 
              name="delete" 
              size={24} 
              color={isDarkMode ? '#fff' : '#000'} 
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => setShowDropdown(true)} 
            style={styles.headerButton}
          >
            <Text style={[styles.headerButtonText, { color: isDarkMode ? '#fff' : '#000' }]}>
              ⠂⠂
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal */}
      <Modal
        transparent={true}
        visible={showDropdown}
        onRequestClose={() => setShowDropdown(false)}
        animationType="slide"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={[
            styles.dropdownMenu,
            { 
              backgroundColor: isDarkMode ? '#333' : '#fff',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
             
            }
          ]}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                toggleTheme();
                setShowDropdown(false);
              }}
            >
              <Text style={[styles.dropdownText, { color: isDarkMode ? '#fff' : '#000' }]}>
                {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate('Trash');
                setShowDropdown(false);
              }}
            >
              <Text style={[styles.dropdownText, { color: isDarkMode ? '#fff' : '#000' }]}>
                🗑️ Lixeira
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ColorPalette
        visible={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        onSelectColor={handleColorSelect}
        position={palettePosition}
      />

      <FlatList
        data={[...notes, ...checklists].sort((a, b) => {
          if (a.starred && !b.starred) return -1;
          if (!a.starred && b.starred) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={isGridLayout ? 2 : 1}
        key={isGridLayout ? 'grid' : 'list'}
      />

      {/* Botão de tema */}
      <TouchableOpacity 
        onPress={toggleTheme}
        style={{
          position: 'absolute',
          bottom: 80, // Posiciona acima da barra inferior
          right: 20,  // Alinha à direita
          padding: 10,
          backgroundColor: isDarkMode ? '#333' : '#eee',
          borderRadius: 25,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
          {isDarkMode ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>

      {/* Barra inferior com os botões */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        
        {/* Ícone de shapes */}
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <SvgXml xml={shapesSvg} width={30} height={30} color={getIconColor()} />
        </TouchableOpacity>

        {/* Botão "Search" com o ícone SVG */}
        <TouchableOpacity onPress={() => navigation.navigate('Search', { notes, search, setSearch })}>
         <SvgXml xml={searchSvg} width={30} height={30} color={getIconColor()} />
        </TouchableOpacity>

        {/* Botão plus atualizado */}
        <TouchableOpacity 
          onPress={() => setShowCreateOptions(true)}
          style={[
            styles.plusButton,
            { backgroundColor: iconColor }
          ]}
        >
          <SvgXml 
            xml={plusSvg} 
            width={24} 
            height={24} 
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Ícone de estrela */}
        <TouchableOpacity onPress={() => navigation.navigate('Favorites', { notes: favoriteItems })}>
          <SvgXml xml={starSvg} width={30} height={30} color={getIconColor()} />
        </TouchableOpacity>

        {/* Ícone de meio círculo */}
        <TouchableOpacity onPress={(event) => handleOpenColorPalette(event)}>
          <SvgXml xml={halfCircleSvg} width={30} height={30} color={iconColor} />
        </TouchableOpacity>
      </View>
      
      {renderCreateOptionsModal()}
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
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  dropdownMenu: {
    padding: 16,
   
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // sombra para Android
    shadowColor: '#000', // sombra para iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 12,
    marginTop: 4,
  },
  checklistPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemCount: {
    fontSize: 12,
  },
  completedCount: {
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default MainScreen;