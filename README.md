import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, Text } from 'react-native';
import { saveNotes, loadNotes } from '../utils/storage';
import NoteCard from '../components/NoteCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { IconButton } from 'react-native-paper'; // Usando IconButton da react-native-paper

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
  const [isGridLayout, setIsGridLayout] = useState(true);

  useEffect(() => {
    loadSavedNotes();
  }, []);

  const loadSavedNotes = async () => {
    const savedNotes = await loadNotes();
    setNotes(savedNotes);
  };

  const toggleLayout = () => {
    setIsGridLayout(prev => !prev); // Alterna entre grid e lista
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

  return (
    <View style={{ flex: 1, padding: 10 }}>

        {/* Cabeçalho com título e botão para alternar layout */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>AnotaAi</Text>
        <Button title="Alterar Layout" onPress={toggleLayout} />
      </View>

           {/* Lista de notas */}
        <FlatList
          key={isGridLayout ? 'grid' : 'list'} // Força uma nova renderização ao alterar o layout
          data={filteredNotes}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => navigation.navigate('NoteDetails', { note: item })}
            />
          )}
          keyExtractor={item => item.id}
          numColumns={isGridLayout ? 2 : 1} // Alterando o número de colunas com base no estado
        />

      {/* Barra inferior com os botões */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        
        {/* Ícone de pesquisa */}
        <Button
          title="mostrar checkBox"
          onPress={() => navigation.navigate('Search', { notes, search, setSearch })}
        />
        
        {/* Ícone de pesquisa */}
        <Button
          title="Search"
          onPress={() => navigation.navigate('Search', { notes, search, setSearch })}
        />

        {/* Botão "Criar Nota" */}
        <Button
          title="+"
          onPress={() => navigation.navigate('CreateNote', { 
            onNoteCreated: loadSavedNotes 
          })}
        />

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
