import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TranslateApp = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [translateText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('English');
  const [toLanguage, setToLanguage] = useState('Spanish');
  const [recording, setRecording] = useState(null);

  const API_KEY = /* input your own key*/
  const GOOGLE_API_KEY = /* input your own key */

  const handleTranslateText = async () => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          messages: [
            { role: 'user', content: `Translate the following ${fromLanguage} text into ${toLanguage}: "${inputText}"` },
          ],
          max_tokens: 500,
          model: 'gpt-3.5-turbo',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
        }
      );
      const translated = response.data.choices[0].message.content;
      setTranslatedText(translated);
      Keyboard.dismiss();

      const history = await AsyncStorage.getItem('translation_history');
      const parsed = history ? JSON.parse(history) : [];
      parsed.push({ input: inputText, output: translated, from: fromLanguage, to: toLanguage });
      await AsyncStorage.setItem('translation_history', JSON.stringify(parsed));

    } catch (error) {
      console.error('Error translating text: ', error.response?.data || error.message);
    }
  };

  const handleLanguageSelect = (type) => {
    const languages = [
      'English', 'Mandarin Chinese', 'Hindi', 'Spanish', 'French',
      'Arabic', 'Bengali', 'Russian', 'Portuguese', 'Urdu'
    ];
    Alert.alert(
      'Select Language',
      '',
      languages.map((lang) => ({
        text: lang,
        onPress: () => {
          if (type === 'from') setFromLanguage(lang);
          else setToLanguage(lang);
        },
      })),
      { cancelable: true }
    );
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      sendAudioToGoogle(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const sendAudioToGoogle = async (uri) => {
    try {
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestBody = {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
        audio: {
          content: audioBase64,
        },
      };

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();
      const transcript = result?.results?.[0]?.alternatives?.[0]?.transcript || '';
      setInputText(transcript);
    } catch (error) {
      console.error('Google STT Error:', error);
    }
  };

  const speakWithGoogle = async () => {
    if (!translateText) return;

    const googleTTSUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

    const requestBody = {
      input: { text: translateText },
      voice: {
        languageCode:
          toLanguage === 'Spanish' ? 'es-ES' :
          toLanguage === 'French' ? 'fr-FR' :
          toLanguage === 'German' ? 'de-DE' :
          toLanguage === 'Hindi' ? 'hi-IN' :
          toLanguage === 'Mandarin Chinese' ? 'zh-CN' :
          toLanguage === 'Arabic' ? 'ar-SA' :
          toLanguage === 'Bengali' ? 'bn-BD' :
          toLanguage === 'Russian' ? 'ru-RU' :
          toLanguage === 'Portuguese' ? 'pt-BR' :
          toLanguage === 'Urdu' ? 'ur-PK' :
          'en-US',
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    try {
      const response = await fetch(googleTTSUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      const base64Audio = data.audioContent;

      if (!base64Audio) {
        console.warn('No audio returned from Google TTS:', data);
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'speech.mp3';
      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      await sound.playAsync();
    } catch (err) {
      console.error('Google TTS Error:', err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>Translate</Text>

        {/* Input Box */}
        <View style={styles.card}>
          <View style={styles.languageLabelContainer}>
            <Text style={styles.languageLabel}>{fromLanguage}</Text>
            <TouchableOpacity onPress={() => handleLanguageSelect('from')}>
              <Icon name="arrow-drop-down" size={20} color="#00CFFF" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            onChangeText={setInputText}
            value={inputText}
            placeholder="Enter text"
            placeholderTextColor="#aaa"
            multiline
          />
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={handleTranslateText}>
              <Icon name="arrow-forward" size={24} color="#00CFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
              <Icon name={recording ? 'stop' : 'mic'} size={24} color={recording ? 'red' : '#00CFFF'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Output Box */}
        <View style={styles.card}>
          <View style={styles.languageLabelContainer}>
            <Text style={styles.languageLabel}>{toLanguage}</Text>
            <TouchableOpacity onPress={() => handleLanguageSelect('to')}>
              <Icon name="arrow-drop-down" size={20} color="#00CFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.translatedText}>{translateText}</Text>
          <TouchableOpacity onPress={speakWithGoogle}>
            <Icon name="volume-up" size={24} color="#00CFFF" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('DemoPage')}>
            <Icon name="star" size={24} color="#00CFFF" />
            <Text style={styles.footerButtonText}>SignLanguage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings" size={24} color="#00CFFF" />
            <Text style={styles.footerButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default TranslateApp;

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
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  languageLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  languageLabel: {
    fontSize: 16,
    color: '#00CFFF',
    marginRight: 5,
  },
  input: {
    fontSize: 18,
    color: '#fff',
    minHeight: 100,
  },
  translatedText: {
    fontSize: 18,
    color: '#fff',
    minHeight: 100,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
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
    right: 0, // <-- Make sure this is added
    height: 60,
  },
  footerButton: {
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#00CFFF',
    fontSize: 14,
    marginTop: 4,
  },
});

