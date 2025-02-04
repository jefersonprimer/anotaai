import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { saveNotes } from '../utils/storage';

const CreateNote = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { onNoteCreated } = route.params;

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      starred: false,
      createdAt: new Date().toISOString()
    };

    const existingNotes = await loadNotes();
    const updatedNotes = [...existingNotes, newNote];
    await saveNotes(updatedNotes);
    onNoteCreated();
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={{ fontSize: 24, borderBottomWidth: 1, marginBottom: 15, padding: 5 }}
      />

      <TextInput
        placeholder="Conteúdo"
        value={content}
        onChangeText={setContent}
        multiline
        style={{ 
          fontSize: 18, 
          flex: 1, 
          textAlignVertical: 'top', 
          padding: 10, 
          borderWidth: 1, 
          borderRadius: 5 
        }}
      />

      <Button title="Criar Nota" onPress={handleCreate} />
    </View>
  );
};

export default CreateNote;