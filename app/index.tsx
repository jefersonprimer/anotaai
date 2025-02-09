import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './context/ThemeContext';
import { StatusBar } from 'react-native';
import MainScreen from './screens/MainScreen'; 
import CreateNoteScreen from './screens/CreateNoteScreen';
import NoteDetailsScreen from './screens/NoteDetailsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SearchScreen from './screens/SearchScreen';
import { useTheme } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoriteContext';
import { TrashProvider } from './context/TrashContext';
import TrashScreen from './screens/TrashScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <TrashProvider>
          <StatusBar barStyle="dark-content" />
            <Stack.Navigator 
              initialRouteName="Main"
            >
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
            <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />  
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen 
              name="Trash" 
              component={TrashScreen}
              options={{ title: 'Lixeira' }}
            />
          </Stack.Navigator>
        </TrashProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}