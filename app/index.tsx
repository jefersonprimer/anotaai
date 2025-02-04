import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './screens/MainScreen'; 
import CreateNoteScreen from './screens/CreateNoteScreen';
import NoteDetailsScreen from './screens/NoteDetailsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SearchScreen from './screens/SearchScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
      <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />  
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}
