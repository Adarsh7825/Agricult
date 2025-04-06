import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useOffline } from '../context/OfflineContext';
import { useLocalization } from '../context/LocalizationContext';
import offlineVideoManager from '../utils/OfflineVideoManager';

// Mock API function - in a real app, this would fetch from a server
const fetchEducationalVideos = async (language = 'en') => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock data for MVP demonstration
    return [
        {
            id: 'soil-preparation-basics',
            title: {
                en: 'Soil Preparation Basics',
                hi: 'मिट्टी की तैयारी की मूल बातें',
                te: 'నేల సిద్ధం చేయడం పై మూలాంశాలు',
                ta: 'மண் தயாரிப்பு அடிப்படைகள்',
                kn: 'ಮಣ್ಣು ತಯಾರಿಕೆ ಮೂಲಾಂಶಗಳು',
            },
            description: {
                en: 'Learn the essential techniques for preparing soil for planting. This video covers testing, amendments, and tillage methods.',
                hi: 'बुवाई के लिए मिट्टी तैयार करने की आवश्यक तकनीकें सीखें। इस वीडियो में परीक्षण, संशोधन और जुताई के तरीके शामिल हैं।',
                te: 'నాటడానికి నేలను సిద్ధం చేయడానికి అవసరమైన పద్ధతులను తెలుసుకోండి. ఈ వీడియోలో పరీక్ష, సవరణలు మరియు దున్నే పద్ధతులు ఉన్నాయి.',
                ta: 'நடவு செய்வதற்கான மண்ணை தயாரிப்பதற்கான அத்தியாவசிய நுட்பங்களைக் கற்றுக்கொள்ளுங்கள். இந்த வீடியோவில் சோதனை, திருத்தங்கள் மற்றும் உழவு முறைகள் உள்ளடக்கியது.',
                kn: 'ನೆಡುವುದಕ್ಕಾಗಿ ಮಣ್ಣನ್ನು ಸಿದ್ಧಪಡಿಸಲು ಅಗತ್ಯವಾದ ತಂತ್ರಗಳನ್ನು ಕಲಿಯಿರಿ. ಈ ವೀಡಿಯೊ ಪರೀಕ್ಷೆ, ತಿದ್ದುಪಡಿಗಳು ಮತ್ತು ಉಳುಮೆ ವಿಧಾನಗಳನ್ನು ಒಳಗೊಂಡಿದೆ.',
            },
            // thumbnail: 'https://example.com/thumbnails/soil-prep.jpg',
            // placeholderThumbnail: require('https://sample-videos.com/img/Sample-png-image-500kb.png'),
            category: 'soil-health',
            duration: 720, // 12 minutes in seconds
            size: 85 * 1024 * 1024, // 85MB (simulated)
            downloadUrl: 'https://example.com/videos/soil-preparation.mp4',
            language: 'en', // Original language
            availableLanguages: ['en', 'hi', 'te', 'ta', 'kn'],
        },
        {
            id: 'natural-pest-control',
            title: {
                en: 'Natural Pest Control Methods',
                hi: 'प्राकृतिक कीट नियंत्रण विधियां',
                te: 'సహజ పురుగు నియంత్రణ పద్ధతులు',
                ta: 'இயற்கை பூச்சி கட்டுப்பாட்டு முறைகள்',
                kn: 'ನೈಸರ್ಗಿಕ ಕೀಟ ನಿಯಂತ್ರಣ ವಿಧಾನಗಳು',
            },
            description: {
                en: 'Discover organic and chemical-free methods to manage pests in your crops without harming the environment.',
                hi: 'अपनी फसलों में कीटों का पर्यावरण को नुकसान पहुंचाए बिना प्रबंधन करने के लिए जैविक और रासायनिक-मुक्त तरीकों का पता लगाएं।',
                te: 'పర్యావరణానికి హాని కలిగించకుండా మీ పంటలలో పురుగులను నియంత్రించడానికి సేంద్రీయ మరియు రసాయన-రహిత పద్ధతులను కనుగొనండి.',
                ta: 'சுற்றுச்சூழலுக்கு தீங்கு விளைவிக்காமல் உங்கள் பயிர்களில் பூச்சிகளை நிர்வகிக்க இயற்கை மற்றும் இரசாயனம் இல்லாத முறைகளைக் கண்டறியுங்கள்.',
                kn: 'ಪರಿಸರಕ್ಕೆ ಹಾನಿ ಮಾಡದೆ ನಿಮ್ಮ ಬೆಳೆಗಳಲ್ಲಿ ಕೀಟಗಳನ್ನು ನಿರ್ವಹಿಸಲು ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ-ಮುಕ್ತ ವಿಧಾನಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
            },
            // thumbnail: 'https://example.com/thumbnails/natural-pest.jpg',
            // placeholderThumbnail: require('../../assets/placeholders/pest-control.png'),
            category: 'pest-control',
            duration: 840, // 14 minutes in seconds
            size: 92 * 1024 * 1024, // 92MB (simulated)
            downloadUrl: 'https://example.com/videos/natural-pest-control.mp4',
            language: 'en',
            availableLanguages: ['en', 'hi', 'te', 'ta', 'kn'],
        },
        {
            id: 'water-conservation',
            title: {
                en: 'Water Conservation Techniques',
                hi: 'जल संरक्षण तकनीक',
                te: 'నీటి సంరక్షణ పద్ధతులు',
                ta: 'நீர் பாதுகாப்பு நுட்பங்கள்',
                kn: 'ನೀರಿನ ಸಂರಕ್ಷಣಾ ತಂತ್ರಗಳು',
            },
            description: {
                en: 'Learn effective irrigation and water conservation techniques to maximize crop yield while minimizing water usage.',
                hi: 'पानी के उपयोग को कम करते हुए फसल उपज को अधिकतम करने के लिए प्रभावी सिंचाई और जल संरक्षण तकनीकें सीखें।',
                te: 'నీటి వినియోగాన్ని తగ్గిస్తూనే పంట దిగుబడిని గరిష్టీకరించడానికి సమర్థవంతమైన నీటిపారుదల మరియు నీటి సంరక్షణ పద్ధతులను తెలుసుకోండి.',
                ta: 'நீர் பயன்பாட்டைக் குறைத்து பயிர் விளைச்சலை அதிகரிக்க திறமையான நீர்ப்பாசன மற்றும் நீர் பாதுகாப்பு நுட்பங்களைக் கற்றுக்கொள்ளுங்கள்.',
                kn: 'ನೀರಿನ ಬಳಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುವ ಮೂಲಕ ಬೆಳೆ ಇಳುವರಿಯನ್ನು ಗರಿಷ್ಠಗೊಳಿಸಲು ಪರಿಣಾಮಕಾರಿ ನೀರಾವರಿ ಮತ್ತು ನೀರಿನ ಸಂರಕ್ಷಣಾ ತಂತ್ರಗಳನ್ನು ಕಲಿಯಿರಿ.',
            },
            // thumbnail: 'https://example.com/thumbnails/water-conservation.jpg',
            // placeholderThumbnail: require('../../assets/placeholders/water.png'),
            category: 'irrigation',
            duration: 660, // 11 minutes in seconds
            size: 78 * 1024 * 1024, // 78MB (simulated)
            downloadUrl: 'https://example.com/videos/water-conservation.mp4',
            language: 'en',
            availableLanguages: ['en', 'hi', 'te'],
        },
    ];
};

