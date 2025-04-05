import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { useOffline } from '../context/OfflineContext';
import offlineVideoManager from '../utils/OfflineVideoManager';
import offlineManager from '../utils/OfflineManager';

const SettingsScreen = ({ navigation }) => {
    const { t, locale } = useLocalization();
    const { isOffline } = useOffline();

    const [syncOnCellular, setSyncOnCellular] = useState(false);
    const [autoDownloadOnWifi, setAutoDownloadOnWifi] = useState(false);
    const [highQualityDownloads, setHighQualityDownloads] = useState(false);
    const [storageStats, setStorageStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);

                // Load user preferences from storage
                const savedSyncOnCellular = await offlineManager.getData('SYNC_ON_CELLULAR');
                const savedAutoDownload = await offlineManager.getData('AUTO_DOWNLOAD_WIFI');
                const savedQualitySetting = await offlineManager.getData('HIGH_QUALITY_DOWNLOADS');

                // Set states with saved preferences or defaults
                setSyncOnCellular(savedSyncOnCellular !== null ? savedSyncOnCellular : false);
                setAutoDownloadOnWifi(savedAutoDownload !== null ? savedAutoDownload : false);
                setHighQualityDownloads(savedQualitySetting !== null ? savedQualitySetting : false);

                // Load storage stats
                const stats = await offlineVideoManager.getStorageStats();
                setStorageStats(stats);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Save preference to storage
    const savePreference = async (key, value) => {
        try {
            await offlineManager.storeData(key, value, true);
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
            // Revert the UI state if save fails
            switch (key) {
                case 'SYNC_ON_CELLULAR':
                    setSyncOnCellular(!value);
                    break;
                case 'AUTO_DOWNLOAD_WIFI':
                    setAutoDownloadOnWifi(!value);
                    break;
                case 'HIGH_QUALITY_DOWNLOADS':
                    setHighQualityDownloads(!value);
                    break;
            }

            Alert.alert(
                t('error'),
                t('settings_save_error'),
                [{ text: t('ok') }]
            );
        }
    };

    // Handle toggle switches
    const handleSyncOnCellularToggle = (value) => {
        setSyncOnCellular(value);
        savePreference('SYNC_ON_CELLULAR', value);
    };

    const handleAutoDownloadToggle = (value) => {
        setAutoDownloadOnWifi(value);
        savePreference('AUTO_DOWNLOAD_WIFI', value);
    };

    const handleQualityToggle = (value) => {
        setHighQualityDownloads(value);
        savePreference('HIGH_QUALITY_DOWNLOADS', value);
    };

    // Format storage size
    const formatSize = (bytes) => {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Clear all offline videos
    const handleClearVideos = async () => {
        Alert.alert(
            t('clear_videos_title'),
            t('clear_videos_message'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel'
                },
                {
                    text: t('clear'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);

                            // Get all downloaded videos
                            const videos = await offlineVideoManager.getDownloadedVideos();

                            // Delete each video
                            for (const video of videos) {
                                await offlineVideoManager.deleteVideo(video.id);
                            }

                            // Refresh storage stats
                            const stats = await offlineVideoManager.getStorageStats();
                            setStorageStats(stats);

                            Alert.alert(
                                t('success'),
                                t('clear_videos_success'),
                                [{ text: t('ok') }]
                            );
                        } catch (error) {
                            console.error('Failed to clear videos:', error);
                            Alert.alert(
                                t('error'),
                                t('clear_videos_error'),
                                [{ text: t('ok') }]
                            );
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // Force sync now
    const handleForceSyncNow = async () => {
        if (isOffline) {
            Alert.alert(
                t('sync_error'),
                t('cannot_sync_offline'),
                [{ text: t('ok') }]
            );
            return;
        }

        try {
            setLoading(true);
            await offlineManager.synchronize();

            Alert.alert(
                t('sync_complete'),
                t('sync_success_message'),
                [{ text: t('ok') }]
            );
        } catch (error) {
            console.error('Sync failed:', error);
            Alert.alert(
                t('error'),
                t('sync_error_message'),
                [{ text: t('ok') }]
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3E7D44" />
                    <Text style={styles.loadingText}>{t('loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Language Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('language')}</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => navigation.navigate('LanguageSettings')}
                    >
                        <View style={styles.settingInfo}>
                            <Ionicons name="language" size={22} color="#3E7D44" />
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>{t('app_language')}</Text>
                                <Text style={styles.settingValue}>
                                    {locale === 'en' ? 'English' :
                                        locale === 'hi' ? 'हिन्दी' :
                                            locale === 'te' ? 'తెలుగు' :
                                                locale === 'ta' ? 'தமிழ்' :
                                                    locale === 'kn' ? 'ಕನ್ನಡ' : locale}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="#757575" />
                    </TouchableOpacity>
                </View>

                {/* Offline Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('offline_settings')}</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="cellular" size={22} color="#3E7D44" />
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>{t('sync_on_cellular')}</Text>
                                <Text style={styles.settingDescription}>
                                    {t('sync_on_cellular_desc')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={syncOnCellular}
                            onValueChange={handleSyncOnCellularToggle}
                            trackColor={{ false: '#D1D1D1', true: '#AED581' }}
                            thumbColor={syncOnCellular ? '#3E7D44' : '#F5F5F5'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="wifi" size={22} color="#3E7D44" />
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>{t('auto_download_wifi')}</Text>
                                <Text style={styles.settingDescription}>
                                    {t('auto_download_wifi_desc')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={autoDownloadOnWifi}
                            onValueChange={handleAutoDownloadToggle}
                            trackColor={{ false: '#D1D1D1', true: '#AED581' }}
                            thumbColor={autoDownloadOnWifi ? '#3E7D44' : '#F5F5F5'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="aperture" size={22} color="#3E7D44" />
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>{t('high_quality')}</Text>
                                <Text style={styles.settingDescription}>
                                    {t('high_quality_desc')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={highQualityDownloads}
                            onValueChange={handleQualityToggle}
                            trackColor={{ false: '#D1D1D1', true: '#AED581' }}
                            thumbColor={highQualityDownloads ? '#3E7D44' : '#F5F5F5'}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.settingItemButton}
                        onPress={handleForceSyncNow}
                        disabled={isOffline}
                    >
                        <View style={styles.settingInfo}>
                            <Ionicons name="sync" size={22} color="#3E7D44" />
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>{t('sync_now')}</Text>
                                <Text style={styles.settingDescription}>
                                    {t('sync_now_desc')}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Storage Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('storage')}</Text>

                    {storageStats && (
                        <View style={styles.storageInfoContainer}>
                            <View style={styles.storageHeader}>
                                <Text style={styles.storageTitle}>{t('offline_videos')}</Text>
                                <Text style={styles.storageSize}>
                                    {formatSize(storageStats.used)} / {formatSize(storageStats.total)}
                                </Text>
                            </View>

                            <View style={styles.storageBarContainer}>
                                <View
                                    style={[
                                        styles.storageBar,
                                        { width: `${storageStats.percentUsed}%` }
                                    ]}
                                />
                            </View>

                            <Text style={styles.storageDetail}>
                                {storageStats.videoCount} {storageStats.videoCount === 1 ? t('video') : t('videos')}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.settingItemButton, styles.dangerButton]}
                        onPress={handleClearVideos}
                        disabled={!storageStats || storageStats.videoCount === 0}
                    >
                        <View style={styles.settingInfo}>
                            <Ionicons name="trash" size={22} color="#E53935" />
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.dangerText}>{t('clear_videos')}</Text>
                                <Text style={styles.settingDescription}>
                                    {t('clear_videos_desc')}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('about')}</Text>

                    <View style={styles.aboutContainer}>
                        <Text style={styles.appName}>Agricult</Text>
                        <Text style={styles.appVersion}>v1.0.0</Text>
                        <Text style={styles.appDescription}>
                            {t('app_description')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    section: {
        marginVertical: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        overflow: 'hidden',
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingItemButton: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 12,
        color: '#757575',
    },
    settingValue: {
        fontSize: 14,
        color: '#3E7D44',
        fontWeight: '500',
    },
    dangerButton: {
        borderBottomWidth: 0,
    },
    dangerText: {
        fontSize: 16,
        color: '#E53935',
        marginBottom: 4,
    },
    storageInfoContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    storageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    storageTitle: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    storageSize: {
        fontSize: 14,
        color: '#3E7D44',
        fontWeight: '500',
    },
    storageBarContainer: {
        height: 8,
        backgroundColor: '#EEEEEE',
        borderRadius: 4,
        marginVertical: 8,
        overflow: 'hidden',
    },
    storageBar: {
        height: '100%',
        backgroundColor: '#3E7D44',
        borderRadius: 4,
    },
    storageDetail: {
        fontSize: 14,
        color: '#757575',
    },
    aboutContainer: {
        padding: 16,
        alignItems: 'center',
    },
    appName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3E7D44',
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 12,
    },
    appDescription: {
        fontSize: 14,
        color: '#333333',
        textAlign: 'center',
        lineHeight: 22,
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
});

export default SettingsScreen; 