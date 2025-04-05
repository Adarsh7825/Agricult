import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';

// Import AppImages from utils
import AppImages from '../utils/AppImages';

const DiseaseDetectionScreen = () => {
    const [image, setImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);

    // Animation for the upload box
    const bounceAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        // Create a bouncing animation for the upload box
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Mock function to take a photo (would use camera API in a real app)
    const takePhoto = () => {
        // Simulate selecting a photo
        setImage(AppImages.plantSample);
    };

    // Mock function to pick an image (would use image picker in a real app)
    const pickImage = () => {
        // Simulate selecting a photo
        setImage(AppImages.plantSample);
    };

    // Mock function to analyze the image
    const analyzeImage = () => {
        if (!image) return;

        setIsAnalyzing(true);

        // Simulate API call delay
        setTimeout(() => {
            setIsAnalyzing(false);
            setResults({
                disease: 'Leaf Blight',
                confidence: 92,
                description: 'Leaf blight is a common disease affecting various crops. It appears as brownish spots on leaves that expand rapidly.',
                recommendations: [
                    'Apply copper-based fungicide spray',
                    'Remove and destroy infected leaves',
                    'Improve air circulation around plants',
                    'Avoid overhead watering to reduce leaf moisture'
                ]
            });
        }, 2000);
    };

    // Reset the analysis
    const resetAnalysis = () => {
        setImage(null);
        setResults(null);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Crop Disease Detection</Text>
                    <Text style={styles.subtitle}>
                        Take or upload a photo of your crop to identify diseases
                    </Text>
                </View>

                {/* Image Upload Section */}
                {!image ? (
                    <Animated.View
                        style={[
                            styles.uploadContainer,
                            { transform: [{ scale: bounceAnim }] }
                        ]}
                    >
                        <MaterialCommunityIcons name="leaf-maple" size={80} color="#4CAF50" />
                        <Text style={styles.uploadText}>
                            Take a clear photo of the affected plant part
                        </Text>
                        <View style={styles.buttonContainer}>
                            <CustomButton
                                title="Take Photo"
                                onPress={takePhoto}
                                icon={<MaterialCommunityIcons name="camera" size={18} color="#FFFFFF" />}
                                style={styles.button}
                            />
                            <CustomButton
                                title="Upload Image"
                                onPress={pickImage}
                                primary={false}
                                icon={<MaterialCommunityIcons name="image" size={18} color="#4CAF50" />}
                                style={styles.button}
                            />
                        </View>
                    </Animated.View>
                ) : (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={image} style={styles.imagePreview} />

                        {!isAnalyzing && !results && (
                            <View style={styles.buttonContainer}>
                                <CustomButton
                                    title="Analyze"
                                    onPress={analyzeImage}
                                    icon={<MaterialCommunityIcons name="magnify" size={18} color="#FFFFFF" />}
                                    style={styles.button}
                                />
                                <CustomButton
                                    title="Change Image"
                                    onPress={resetAnalysis}
                                    primary={false}
                                    style={styles.button}
                                />
                            </View>
                        )}

                        {isAnalyzing && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#4CAF50" />
                                <Text style={styles.loadingText}>Analyzing image...</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Results Section */}
                {results && (
                    <View style={styles.resultsContainer}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.diseaseTitle}>{results.disease}</Text>
                            <View style={styles.confidenceBadge}>
                                <Text style={styles.confidenceText}>{results.confidence}% match</Text>
                            </View>
                        </View>

                        <Text style={styles.descriptionTitle}>About this disease:</Text>
                        <Text style={styles.descriptionText}>{results.description}</Text>

                        <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                        {results.recommendations.map((rec, index) => (
                            <View key={index} style={styles.recommendationItem}>
                                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                                <Text style={styles.recommendationText}>{rec}</Text>
                            </View>
                        ))}

                        <View style={styles.buttonContainer}>
                            <CustomButton
                                title="Get Expert Help"
                                onPress={() => { }}
                                style={styles.button}
                            />
                            <CustomButton
                                title="New Analysis"
                                onPress={resetAnalysis}
                                primary={false}
                                style={styles.button}
                            />
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E4053',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#7E8C8D',
    },
    uploadContainer: {
        margin: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    uploadText: {
        fontSize: 16,
        color: '#2E4053',
        textAlign: 'center',
        marginVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 6,
    },
    imagePreviewContainer: {
        margin: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    imagePreview: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginBottom: 16,
        resizeMode: 'cover',
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#4CAF50',
        marginTop: 12,
    },
    resultsContainer: {
        margin: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    diseaseTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    confidenceBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    confidenceText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E4053',
        marginBottom: 6,
    },
    descriptionText: {
        fontSize: 15,
        color: '#2E4053',
        lineHeight: 22,
        marginBottom: 16,
    },
    recommendationsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E4053',
        marginBottom: 8,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    recommendationText: {
        fontSize: 15,
        color: '#2E4053',
        marginLeft: 8,
        flex: 1,
    },
});

export default DiseaseDetectionScreen; 