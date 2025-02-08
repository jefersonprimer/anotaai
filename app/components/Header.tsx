import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { IconButton } from 'react-native-paper';

// Definindo os SVGs
const shapesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="currentColor" d="M4 4h4v4H4V4z"/>
  <path fill="currentColor" d="M14 4l4 4l-4 4V4z"/>
  <path fill="currentColor" d="M4 14h4v4H4v-4z"/>
  <circle fill="currentColor" cx="16" cy="16" r="2"/>
</svg>`;

interface HeaderProps {
  toggleLayout: () => void;
  toggleModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleLayout, toggleModal }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.header}>
      {/* Botão para alternar o layout das notas */}
      <TouchableOpacity onPress={toggleLayout}>
        <SvgXml xml={shapesSvg} width={30} height={30} color="white" />
      </TouchableOpacity>

      {/* Título centralizado */}
      <Text style={styles.headerTitle}>Anotaai</Text>

      {/* Botão para abrir o modal com as opções */}
      <TouchableOpacity onPress={toggleModal}>
        <IconButton icon="menu" color="white" size={30} />
      </TouchableOpacity>

      {/* Modal de opções */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => console.log('Trash')}>
              <Text style={styles.modalOption}>Trash</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Darkmode')}>
              <Text style={styles.modalOption}>Dark Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleModalClose}>
              <Text style={styles.modalOption}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171717',
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOption: {
    fontSize: 18,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default Header;
