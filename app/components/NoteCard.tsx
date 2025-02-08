import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface NoteCardProps {
  note: { id: string; title: string; content: string; starred: boolean };
  onPress: () => void;
  onFavoriteToggle: () => void; // Função de alternância de favorito
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, onFavoriteToggle }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
        <TouchableOpacity onPress={onFavoriteToggle}>
          <Icon
            name={note.starred ? 'star' : 'star-border'}
            size={24}
            color={note.starred ? 'gold' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: '#171717',
    borderRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  content: {
    fontSize: 14,
    color: '#666',
  }
});

export default NoteCard;
