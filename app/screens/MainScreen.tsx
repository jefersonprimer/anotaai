import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, TouchableOpacity } from 'react-native';
import { saveNotes, loadNotes } from '../utils/storage';
import NoteCard from '../components/NoteCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { IconButton } from 'react-native-paper'; // Usando IconButton da react-native-paper
import { SvgXml } from 'react-native-svg';  // Importando o SvgXml
import Header from '../components/Header';
import { StyleSheet } from 'react-native';

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

  useEffect(() => {
    loadSavedNotes();
  }, []);

  const loadSavedNotes = async () => {
    const savedNotes = await loadNotes();
    setNotes(savedNotes);
  };

  const toggleStar = (id: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, starred: !note.starred } : note
    );
    setNotes(updatedNotes);  // Atualiza o estado local com as notas modificadas
    saveNotes(updatedNotes); // Re-salva as notas no AsyncStorage
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

  // Filtrando apenas as notas favoritas
  const favoriteNotes = notes.filter(note => note.starred);


  // Definindo o código do SVG como string
  const searchSvg = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
    <path fill="currentColor" d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
  </svg>`;

  // Definindo o código do SVG como string
  const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="12" fill="green"/> <!-- Círculo verde -->
  <path fill="white" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"/>
  </svg>`;


  // Adicione este SVG junto com os outros
  const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>`;

    // Adicione este SVG junto com os outros
    const shapesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M4 4h4v4H4V4z"/>
    <path fill="currentColor" d="M14 4l4 4l-4 4V4z"/>
    <path fill="currentColor" d="M4 14h4v4H4v-4z"/>
    <circle fill="currentColor" cx="16" cy="16" r="2"/>
  </svg>`;

    // Adicione este SVG junto com os outros
    const halfCircleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z"/>
    </svg>`;

  return (
    <View style={styles.container}>
      
      <Header toggleLayout={function (): void {
        throw new Error('Function not implemented.');
      } } toggleModal={function (): void {
        throw new Error('Function not implemented.');
      } }/>

      <FlatList
        style={styles.flatList}
        data={filteredNotes}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => navigation.navigate('NoteDetails', { 
              note: item,
              updateNote,
              deleteNote,
              onNoteDeleted: loadSavedNotes
            })}
            onFavoriteToggle={() => toggleStar(item.id)}  // Passa a função corretamente
          />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
      />

      {/* Barra inferior com os botões */}
      <View style={styles.bottomBar}>
        
        {/* Ícone de shapes */}
        <TouchableOpacity onPress={() => navigation.navigate('Search', { notes, search, setSearch })}>
          <SvgXml xml={shapesSvg} width={30} height={30} color="white" />
        </TouchableOpacity>

        
        {/* Botão "Search" com o ícone SVG */}
        <TouchableOpacity onPress={() => navigation.navigate('Search', { notes, search, setSearch })}>
         <SvgXml xml={searchSvg} width={30} height={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('CreateNote', { 
          onNoteCreated: loadSavedNotes 
        })}>
          <SvgXml xml={plusSvg} width={30} height={30} color="white" />
        </TouchableOpacity>


        {/* Substituindo o botão Favoritos por um ícone de estrela */}
        <TouchableOpacity onPress={() => navigation.navigate('Favorites', { notes: favoriteNotes })}>
          <SvgXml xml={starSvg} width={30} height={30} color="white" />
        </TouchableOpacity>

         {/* Substituindo o botão "Trocar cor letras" pelo ícone de meio círculo */}
         <TouchableOpacity onPress={() => navigation.navigate('Favorites', { notes: favoriteNotes })}>
          <SvgXml xml={halfCircleSvg} width={30} height={30} color="white" />
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1B1B1B', // Fundo preto
  },
  flatList: {
    flexGrow: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#171717', // bg div btn
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  iconButton: {
    padding: 10, // Adiciona área de toque maior
    color: "#fff"
  },
});




export default MainScreen;