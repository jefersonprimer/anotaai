import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCategories } from '../context/CategoryContext';
import { Icon } from '@expo/vector-icons';

export function CategorySelectScreen({ route, navigation }) {
  const { categories } = useCategories();
  const { selectedCategoryId, onSelectCategory } = route.params;

  const handleCategorySelect = async (categoryId: string) => {
    await onSelectCategory(categoryId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategoryId === item.id && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect(item.id)}
          >
            <Text style={styles.categoryName}>{item.name}</Text>
            {selectedCategoryId === item.id && (
              <Icon name="check" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          navigation.navigate('NewCategory', {
            onCategoryCreated: (newCategoryId: string) => {
              handleCategorySelect(newCategoryId);
            }
          });
        }}
      >
        <Text style={styles.addButtonText}>Nova Categoria</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedCategory: {
    backgroundColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
  },
  addButton: {
    padding: 16,
    backgroundColor: '#007AFF',
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 