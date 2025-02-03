// screens/MainScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // Para navegação
import { saveNotes, loadNotes } from '../utils/storage';  // Importando as funções de storage

import NoteCard from '../components/NoteCard';  // Componente para exibir cada nota

const MainScreen = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();  // Hook de navegação

  // Carregar as notas ao iniciar a tela
  useEffect(() => {
    const loadSavedNotes = async () => {
      const savedNotes = await loadNotes();
      setNotes(savedNotes);
    };
    loadSavedNotes();
  }, []);

  // Filtrar notas com base na pesquisa
  const filteredNotes = notes.filter(note => note.title.includes(search) || note.content.includes(search));

  return (
    <View style={{ flex: 1, paddingTop: 50, padding: 10 }}>
      <TextInput
        placeholder="Pesquisar notas"
        value={search}
        onChangeText={setSearch}
        style={{
          borderWidth: 1,
          borderRadius: 5,
          padding: 10,
          marginBottom: 10,
        }}
      />
      
      <Button
        title="Adicionar Nota"
        onPress={() => navigation.navigate('CreateNote')}  // Navega para a tela de criação de nota
      />
      
      {/* Exibe as notas filtradas */}
      <FlatList
        data={filteredNotes}
        renderItem={({ item }) => <NoteCard note={item} />}
        keyExtractor={item => item.id}
        numColumns={2}
      />
    </View>
  );
};

export default MainScreen;
