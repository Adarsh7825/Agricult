/**
 * OfflineVideoManager.js
 * 
 * Utility for managing offline videos for agricultural education.
 * Features include:
 * 1. Downloading videos for offline viewing
 * 2. Managing storage space
 * 3. Supporting multiple languages
 * 4. Tracking watched status
 * 5. Categorizing content by farming techniques
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import offlineManager from './OfflineManager';
import { Platform } from 'react-native';

// Constants
const VIDEO_DIRECTORY = FileSystem.documentDirectory ? FileSystem.documentDirectory + 'offlineVideos/' : null;
const VIDEO_METADATA_KEY = 'OFFLINE_VIDEOS_METADATA';
const MAX_STORAGE_SIZE = 500 * 1024 * 1024; // 500MB default limit
const IS_WEB = Platform.OS === 'web';

class OfflineVideoManager {
    constructor() {
        this.initialized = false;
        this.videoMetadata = {};
        this.totalStorageUsed = 0;
        this.maxStorageSize = MAX_STORAGE_SIZE;
        this.isWeb = IS_WEB;
    }

    /**
     * Initialize the video manager by creating directory and loading metadata
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Skip filesystem operations on web
            if (this.isWeb) {
                console.log('OfflineVideoManager running in web mode - limited functionality');
                // Only load metadata from storage, which should be available
                await this.loadMetadata();
                this.initialized = true;
                return;
            }

            // Create videos directory if it doesn't exist
            const dirInfo = await FileSystem.getInfoAsync(VIDEO_DIRECTORY);

            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(VIDEO_DIRECTORY, { intermediates: true });
            }

            // Load metadata from storage
            await this.loadMetadata();

            // Calculate current storage usage
            await this.updateStorageUsage();

            // Load user-defined max storage
            const customMaxStorage = await offlineManager.getData('MAX_VIDEO_STORAGE');
            if (customMaxStorage) {
                this.maxStorageSize = customMaxStorage;
            }

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize OfflineVideoManager:', error);
            // Don't throw on web - allow limited functionality
            if (!this.isWeb) {
                throw error;
            } else {
                this.initialized = true; // Consider it initialized on web even with errors
            }
        }
    }

    /**
     * Load video metadata from storage
     */
    async loadMetadata() {
        try {
            const metadata = await offlineManager.getData(VIDEO_METADATA_KEY);
            this.videoMetadata = metadata || {};
        } catch (error) {
            console.error('Failed to load video metadata:', error);
            this.videoMetadata = {};
        }
    }

    /**
     * Save video metadata to storage
     */
    async saveMetadata() {
        try {
            await offlineManager.storeData(VIDEO_METADATA_KEY, this.videoMetadata);
        } catch (error) {
            console.error('Failed to save video metadata:', error);
        }
    }

    /**
     * Calculate total storage used by offline videos
     */
    async updateStorageUsage() {
        // Skip on web platform
        if (this.isWeb) {
            this.totalStorageUsed = 0;
            return 0;
        }

        try {
            let totalSize = 0;

            for (const videoId in this.videoMetadata) {
                const video = this.videoMetadata[videoId];
                if (video && video.size) {
                    totalSize += video.size;
                } else {
                    // Update size if not available
                    const fileInfo = await FileSystem.getInfoAsync(VIDEO_DIRECTORY + videoId);
                    if (fileInfo.exists) {
                        totalSize += fileInfo.size;

                        // Update metadata with correct size
                        if (this.videoMetadata[videoId]) {
                            this.videoMetadata[videoId].size = fileInfo.size;
                        }
                    }
                }
            }

            this.totalStorageUsed = totalSize;
            return totalSize;
        } catch (error) {
            console.error('Failed to calculate storage usage:', error);
            return 0;
        }
    }

    /**
     * Get available storage space
     */
    getAvailableStorage() {
        return this.maxStorageSize - this.totalStorageUsed;
    }

    /**
     * Set maximum storage size
     * @param {number} sizeInBytes - Maximum storage size in bytes
     */
    async setMaxStorageSize(sizeInBytes) {
        this.maxStorageSize = sizeInBytes;
        await offlineManager.storeData('MAX_VIDEO_STORAGE', sizeInBytes, true);

        // If current usage exceeds new limit, free up space
        if (this.totalStorageUsed > this.maxStorageSize) {
            await this.freeUpSpace(this.totalStorageUsed - this.maxStorageSize);
        }
    }

    /**
     * Free up specified amount of space by removing least recently watched videos
     * @param {number} bytesToFree - Amount of space to free in bytes
     */
    async freeUpSpace(bytesToFree) {
        if (!this.initialized) await this.initialize();

        try {
            // Sort videos by last watched date (oldest first)
            const videos = Object.entries(this.videoMetadata)
                .map(([id, metadata]) => ({ id, ...metadata }))
                .sort((a, b) => a.lastWatched - b.lastWatched);

            let freedSpace = 0;

            for (const video of videos) {
                if (freedSpace >= bytesToFree) break;

                // Delete the video file
                await this.deleteVideo(video.id);

                freedSpace += video.size || 0;
            }

            await this.updateStorageUsage();
            return freedSpace;
        } catch (error) {
            console.error('Failed to free up space:', error);
            throw error;
        }
    }

    /**
     * Download a video for offline viewing
     * @param {Object} videoInfo - Information about the video to download
     * @returns {Promise<Object>} - Metadata of the downloaded video
     */
    async downloadVideo(videoInfo) {
        if (!this.initialized) await this.initialize();

        // Skip actual download on web, but still track metadata
        if (this.isWeb) {
            const {
                id,
                title,
                description,
                language,
                category,
                downloadUrl,
                thumbnail,
                size,
                duration,
            } = videoInfo;

            // Save metadata with web-specific info
            const now = new Date().getTime();
            const metadata = {
                id,
                title,
                description,
                language,
                category,
                thumbnail,
                size: size || 0,
                duration,
                downloadDate: now,
                lastWatched: null,
                watchCount: 0,
                completedWatching: false,
                watchProgress: 0,
                localUri: downloadUrl, // Use original URL on web
                isWebOnly: true,
            };

            this.videoMetadata[id] = metadata;
            await this.saveMetadata();
            return metadata;
        }

        const {
            id,
            title,
            description,
            language,
            category,
            downloadUrl,
            thumbnail,
            size,
            duration,
        } = videoInfo;

        // Check if we have enough space
        if (size > this.getAvailableStorage()) {
            // Try to free up space
            try {
                await this.freeUpSpace(size - this.getAvailableStorage());
            } catch (error) {
                throw new Error('Not enough storage space for this video');
            }
        }

        try {
            // Download file
            const downloadResumable = FileSystem.createDownloadResumable(
                downloadUrl,
                VIDEO_DIRECTORY + id,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    // This could be used to update a progress bar in the UI
                }
            );

            const result = await downloadResumable.downloadAsync();

            if (!result) {
                throw new Error('Download failed');
            }

            // Save metadata
            const now = new Date().getTime();
            const metadata = {
                id,
                title,
                description,
                language,
                category,
                thumbnail,
                size: result.size || size,
                duration,
                downloadDate: now,
                lastWatched: null,
                watchCount: 0,
                completedWatching: false,
                watchProgress: 0,
                localUri: result.uri,
            };

            this.videoMetadata[id] = metadata;
            await this.saveMetadata();
            await this.updateStorageUsage();

            return metadata;
        } catch (error) {
            console.error('Failed to download video:', error);
            throw error;
        }
    }

    /**
     * Delete a downloaded video
     * @param {string} videoId - ID of the video to delete
     * @returns {Promise<boolean>} - Whether deletion was successful
     */
    async deleteVideo(videoId) {
        if (!this.initialized) await this.initialize();

        // On web platform, just delete metadata
        if (this.isWeb) {
            if (this.videoMetadata[videoId]) {
                delete this.videoMetadata[videoId];
                await this.saveMetadata();
                return true;
            }
            return false;
        }

        try {
            const videoPath = VIDEO_DIRECTORY + videoId;
            const fileInfo = await FileSystem.getInfoAsync(videoPath);

            if (fileInfo.exists) {
                await FileSystem.deleteAsync(videoPath);
            }

            // Remove from metadata
            if (this.videoMetadata[videoId]) {
                delete this.videoMetadata[videoId];
                await this.saveMetadata();
            }

            return true;
        } catch (error) {
            console.error('Failed to delete video:', error);
            return false;
        }
    }

    /**
     * Get all downloaded videos
     * @param {Object} filters - Optional filters for language, category, etc.
     * @returns {Array} - Array of video metadata objects
     */
    async getDownloadedVideos(filters = {}) {
        if (!this.initialized) await this.initialize();

        let videos = Object.values(this.videoMetadata);

        // Apply filters
        if (filters.language) {
            videos = videos.filter(video => video.language === filters.language);
        }

        if (filters.category) {
            videos = videos.filter(video => video.category === filters.category);
        }

        if (filters.completed !== undefined) {
            videos = videos.filter(video => video.completedWatching === filters.completed);
        }

        // Sort by date or other criteria
        if (filters.sortBy === 'recent') {
            videos.sort((a, b) => (b.lastWatched || b.downloadDate) - (a.lastWatched || a.downloadDate));
        } else if (filters.sortBy === 'title') {
            videos.sort((a, b) => a.title.localeCompare(b.title));
        }

        return videos;
    }

    /**
     * Update video watch progress
     * @param {string} videoId - ID of the video
     * @param {number} progress - Progress as a percentage (0-100)
     * @param {number} position - Current position in seconds
     */
    async updateWatchProgress(videoId, progress, position) {
        if (!this.initialized) await this.initialize();

        if (!this.videoMetadata[videoId]) {
            throw new Error(`Video ${videoId} not found in metadata`);
        }

        try {
            const video = this.videoMetadata[videoId];
            const now = new Date().getTime();

            // Update metadata
            video.lastWatched = now;
            video.watchProgress = progress;
            video.position = position;

            // Mark as completed if progress is near 100%
            if (progress >= 90 && !video.completedWatching) {
                video.completedWatching = true;
                video.watchCount++;
            }

            await this.saveMetadata();
        } catch (error) {
            console.error(`Failed to update watch progress for ${videoId}:`, error);
            throw error;
        }
    }

    /**
     * Get recommendations based on watch history
     * @param {string} language - Preferred language
     * @returns {Array} - Array of recommended video IDs
     */
    async getRecommendations(language) {
        if (!this.initialized) await this.initialize();

        // This would normally be a more sophisticated algorithm
        // For MVP, we just recommend unwatched videos in the user's language
        try {
            const videos = Object.values(this.videoMetadata);

            // First, filter by language and unwatched
            let recommendations = videos.filter(video =>
                video.language === language &&
                (!video.completedWatching || video.watchCount === 0)
            );

            // If we have too few recommendations, include videos from other languages
            if (recommendations.length < 3) {
                const otherVideos = videos.filter(video =>
                    video.language !== language &&
                    (!video.completedWatching || video.watchCount === 0)
                );

                recommendations = [...recommendations, ...otherVideos];
            }

            // Sort by category frequency in watched videos
            const watchedVideos = videos.filter(v => v.watchCount > 0);
            const categoryCount = {};

            watchedVideos.forEach(video => {
                categoryCount[video.category] = (categoryCount[video.category] || 0) + 1;
            });

            recommendations.sort((a, b) =>
                (categoryCount[b.category] || 0) - (categoryCount[a.category] || 0)
            );

            return recommendations.slice(0, 5).map(video => video.id);
        } catch (error) {
            console.error('Failed to get recommendations:', error);
            return [];
        }
    }

    /**
     * Check if a video is downloaded
     * @param {string} videoId - ID of the video
     * @returns {boolean} - Whether the video is downloaded
     */
    isVideoDownloaded(videoId) {
        // On web, check if we have metadata for this video
        if (this.isWeb) {
            return Boolean(this.videoMetadata[videoId]);
        }

        return Boolean(this.videoMetadata[videoId] && this.videoMetadata[videoId].localUri);
    }

    /**
     * Get storage statistics
     * @returns {Object} - Storage statistics
     */
    async getStorageStats() {
        if (!this.initialized) await this.initialize();

        await this.updateStorageUsage();

        return {
            used: this.totalStorageUsed,
            total: this.maxStorageSize,
            available: this.getAvailableStorage(),
            videoCount: Object.keys(this.videoMetadata).length,
            percentUsed: (this.totalStorageUsed / this.maxStorageSize) * 100,
        };
    }
}

// Create singleton instance
const offlineVideoManager = new OfflineVideoManager();

// Initialize when imported
(async () => {
    try {
        await offlineVideoManager.initialize();
    } catch (error) {
        console.error('Failed to initialize OfflineVideoManager on import:', error);
    }
})();

export default offlineVideoManager; 