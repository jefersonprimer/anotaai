import React from 'react';
import { View, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ColorPaletteProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  position: { top: number; right: number };
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ 
  visible, 
  onClose, 
  onSelectColor,
  position 
}) => {
  const { isDarkMode } = useTheme();
  
  const colors = [
    '#FF6B6B',  // vermelho
    '#4ECDC4',  // turquesa
    '#45B7D1',  // azul
    '#96CEB4',  // verde
    '#FFEEAD',  // amarelo
    '#D4A5A5',  // rosa
    '#9370DB',  // roxo
    '#FFFFFF',  // branco
    '#000000',  // preto
  ];

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          style={[
            styles.paletteContainer,
            { 
              backgroundColor: isDarkMode ? '#333' : '#fff',
              top: position.top,
              right: position.right
            }
          ]}
        >
          <View style={styles.colorsGrid}>
            {colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorButton,
                  { 
                    backgroundColor: color,
                    borderWidth: color === '#FFFFFF' ? 1 : 0,  // Adiciona borda para a cor branca
                    borderColor: isDarkMode ? '#666' : '#ddd'  // Cor da borda baseada no tema
                  }
                ]}
                onPress={() => onSelectColor(color)}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  paletteContainer: {
    position: 'absolute',
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: 150,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
});

export default ColorPalette; 