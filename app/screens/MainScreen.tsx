import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Button } from 'react-native';
import { saveNotes, loadNotes } from '../utils/storage';
import NoteCard from '../components/NoteCard';

const MainScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSavedNotes();
  }, []);

  const loadSavedNotes = async () => {
    const savedNotes = await loadNotes();
    setNotes(savedNotes);
  };

  const toggleStar = (id) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, starred: !note.starred } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const updateNote = (id, newTitle, newContent) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, title: newTitle, content: newContent } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const deleteNote = (id) => {
    const filteredNotes = notes.filter(note => note.id !== id);
    setNotes(filteredNotes);
    saveNotes(filteredNotes);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <TextInput
        placeholder="Pesquisar notas"
        value={search}
        onChangeText={setSearch}
        style={{ borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 }}
      />

      <Button
        title="Adicionar Nota"
        onPress={() => navigation.navigate('CreateNote', { 
          onNoteCreated: loadSavedNotes 
        })}
      />

      <FlatList
        data={filteredNotes}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => navigation.navigate('NoteDetails', { 
              note: item,
              updateNote,
              deleteNote // A função deleteNote é passada aqui
            })}
            onToggleStar={() => toggleStar(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
      />
    </View>
  );
};

export default MainScreen;
