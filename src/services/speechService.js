import Voice from 'react-native-voice';
import { Platform, PermissionsAndroid } from 'react-native';

class SpeechService {
    constructor() {
        this._initialized = false;
        this._listeners = {};
        this._isRecording = false;
        this._onSpeechStart = null;
        this._onSpeechEnd = null;
        this._onSpeechResults = null;
        this._onSpeechError = null;
        this._selectedLanguage = 'en-US';
    }

    initialize() {
        if (this._initialized) return true;

        // Voice is not available in web environment
        if (Platform.OS === 'web') {
            console.warn('Speech recognition is not supported in web environment');
            return false;
        }

        try {
            Voice.onSpeechStart = this._handleSpeechStart.bind(this);
            Voice.onSpeechEnd = this._handleSpeechEnd.bind(this);
            Voice.onSpeechResults = this._handleSpeechResults.bind(this);
            Voice.onSpeechError = this._handleSpeechError.bind(this);

            this._initialized = true;
            return true;
        } catch (e) {
            console.error('Failed to initialize speech recognition:', e);
            return false;
        }
    }

    set onSpeechStart(callback) {
        this._onSpeechStart = callback;
    }

    set onSpeechEnd(callback) {
        this._onSpeechEnd = callback;
    }

    set onSpeechResults(callback) {
        this._onSpeechResults = callback;
    }

    set onSpeechError(callback) {
        this._onSpeechError = callback;
    }

    setLanguage(languageCode) {
        this._selectedLanguage = languageCode;
    }

    _handleSpeechStart() {
        if (this._onSpeechStart) {
            this._onSpeechStart();
        }
    }

    _handleSpeechEnd() {
        if (this._onSpeechEnd) {
            this._onSpeechEnd();
        }
        this._isRecording = false;
    }

    _handleSpeechResults(event) {
        if (this._onSpeechResults && event.value) {
            // Apply similar processing as in the web version
            let transcript = event.value[0] || '';

            // Apply capitalization
            transcript = this._processSpeechText(transcript);

            this._onSpeechResults(transcript);
        }
    }

    _handleSpeechError(event) {
        if (this._onSpeechError) {
            this._onSpeechError(event);
        }
        this._isRecording = false;
    }

    _processSpeechText(text) {
        if (!text) return text;

        // Capitalize first letter of each sentence
        text = text.replace(/(^\w|\.\s+\w)/gm, (letter) => letter.toUpperCase());

        // Capitalize first letter of the text if it's not already capitalized
        if (text.length > 0 && !text[0].match(/[A-Z]/)) {
            text = text[0].toUpperCase() + text.slice(1);
        }

        // Add period at the end if no punctuation exists
        if (!text.match(/[.!?]$/)) {
            text += ".";
        }

        return text;
    }

    async requestMicrophonePermission() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: 'Microphone Permission',
                        message: 'The app needs access to your microphone for speech recognition.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.error('Failed to request microphone permission:', err);
                return false;
            }
        } else {
            // iOS handles permissions through Info.plist
            return true;
        }
    }

    async startRecording() {
        if (!this._initialized) {
            const success = this.initialize();
            if (!success) return false;
        }

        if (this._isRecording) {
            return true;
        }

        // Request microphone permission on Android
        if (Platform.OS === 'android') {
            const hasPermission = await this.requestMicrophonePermission();
            if (!hasPermission) {
                return false;
            }
        }

        try {
            await Voice.start(this._selectedLanguage);
            this._isRecording = true;
            return true;
        } catch (e) {
            console.error('Error starting speech recognition:', e);
            return false;
        }
    }

    async stopRecording() {
        if (!this._isRecording) {
            return true;
        }

        try {
            await Voice.stop();
            this._isRecording = false;
            return true;
        } catch (e) {
            console.error('Error stopping speech recognition:', e);
            return false;
        }
    }

    isRecording() {
        return this._isRecording;
    }

    async destroy() {
        if (!this._initialized) return;

        try {
            await Voice.destroy();

            Voice.onSpeechStart = null;
            Voice.onSpeechEnd = null;
            Voice.onSpeechResults = null;
            Voice.onSpeechError = null;

            this._initialized = false;
            this._isRecording = false;
        } catch (e) {
            console.error('Error destroying speech recognition:', e);
        }
    }
}

export default new SpeechService(); 