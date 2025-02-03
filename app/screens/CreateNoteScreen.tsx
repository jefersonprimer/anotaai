// screens/CreateNoteScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // Hook de navegação
import { saveNotes, loadNotes } from '../utils/storage';  // Funções de storage

const CreateNoteScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigation = useNavigation();  // Navegação para voltar à tela principal

  const handleSaveNote = async () => {
    if (title.trim() === '' || content.trim() === '') return;

    const newNote = { id: String(new Date().getTime()), title, content, starred: false };

    const savedNotes = await loadNotes();
    const updatedNotes = [...savedNotes, newNote];

    await saveNotes(updatedNotes);

    navigation.goBack(); // Volta para a tela principal
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderRadius: 5,
          padding: 10,
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Conteúdo"
        value={content}
        onChangeText={setContent}
        style={{
          borderWidth: 1,
          borderRadius: 5,
          padding: 10,
          marginBottom: 20,
          height: 200,
        }}
        multiline
      />

      <Button title="Salvar Nota" onPress={handleSaveNote} />
    </View>
  );
};

export default CreateNoteScreen;
