import React from 'react';
import { View, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import NoteCard from '../components/NoteCard';

// Definir a tipagem para os parâmetros da rota
interface FavoritesScreenRouteParams {
  notes: { id: string; title: string; content: string; starred: boolean }[]; // Defina o tipo das notas
}

interface FavoritesScreenProps {
  navigation: StackNavigationProp<any>; // Tipagem para a navegação
  route: RouteProp<{ params: FavoritesScreenRouteParams }, 'params'>; // Tipagem para a rota
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ route, navigation }) => {
  const { notes } = route.params; // Acessa as notas passadas na rota

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={notes}
        renderItem={({ item }) => (
          <NoteCard 
            note={item} 
            onPress={() => navigation.navigate('NoteDetails', { note: item })}
            onFavoriteToggle={() => {}}  // A tela de favoritos não precisa alterar o estado de favorito
          />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
      />
    </View>
  );
};

export default FavoritesScreen;
