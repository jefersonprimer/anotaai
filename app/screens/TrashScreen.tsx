import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useTrash } from '../context/TrashContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import HeaderBack from '../components/HeaderBack';

const TrashScreen = () => {
  const { trashedNotes, restoreFromTrash, deletePermantly, emptyTrash } = useTrash();
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();

  const handleRestore = async (noteId: string) => {
    const restoredNote = await restoreFromTrash(noteId);
    if (restoredNote) {
      // Aqui você pode implementar a lógica para adicionar a nota restaurada
      // de volta à lista principal de notas
      Alert.alert('Sucesso', 'Nota restaurada com sucesso!');
    }
  };

  const handleDelete = (noteId: string) => {
    Alert.alert(
      'Confirmação',
      'Deseja excluir permanentemente esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => {
            deletePermantly(noteId);
            Alert.alert('Sucesso', 'Nota excluída permanentemente!');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleEmptyTrash = () => {
    Alert.alert(
      'Confirmação',
      'Deseja esvaziar a lixeira? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Esvaziar', 
          onPress: () => {
            emptyTrash();
            Alert.alert('Sucesso', 'Lixeira esvaziada com sucesso!');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.noteCard, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <View style={styles.noteContent}>
        <Text style={[styles.noteTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          {item.title}
        </Text>
        <Text style={[styles.noteDate, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Excluído em: {new Date(item.deletedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.noteActions}>
        <TouchableOpacity onPress={() => handleRestore(item.id)} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>↩️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <HeaderBack title="Lixeira" />
      
      <View style={styles.header}>
        {trashedNotes.length > 0 && (
          <TouchableOpacity onPress={handleEmptyTrash} style={styles.emptyButton}>
            <Text style={[styles.emptyButtonText, { color: isDarkMode ? '#fff' : '#000' }]}>
              Esvaziar Lixeira
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {trashedNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: isDarkMode ? '#fff' : '#666' }]}>
            A lixeira está vazia
          </Text>
        </View>
      ) : (
        <FlatList
          data={trashedNotes}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  emptyButton: {
    padding: 8,
  },
  emptyButtonText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  noteCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
  },
});

export default TrashScreen; 