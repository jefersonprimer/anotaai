import React from 'react';
import { View, FlatList, Text } from 'react-native';
import NoteCard from '../components/NoteCard';

const FavoritesScreen = ({ route, navigation }) => {
  const { notes } = route.params;  // As notas favoritas são passadas como parâmetro

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
