// components/NoteCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

const NoteCard = ({ note }: { note: { title: string, content: string, starred: boolean } }) => {
  return (
    <View style={{ flex: 1, margin: 10, padding: 10, borderWidth: 1, borderRadius: 8 }}>
      <Text style={{ fontWeight: 'bold' }}>{note.title}</Text>
      <Text>{note.content}</Text>
      {note.starred && <Text>⭐</Text>}
    </View>
  );
};

export default NoteCard;
