import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import offlineVideoManager from '../utils/OfflineVideoManager';

const { width, height } = Dimensions.get('window');

// Format seconds to MM:SS
const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const VideoPlayerScreen = ({ route, navigation }) => {
    const { videoId } = route.params;
    const { t, locale } = useLocalization();

    const [videoData, setVideoData] = useState(null);
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const videoRef = useRef(null);

    // Load video data on mount
    useEffect(() => {
        const loadVideo = async () => {
            try {
                setLoading(true);

                // Get video data from offline manager
                if (videoId) {
                    const videos = await offlineVideoManager.getDownloadedVideos();
                    const video = videos.find(v => v.id === videoId);

                    if (video) {
                        setVideoData(video);
                    } else {
                        throw new Error('Video not found');
                    }
                } else {
                    throw new Error('No video ID provided');
                }
            } catch (err) {
                console.error('Failed to load video:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadVideo();

        // Lock to portrait on mount
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

        // Cleanup on unmount
        return () => {
            // Always return to portrait when leaving
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
    }, [videoId]);

    // Update the video progress periodically
    useEffect(() => {
        let progressTimer;

        if (status.isPlaying && videoData && !status.isBuffering) {
            progressTimer = setInterval(() => {
                updateVideoProgress();
            }, 5000); // Update every 5 seconds while playing
        }

        return () => {
            if (progressTimer) {
                clearInterval(progressTimer);
            }
        };
    }, [status.isPlaying, videoData, status.isBuffering]);

    // Save progress when exiting
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', async () => {
            if (videoData && status.positionMillis) {
                await updateVideoProgress();
            }
        });

        return unsubscribe;
    }, [navigation, videoData, status]);

    // Handle video playback status updates
    const handlePlaybackStatusUpdate = (newStatus) => {
        setStatus(newStatus);

        // If video finished, mark as completed
        if (newStatus.didJustFinish) {
            markVideoCompleted();
        }
    };

    // Update video progress in storage
    const updateVideoProgress = async () => {
        if (!videoData || !status.positionMillis) return;

        try {
            const progress = (status.positionMillis / (status.durationMillis || 1)) * 100;
            const position = status.positionMillis / 1000; // Convert to seconds

            await offlineVideoManager.updateWatchProgress(
                videoData.id,
                progress,
                position
            );
        } catch (err) {
            console.error('Failed to update watch progress:', err);
        }
    };

    // Mark video as completed
    const markVideoCompleted = async () => {
        if (!videoData) return;

        try {
            await offlineVideoManager.updateWatchProgress(
                videoData.id,
                100, // 100% progress
                videoData.duration // Full duration in seconds
            );
        } catch (err) {
            console.error('Failed to mark video as completed:', err);
        }
    };

    // Toggle fullscreen mode
    const toggleFullscreen = async () => {
        try {
            if (isFullscreen) {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            } else {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            }
            setIsFullscreen(!isFullscreen);
        } catch (err) {
            console.error('Failed to toggle fullscreen:', err);
        }
    };

    // Handle playback
    const handlePlayPause = async () => {
        if (!videoRef.current) return;

        if (status.isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
    };

    // Seek backward 10 seconds
    const seekBackward = async () => {
        if (!videoRef.current || !status.positionMillis) return;

        const newPosition = Math.max(0, status.positionMillis - 10000);
        await videoRef.current.setPositionAsync(newPosition);
    };

    // Seek forward 10 seconds
    const seekForward = async () => {
        if (!videoRef.current || !status.positionMillis || !status.durationMillis) return;

        const newPosition = Math.min(status.durationMillis, status.positionMillis + 10000);
        await videoRef.current.setPositionAsync(newPosition);
    };

    // Calculate video progress percentage
    const getProgressPercentage = () => {
        if (!status.positionMillis || !status.durationMillis) return 0;
        return (status.positionMillis / status.durationMillis) * 100;
    };

    // Render loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3E7D44" />
                    <Text style={styles.loadingText}>{t('loading_video')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Render error state
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={50} color="#FF5252" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>{t('go_back')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[
            styles.container,
            isFullscreen && styles.fullscreenContainer
        ]}>
            <StatusBar hidden={isFullscreen} />

            {/* Video Player */}
            <View style={[
                styles.videoContainer,
                isFullscreen && styles.fullscreenVideoContainer
            ]}>
                {videoData && (
                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={{ uri: videoData.localUri }}
                        resizeMode={isFullscreen ? "cover" : "contain"}
                        useNativeControls={false}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        onLoad={() => {
                            // If there's a saved position, resume from there
                            if (videoData.position && videoRef.current) {
                                videoRef.current.setPositionAsync(videoData.position * 1000);
                            }
                        }}
                        shouldPlay={true}
                    />
                )}

                {/* Custom controls overlay */}
                <View style={styles.controlsOverlay}>
                    <View style={styles.controlsRow}>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={seekBackward}
                        >
                            <Ionicons name="play-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.controlButton, styles.playButton]}
                            onPress={handlePlayPause}
                        >
                            <Ionicons
                                name={status.isPlaying ? "pause" : "play"}
                                size={32}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={seekForward}
                        >
                            <Ionicons name="play-forward" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBackground}>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${getProgressPercentage()}%` }
                                ]}
                            />
                        </View>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>
                                {formatTime(status.positionMillis ? status.positionMillis / 1000 : 0)}
                            </Text>
                            <Text style={styles.timeText}>
                                {formatTime(status.durationMillis ? status.durationMillis / 1000 : 0)}
                            </Text>
                        </View>
                    </View>

                    {/* Fullscreen button */}
                    <TouchableOpacity
                        style={styles.fullscreenButton}
                        onPress={toggleFullscreen}
                    >
                        <Ionicons
                            name={isFullscreen ? "contract" : "expand"}
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Video details (only in portrait mode) */}
            {!isFullscreen && videoData && (
                <ScrollView style={styles.detailsContainer}>
                    <Text style={styles.videoTitle}>{videoData.title}</Text>

                    <View style={styles.metaContainer}>
                        <View style={styles.languageBadge}>
                            <Text style={styles.languageText}>
                                {videoData.language.toUpperCase()}
                            </Text>
                        </View>

                        <Text style={styles.metaText}>
                            {formatTime(videoData.duration || 0)}
                        </Text>
                    </View>

                    <Text style={styles.videoDescription}>
                        {videoData.description}
                    </Text>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    fullscreenContainer: {
        backgroundColor: '#000000',
    },
    videoContainer: {
        width: width,
        height: width * 9 / 16, // 16:9 aspect ratio
        backgroundColor: '#000000',
        position: 'relative',
    },
    fullscreenVideoContainer: {
        width: height,
        height: width,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        padding: 16,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    controlButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(62, 125, 68, 0.8)',
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#3E7D44',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    fullscreenButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    detailsContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    languageBadge: {
        backgroundColor: '#E0F7FA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 12,
    },
    languageText: {
        color: '#00796B',
        fontSize: 12,
        fontWeight: 'bold',
    },
    metaText: {
        fontSize: 14,
        color: '#757575',
    },
    videoDescription: {
        fontSize: 16,
        color: '#505050',
        lineHeight: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        marginTop: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: '#3E7D44',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default VideoPlayerScreen; 