// Video categories with icons
const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'soil-health', name: 'Soil Health', icon: 'leaf-outline' },
    { id: 'pest-control', name: 'Pest Control', icon: 'bug-outline' },
    { id: 'irrigation', name: 'Irrigation', icon: 'water-outline' },
    { id: 'harvesting', name: 'Harvesting', icon: 'basket-outline' },
    { id: 'storage', name: 'Storage', icon: 'archive-outline' },
];

// Format seconds to MM:SS
const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Format bytes to readable size
const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EducationScreen = ({ navigation }) => {
    const { isOffline } = useOffline();
    const { t, locale, getSupportedLocales } = useLocalization();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videos, setVideos] = useState([]);
    const [downloadedVideos, setDownloadedVideos] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [storageStats, setStorageStats] = useState(null);

    // Load videos on mount
    useEffect(() => {
        loadVideos();
        loadStorageStats();
    }, [locale]);

    // Refresh downloaded videos when screen is focused
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadDownloadedVideos();
            loadStorageStats();
        });

        return unsubscribe;
    }, [navigation]);

    // Load online and offline videos
    const loadVideos = async () => {
        try {
            setLoading(true);

            // Load downloaded videos first
            await loadDownloadedVideos();

            // If online, fetch additional videos
            if (!isOffline) {
                const onlineVideos = await fetchEducationalVideos(locale);

                // Merge with downloaded videos, avoiding duplicates
                const downloadedIds = downloadedVideos.map(v => v.id);
                const newVideos = onlineVideos.filter(v => !downloadedIds.includes(v.id));

                setVideos([...downloadedVideos, ...newVideos]);
            }
        } catch (err) {
            setError(err.message);
            console.error('Failed to load videos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load downloaded videos
    const loadDownloadedVideos = async () => {
        try {
            const videos = await offlineVideoManager.getDownloadedVideos();
            setDownloadedVideos(videos);

            // If offline, these are the only videos we'll show
            if (isOffline) {
                setVideos(videos);
            }
        } catch (err) {
            console.error('Failed to load downloaded videos:', err);
        }
    };

    // Load storage statistics
    const loadStorageStats = async () => {
        try {
            const stats = await offlineVideoManager.getStorageStats();
            setStorageStats(stats);
        } catch (err) {
            console.error('Failed to load storage stats:', err);
        }
    };

    // Handle video download
    const handleDownload = async (video) => {
        try {
            // Check storage availability
            if (video.size > storageStats.available) {
                Alert.alert(
                    'Not Enough Storage',
                    `You need ${formatSize(video.size)} available, but only have ${formatSize(storageStats.available)}. Delete some videos to free up space.`,
                    [{ text: 'OK' }]
                );
                return;
            }

            // Prepare the video for download
            const videoInfo = {
                id: video.id,
                title: video.title[locale] || video.title.en,
                description: video.description[locale] || video.description.en,
                language: locale,
                category: video.category,
                downloadUrl: video.downloadUrl,
                thumbnail: video.thumbnail,
                size: video.size,
                duration: video.duration,
            };

            // Start download
            await offlineVideoManager.downloadVideo(videoInfo);

            // Refresh downloaded videos
            await loadDownloadedVideos();
            await loadStorageStats();

            Alert.alert(
                'Download Complete',
                `"${videoInfo.title}" has been saved for offline viewing.`,
                [{ text: 'OK' }]
            );
        } catch (err) {
            console.error('Download failed:', err);
            Alert.alert('Download Failed', err.message, [{ text: 'OK' }]);
        }
    };

    // Handle video deletion
    const handleDelete = async (videoId) => {
        try {
            await offlineVideoManager.deleteVideo(videoId);
            await loadDownloadedVideos();
            await loadStorageStats();

            Alert.alert(
                'Video Deleted',
                'The video has been removed from offline storage.',
                [{ text: 'OK' }]
            );
        } catch (err) {
            console.error('Deletion failed:', err);
            Alert.alert('Deletion Failed', err.message, [{ text: 'OK' }]);
        }
    };

    // Handle video playback
    const handlePlay = (video) => {
        navigation.navigate('VideoPlayer', { videoId: video.id });
    };

    // Filter videos by category
    const filteredVideos = selectedCategory === 'all'
        ? videos
        : videos.filter(video => video.category === selectedCategory);

    // Render category item
    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <Ionicons
                name={item.icon}
                size={24}
                color={selectedCategory === item.id ? '#FFFFFF' : '#3E7D44'}
            />
            <Text
                style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.selectedCategoryText
                ]}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    // Render video item
    const renderVideoItem = ({ item }) => {
        const isDownloaded = offlineVideoManager.isVideoDownloaded(item.id);
        const title = item.title ? (item.title[locale] || item.title.en) : item.title;
        const description = item.description ? (item.description[locale] || item.description.en) : item.description;

        return (
            <TouchableOpacity
                style={styles.videoCard}
                onPress={() => isDownloaded ? handlePlay(item) : null}
            >
                <View style={styles.thumbnailContainer}>
                    <Image
                        source={
                            isOffline
                                ? item.placeholderThumbnail
                                : { uri: item.thumbnail }
                        }
                        style={styles.thumbnail}
                        defaultSource={item.placeholderThumbnail}
                    />
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                            {formatDuration(item.duration)}
                        </Text>
                    </View>
                </View>

                <View style={styles.videoDetails}>
                    <Text style={styles.videoTitle}>{title}</Text>
                    <Text style={styles.videoDescription} numberOfLines={2}>
                        {description}
                    </Text>

                    <View style={styles.videoMeta}>
                        <Text style={styles.videoSize}>{formatSize(item.size)}</Text>
                        {item.language && (
                            <View style={styles.languageBadge}>
                                <Text style={styles.languageText}>
                                    {item.language.toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.videoActions}>
                        {isDownloaded ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.videoButton, styles.playButton]}
                                    onPress={() => handlePlay(item)}
                                >
                                    <Ionicons name="play" size={16} color="#FFFFFF" />
                                    <Text style={styles.buttonText}>{t('play')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.videoButton, styles.deleteButton]}
                                    onPress={() => handleDelete(item.id)}
                                >
                                    <Ionicons name="trash" size={16} color="#FFFFFF" />
                                    <Text style={styles.buttonText}>{t('delete')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[styles.videoButton, styles.downloadButton]}
                                onPress={() => handleDownload(item)}
                                disabled={isOffline}
                            >
                                <Ionicons name="download" size={16} color="#FFFFFF" />
                                <Text style={styles.buttonText}>
                                    {t('save_for_offline')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('education')}</Text>

                {storageStats && (
                    <View style={styles.storageInfo}>
                        <Text style={styles.storageText}>
                            {formatSize(storageStats.used)} / {formatSize(storageStats.total)}
                        </Text>
                        <View style={styles.storageBarContainer}>
                            <View
                                style={[
                                    styles.storageBar,
                                    { width: `${storageStats.percentUsed}%` }
                                ]}
                            />
                        </View>
                    </View>
                )}
            </View>

            {/* Categories horizontal list */}
            <FlatList
                horizontal
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.id}
                style={styles.categoriesList}
                showsHorizontalScrollIndicator={false}
            />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3E7D44" />
                    <Text style={styles.loadingText}>Loading videos...</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={50} color="#FF5252" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={loadVideos}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && filteredVideos.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Ionicons name="videocam-outline" size={80} color="#CCCCCC" />
                    <Text style={styles.emptyText}>
                        {isOffline
                            ? "You don't have any videos downloaded for offline viewing."
                            : "No videos available in this category yet."}
                    </Text>
                    {isOffline && (
                        <Text style={styles.emptySubtext}>
                            Connect to the internet to browse and download videos.
                        </Text>
                    )}
                </View>
            )}

            {!loading && !error && filteredVideos.length > 0 && (
                <FlatList
                    data={filteredVideos}
                    renderItem={renderVideoItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.videosList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 16,
        backgroundColor: '#3E7D44',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    storageInfo: {
        marginTop: 5,
    },
    storageText: {
        color: '#FFFFFF',
        fontSize: 12,
        marginBottom: 4,
    },
    storageBarContainer: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    storageBar: {
        height: '100%',
        backgroundColor: '#FFFFFF',
    },
    categoriesList: {
        flexGrow: 0,
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 1,
    },
    selectedCategory: {
        backgroundColor: '#3E7D44',
        borderColor: '#3E7D44',
    },
    categoryText: {
        color: '#3E7D44',
        fontWeight: '500',
        marginLeft: 6,
    },
    selectedCategoryText: {
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#666666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#3E7D44',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 16,
        color: '#666666',
        textAlign: 'center',
        fontSize: 16,
    },
    emptySubtext: {
        marginTop: 8,
        color: '#999999',
        textAlign: 'center',
        fontSize: 14,
    },
    videosList: {
        padding: 12,
    },
    videoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    thumbnailContainer: {
        width: 120,
        height: 140,
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
    },
    durationText: {
        color: '#FFFFFF',
        fontSize: 10,
    },
    videoDetails: {
        flex: 1,
        padding: 10,
        justifyContent: 'space-between',
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    videoDescription: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 8,
    },
    videoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    videoSize: {
        fontSize: 11,
        color: '#999999',
        marginRight: 10,
    },
    languageBadge: {
        backgroundColor: '#E0F7FA',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
    },
    languageText: {
        color: '#00796B',
        fontSize: 10,
        fontWeight: 'bold',
    },
    videoActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    videoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        marginLeft: 8,
    },
    downloadButton: {
        backgroundColor: '#3E7D44',
    },
    playButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});

export default EducationScreen; 