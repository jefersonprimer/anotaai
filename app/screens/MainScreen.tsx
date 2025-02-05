import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, TouchableOpacity } from 'react-native';
import { saveNotes, loadNotes } from '../utils/storage';
import NoteCard from '../components/NoteCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { IconButton } from 'react-native-paper'; // Usando IconButton da react-native-paper
import { SvgXml } from 'react-native-svg';  // Importando o SvgXml

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
    <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
  </svg>`;

  // Definindo o código do SVG como string
  const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"></path>
  </svg>`;

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        
        {/* Ícone de pesquisa */}
        <Button
          title="mostrar checkBox"
          onPress={() => navigation.navigate('Search', { notes, search, setSearch })}
        />
        
        {/* Botão "Search" com o ícone SVG */}
        <TouchableOpacity onPress={() => navigation.navigate('Search', { notes, search, setSearch })}>
         <SvgXml xml={searchSvg} width={30} height={30} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('CreateNote', { 
          onNoteCreated: loadSavedNotes 
        })}>
          <SvgXml xml={plusSvg} width={30} height={30} />
        </TouchableOpacity>

        {/* Botão "Favoritos" */}
        <Button
          title="Favoritos"
          onPress={() => navigation.navigate('Favorites', { notes: favoriteNotes })}
        />

        {/* Botão "Trocar a cor das letras" */}
        <Button
          title="Trocar cor letras"
          onPress={() => navigation.navigate('Favorites', { notes: favoriteNotes })}
        />
      </View>
      
    </View>
  );
};

export default MainScreen;