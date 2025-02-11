import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useIconColor } from '../context/IconColorContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderBackProps {
  title?: string;
}

const HeaderBack: React.FC<HeaderBackProps> = ({ title }) => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const { iconColor } = useIconColor();

  return (
    <View style={[
      styles.header,
      { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon 
          name="arrow-back" 
          size={24} 
          color={iconColor}
        />
      </TouchableOpacity>
      {title && (
        <Text style={[
          styles.title,
          { color: iconColor }
        ]}>
          {title}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default HeaderBack; 