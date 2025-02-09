import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFavorites } from '../context/FavoriteContext';
import { useCategories } from '../context/CategoryContext';
import { useTheme } from '../context/ThemeContext';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    categoryId?: string;
  };
  onPress: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onPress }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { categories } = useCategories();
  const { isDarkMode } = useTheme();

  const getCategoryName = () => {
    if (!note.categoryId) return null;
    const category = categories.find(cat => cat.id === note.categoryId);
    return category?.name;
  };

  const categoryName = getCategoryName();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? '#333' : '#fff' }
      ]}
    >
      <View style={styles.header}>
        <Text 
          style={[
            styles.title,
            { color: isDarkMode ? '#fff' : '#000' }
          ]} 
          numberOfLines={1}
        >
          {note.title}
        </Text>
        <TouchableOpacity 
          onPress={() => isFavorite(note.id) ? removeFavorite(note.id) : addFavorite(note.id)}
        >
          <Icon
            name={isFavorite(note.id) ? 'star' : 'star-border'}
            size={24}
            color={isFavorite(note.id) ? 'gold' : '#666'}
          />
        </TouchableOpacity>
      </View>

      {categoryName && (
        <View style={styles.categoryContainer}>
          <Text style={[
            styles.categoryText,
            { color: isDarkMode ? '#ccc' : '#666' }
          ]}>
            {categoryName}
          </Text>
        </View>
      )}

      <Text 
        style={[
          styles.content,
          { color: isDarkMode ? '#ccc' : '#666' }
        ]} 
        numberOfLines={2}
      >
        {note.content}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  content: {
    fontSize: 14,
  },
});

export default NoteCard;
