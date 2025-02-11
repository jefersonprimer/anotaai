import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useIconColor } from '../context/IconColorContext';
import { useCategories } from '../context/CategoryContext';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    starred: boolean;
    categoryId?: string;
    createdAt: string;
  };
  onPress: () => void;
  onFavoriteToggle: () => void;
  onLongPress?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, onFavoriteToggle, onLongPress }) => {
  const { isDarkMode } = useTheme();
  const { iconColor } = useIconColor();
  const { categories } = useCategories();

  const category = categories.find(cat => cat.id === note.categoryId);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? '#333' : '#fff' }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          onPress={onFavoriteToggle}
          style={styles.starButton}
        >
          <MaterialIcons
            name={note.starred ? "star" : "star-outline"}
            size={24}
            color={iconColor}
          />
        </TouchableOpacity>
        
        <Text 
          style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}
          numberOfLines={1}
        >
          {note.title || 'Sem título'}
        </Text>

        {category && (
          <Text 
            style={[styles.category, { color: isDarkMode ? '#ccc' : '#666' }]}
            numberOfLines={1}
          >
            {category.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  category: {
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 8,
  },
});

export default NoteCard;
