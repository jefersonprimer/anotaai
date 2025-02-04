import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import { Note } from './MainScreen';  // Importando o tipo Note
import { loadNotes } from '../utils/storage';  // Função para carregar as notas

interface SearchScreenProps {
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  search: string;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ setSearch, search }) => {
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const notes = await loadNotes();  // Carrega as notas do AsyncStorage
      
      // Verifica se a lista de notas não está vazia e filtra corretamente
      const filtered = notes.filter(note =>
        (note.title && typeof note.title === 'string' && note.title.toLowerCase().includes(search.toLowerCase()))  // Adiciona checagem de tipo para 'title'
      );
      setFilteredNotes(filtered);  // Atualiza as notas filtradas no estado
    };

    fetchNotes();
  }, [search]);  // Chama sempre que o 'search' mudar

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <TextInput
        placeholder="Pesquisar notas"
        value={search}
        onChangeText={setSearch}  // Atualiza o texto da pesquisa
        style={{ borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 }}
      />

      <FlatList
        data={filteredNotes}  // Exibe as notas filtradas
        renderItem={({ item }) => (
          <View style={{ padding: 10, backgroundColor: 'lightgray', marginBottom: 10 }}>
            <Text>{item.title}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default SearchScreen;
