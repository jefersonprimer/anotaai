import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Definir os tipos de dados para o parâmetro da rota
interface Note {
  id: string;
  title: string;
  content: string;
  starred: boolean;
}

interface NoteDetailsRouteParams {
  note: Note;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  onNoteDeleted: () => void;
}

interface NoteDetailsScreenProps {
  navigation: StackNavigationProp<any>; // Tipagem para a navegação
  route: RouteProp<{ params: NoteDetailsRouteParams }, 'params'>; // Tipagem para a rota
}

const NoteDetailsScreen: React.FC<NoteDetailsScreenProps> = ({ route, navigation }) => {
  const { note, updateNote, deleteNote, onNoteDeleted } = route.params;
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    updateNote(note.id, title.trim(), content.trim());
    navigation.goBack();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta nota permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => {
            console.log('Deletando nota com id:', note.id); // Log para depuração
            deleteNote(note.id); // Chama a função de exclusão corretamente
            onNoteDeleted(); // Função para atualizar a lista de notas na tela principal
            navigation.goBack(); // Vai de volta para a tela anterior após a exclusão
          }
        }
      ]
    );
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

      <Button title="Salvar Alterações" onPress={handleSave} />
      <Button title="Excluir Nota" onPress={confirmDelete} color="red" />
    </View>
  );
};

export default NoteDetailsScreen;
