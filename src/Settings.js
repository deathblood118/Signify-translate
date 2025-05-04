import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Settings = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  // Reload history whenever the component is rendered
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('translation_history');
        if (savedHistory) {
          // Reverse the history array so that the most recent translation is at the top
          setHistory(JSON.parse(savedHistory).reverse());
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };
    loadHistory();
  }, []); // Ensure this effect runs once when the component is mounted

  // Function to clear all history
  const clearHistory = async () => {
    Alert.alert('Clear History', 'Are you sure you want to delete all history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('translation_history');
          setHistory([]); // Clear the state as well
        },
      },
    ]);
  };

  // Function to delete a specific history entry
  const deleteEntry = async (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    await AsyncStorage.setItem('translation_history', JSON.stringify(updatedHistory));
    setHistory(updatedHistory); // Update the state to reflect the deletion
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Translation History</Text>

      <ScrollView style={styles.historyContainer}>
        {history.length === 0 ? (
          <Text style={styles.noHistory}>No translation history found.</Text>
        ) : (
          history.map((entry, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.languageLabel}>From ({entry.from}):</Text>
              <Text style={styles.text}>{entry.input}</Text>
              <Text style={styles.languageLabel}>To ({entry.to}):</Text>
              <Text style={styles.text}>{entry.output}</Text>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => deleteEntry(index)}
              >
                <Icon name="delete" size={20} color="red" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Clear History Button */}
      <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
        <Text style={styles.clearButtonText}>Clear All History</Text>
      </TouchableOpacity>

      {/* Footer for Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => navigation.navigate('DemoPage')}
        >
          <Icon name="star" size={24} color="#00CFFF" />
          <Text style={styles.footerButtonText}>SignLanguage</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => navigation.navigate('TranslateApp')}
        >
          <Icon name="home" size={24} color="#00CFFF" />
          <Text style={styles.footerButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 20,
  },
  historyContainer: {
    flex: 1,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
  },
  languageLabel: {
    fontSize: 16,
    color: '#00CFFF',
    marginBottom: 5,
  },
  text: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  noHistory: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#ddd',
    textAlign: 'center',
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#000',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1, // Ensure it's above other content
  },
  footerButton: {
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#00CFFF',
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: 'red',
    marginLeft: 5,
    fontSize: 14,
  },
});
