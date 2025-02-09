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

// Definindo o tipo de uma Nota
export interface Note {
  id: string;
  title: string;
  content: string;
  starred: boolean;
  createdAt: string;
}

// Tipando a navegação
type MainScreenNavigationProp = StackNavigationProp<any, 'CreateNote'>;

interface MainScreenProps {
  navigation: MainScreenNavigationProp;
}

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const [notes, setNotes] = useState<Note[]>([]); // Tipagem do estado de notas
  const [search, setSearch] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites(); // Novo hook
  const [isGridLayout, setIsGridLayout] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [iconColor, setIconColor] = useState('#000000');
  const [palettePosition, setPalettePosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    loadSavedNotes();
    loadIconColor();
  }, []);

  const loadSavedNotes = async () => {
    const savedNotes = await loadNotes();
    setNotes(savedNotes);
  };

  const loadIconColor = async () => {
    try {
      const savedColor = await AsyncStorage.getItem('iconColor');
      if (savedColor) {
        setIconColor(savedColor);
      }
    } catch (error) {
      console.error('Erro ao carregar cor dos ícones:', error);
    }
  };

  const handleColorSelect = async (color: string) => {
    setIconColor(color);
    try {
      await AsyncStorage.setItem('iconColor', color);
    } catch (error) {
      console.error('Erro ao salvar cor dos ícones:', error);
    }
  };

  const handleOpenColorPalette = (event: any) => {
    // Pegar a posição do botão para posicionar a paleta
    const { pageY } = event.nativeEvent;
    setPalettePosition({ 
      top: pageY + 10, // 10px abaixo do botão
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

  const updateNote = (id: string, newTitle: string, newContent: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, title: newTitle, content: newContent } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const filteredNotes = notes.filter(note => note.id !== id);
    setNotes(filteredNotes);
    saveNotes(filteredNotes);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  // Atualize a função que filtra as notas favoritas
  const favoriteNotes = notes.filter(note => isFavorite(note.id));

  // Adicione esta função para alternar o layout
  const toggleLayout = () => {
    setIsGridLayout(!isGridLayout);
  };

  // Definindo o código do SVG como string
  const searchSvg = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
    <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
  </svg>`;

  // Definindo o código do SVG como string
  const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"></path>
  </svg>`;

  // Adicione este SVG junto com os outros
  const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>`;

    // Adicione este SVG junto com os outros
    const shapesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M4 4h4v4H4V4z"/>
    <path d="M14 4l4 4l-4 4V4z"/>
    <path d="M4 14h4v4H4v-4z"/>
    <circle cx="16" cy="16" r="2"/>
  </svg>`;

    // Adicione este SVG junto com os outros
    const halfCircleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z"/>
  </svg>`;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
        {/* Botão de alternar layout */}
        <TouchableOpacity onPress={toggleLayout} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: isDarkMode ? '#fff' : '#000' }]}>
            {isGridLayout ? '📝' : '⊞'}
          </Text>
        </TouchableOpacity>

        {/* Título */}
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Anotaai
        </Text>

        {/* Botão de configurações */}
        <TouchableOpacity 
          onPress={() => setShowDropdown(true)} 
          style={styles.headerButton}
        >
          <Text style={[styles.headerButtonText, { color: isDarkMode ? '#fff' : '#000' }]}>
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
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
            { backgroundColor: isDarkMode ? '#333' : '#fff' }
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
                // Adicione aqui a lógica para a lixeira
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

      {/* FlatList existente */}
      <FlatList
        data={filteredNotes}
        renderItem={({ item }) => (
          <NoteCard
            note={{
              ...item,
              starred: isFavorite(item.id) // Use o estado global para determinar se é favorito
            }}
            onPress={() => navigation.navigate('NoteDetails', { 
              note: item,
              updateNote,
              deleteNote,
              onNoteDeleted: loadSavedNotes
            })}
            onFavoriteToggle={() => toggleStar(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        numColumns={isGridLayout ? 2 : 1}  // Altera o número de colunas baseado no layout
        key={isGridLayout ? 'grid' : 'list'} // Força re-render quando muda o layout
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
          <SvgXml xml={shapesSvg} width={30} height={30} color={iconColor} />
        </TouchableOpacity>

        
        {/* Botão "Search" com o ícone SVG */}
        <TouchableOpacity onPress={() => navigation.navigate('Search', { notes, search, setSearch })}>
         <SvgXml xml={searchSvg} width={30} height={30} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('CreateNote', { 
          onNoteCreated: loadSavedNotes 
        })}>
          <SvgXml xml={plusSvg} width={30} height={30} color={iconColor} />
        </TouchableOpacity>

        {/* Substituindo o botão Favoritos por um ícone de estrela */}
        <TouchableOpacity onPress={() => navigation.navigate('Favorites', { notes: favoriteNotes })}>
          <SvgXml xml={starSvg} width={30} height={30} color={iconColor} />
        </TouchableOpacity>

         {/* Substituindo o botão "Trocar cor letras" pelo ícone de meio círculo */}
         <TouchableOpacity onPress={() => navigation.navigate('Favorites', { notes: favoriteNotes })}>
          <SvgXml xml={halfCircleSvg} width={30} height={30} color={iconColor} />
        </TouchableOpacity>
      </View>
      
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dropdownMenu: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
});

export default MainScreen;