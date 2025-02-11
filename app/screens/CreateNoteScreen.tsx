import React, { useState } from 'react';
import { View, TextInput, Button, Alert, TouchableOpacity, Text } from 'react-native';
import { saveNotes, loadNotes } from '../utils/storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Note } from '../types/Note';
import HeaderBack from '../components/HeaderBack';
import { useTheme } from '../context/ThemeContext';
import { useIconColor } from '../context/IconColorContext';


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
  const { isDarkMode } = useTheme();
  const { iconColor } = useIconColor();
  
  // Aqui já podemos acessar corretamente o onNoteCreated, pois foi tipado
  const { onNoteCreated } = route.params;

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date(),
      starred: false
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
      <HeaderBack title="Criar Nota"/>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
          style={{
            fontSize: 24,
            flex: 1,
            borderWidth: 0,
            outlineStyle: 'none',
            color: iconColor
          }}
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
        />
      </View>
      
      <TextInput
        placeholder="Notas"
        value={content}
        onChangeText={setContent}
        multiline
        style={{
          fontSize: 18,
          flex: 1,
          textAlignVertical: 'top',
          padding: 10,
          borderWidth: 0,
          outlineStyle: 'none',
          color: iconColor
        }}
        placeholderTextColor={isDarkMode ? '#666' : '#999'}
      />

      <TouchableOpacity
        onPress={handleCreate}
        style={{
          backgroundColor: isDarkMode ? '#333' : '#fff',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 10,
          borderWidth: 1,
          borderColor: iconColor
        }}
      >
        <Text style={{
          color: iconColor,
          fontSize: 16,
          fontWeight: '500'
        }}>
          Criar Nota
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateNote;
