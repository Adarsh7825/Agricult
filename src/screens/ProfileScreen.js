import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';

// Import AppImages from utils
import AppImages from '../utils/AppImages';

const ProfileScreen = ({ navigation }) => {
    // Sample user data
    const user = {
        name: 'Rakesh Patil',
        location: 'Nashik, Maharashtra',
        joinedDate: 'March 2023',
        avatar: AppImages.icon,
        crops: ['Potato', 'Onion', 'Wheat'],
        landSize: '5 acres',
        listings: 2,
        phoneNumber: '+91 9876543210',
    };

    // Sample stats
    const stats = [
        {
            id: 'listings',
            label: 'Active Listings',
            value: user.listings,
            icon: 'tag',
        },
        {
            id: 'acres',
            label: 'Land Size',
            value: user.landSize,
            icon: 'pine-tree',
        },
        {
            id: 'crops',
            label: 'Crops',
            value: user.crops.length,
            icon: 'sprout',
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView style={styles.container}>
                {/* Header with back button */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#2E4053" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity style={styles.editButton}>
                        <MaterialCommunityIcons name="pencil" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                </View>

                {/* User Info Card */}
                <View style={styles.userCard}>
                    <Image source={user.avatar} style={styles.avatar} />
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#7E8C8D" />
                        <Text style={styles.locationText}>{user.location}</Text>
                    </View>
                    <Text style={styles.joinedText}>Joined {user.joinedDate}</Text>

                    <View style={styles.divider} />

                    {/* User Stats */}
                    <View style={styles.statsContainer}>
                        {stats.map((stat) => (
                            <View key={stat.id} style={styles.statItem}>
                                <View style={styles.statIconContainer}>
                                    <MaterialCommunityIcons name={stat.icon} size={20} color="#4CAF50" />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.contactItem}>
                        <MaterialCommunityIcons name="phone" size={20} color="#4CAF50" />
                        <Text style={styles.contactText}>{user.phoneNumber}</Text>
                    </View>
                </View>

                {/* Crops Information */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>My Crops</Text>
                    <View style={styles.cropsContainer}>
                        {user.crops.map((crop, index) => (
                            <View key={index} style={styles.cropTag}>
                                <MaterialCommunityIcons name="leaf" size={14} color="#4CAF50" />
                                <Text style={styles.cropName}>{crop}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsCard}>
                    <TouchableOpacity style={styles.actionItem}>
                        <MaterialCommunityIcons name="history" size={22} color="#2E4053" />
                        <Text style={styles.actionText}>Transaction History</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#7E8C8D" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <MaterialCommunityIcons name="cog" size={22} color="#2E4053" />
                        <Text style={styles.actionText}>Settings</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#7E8C8D" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <MaterialCommunityIcons name="help-circle" size={22} color="#2E4053" />
                        <Text style={styles.actionText}>Help & Support</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#7E8C8D" />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <CustomButton
                    title="Logout"
                    onPress={() => { }}
                    primary={false}
                    icon={<MaterialCommunityIcons name="logout" size={18} color="#F44336" />}
                    style={styles.logoutButton}
                    textStyle={{ color: '#F44336' }}
                />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E4053',
    },
    editButton: {
        padding: 4,
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        margin: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E4053',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#7E8C8D',
        marginLeft: 4,
    },
    joinedText: {
        fontSize: 12,
        color: '#7E8C8D',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E4053',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#7E8C8D',
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E4053',
        marginBottom: 12,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactText: {
        fontSize: 16,
        color: '#2E4053',
        marginLeft: 8,
    },
    cropsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cropTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    cropName: {
        fontSize: 14,
        color: '#4CAF50',
        marginLeft: 4,
    },
    actionsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: '#2E4053',
        marginLeft: 12,
    },
    logoutButton: {
        marginHorizontal: 16,
        marginVertical: 20,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderColor: '#F44336',
    },
});

export default ProfileScreen; 