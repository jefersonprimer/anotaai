import React from 'react';
import { View, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import NoteCard from '../components/NoteCard';
import HeaderBack from '../components/HeaderBack';
import { useTheme } from '../context/ThemeContext';

// Definir a tipagem para os parâmetros da rota
interface FavoritesScreenRouteParams {
  notes: Array<{
    id: string;
    title: string;
    content: string;
    starred: boolean;
    categoryId?: string;
    createdAt: string;
    items?: { id: string; text: string; isChecked: boolean }[];
  }>;
}

interface FavoritesScreenProps {
  navigation: StackNavigationProp<any>; // Tipagem para a navegação
  route: RouteProp<{ params: FavoritesScreenRouteParams }, 'params'>; // Tipagem para a rota
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ route, navigation }) => {
  const { notes } = route.params; // Acessa as notas passadas na rota
  const { isDarkMode } = useTheme();

  const renderItem = ({ item }) => {
    const isChecklist = 'items' in item;
    
    return (
      <NoteCard
        note={{
          id: item.id,
          title: item.title,
          content: isChecklist 
            ? `${item.items.length} itens • ${item.items.filter(i => i.isChecked).length} concluídos`
            : item.content,
          starred: item.starred,
          categoryId: item.categoryId,
          createdAt: item.createdAt
        }}
        onPress={() => {
          if (isChecklist) {
            navigation.navigate('Checklist', { checklist: item });
          } else {
            navigation.navigate('NoteDetails', { note: item });
          }
        }}
        onFavoriteToggle={() => {}} // Desativado na tela de favoritos
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <HeaderBack title="Favoritos" />
      
      <View style={{ flex: 1, padding: 10 }}>
        <FlatList
          data={notes}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
        />
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
  },
};

export default FavoritesScreen;
