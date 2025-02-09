import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface ColorPaletteProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  position: { top: number; right: number };
}

const colors = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1'];

const ColorPalette: React.FC<ColorPaletteProps> = ({ 
  visible, 
  onClose, 
  onSelectColor,
  position 
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.paletteContainer, { 
          top: position.top, 
          right: position.right 
        }]}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorButton, { backgroundColor: color }]}
              onPress={() => {
                onSelectColor(color);
                onClose();
              }}
            />
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  paletteContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
});

export default ColorPalette; 