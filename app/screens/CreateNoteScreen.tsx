import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { saveNotes, loadNotes } from '../utils/storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Definindo o tipo dos parâmetros de rota
interface CreateNoteRouteParams {
  onNoteCreated: () => void; // Função de callback
}

// Tipagem para as props do componente CreateNote
interface CreateNoteProps {
  navigation: StackNavigationProp<any>; // Tipagem para a navegação
  route: RouteProp<{ params: CreateNoteRouteParams }, 'params'>; // Tipagem para o route com parâmetros definidos
}

const CreateNote: React.FC<CreateNoteProps> = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Aqui já podemos acessar corretamente o onNoteCreated, pois foi tipado
  const { onNoteCreated } = route.params;

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    // Criação de uma nova nota
    const newNote = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      starred: false,
      createdAt: new Date().toISOString()
    };

    try {
      // Carrega as notas existentes
      const existingNotes = await loadNotes();
      const updatedNotes = [...existingNotes, newNote]; // Adiciona a nova nota

      // Salva as notas atualizadas
      await saveNotes(updatedNotes);

      // Chama a função de callback para atualizar a lista de notas
      if (onNoteCreated) {
        onNoteCreated();
      }

      // Navega de volta para a tela anterior
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      Alert.alert('Erro', 'Não foi possível salvar a nota.');
    }
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
