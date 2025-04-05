import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AnimatedCard = ({
    title,
    description,
    iconName,
    backgroundColor = '#4CAF50',
    route,
    imageSrc = null
}) => {
    const navigation = useNavigation();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        if (route) {
            navigation.navigate(route);
        }
    };

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                    backgroundColor
                },
            ]}
        >
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        {imageSrc ? (
                            <Image source={imageSrc} style={styles.image} />
                        ) : (
                            <MaterialCommunityIcons name={iconName} size={28} color="#FFFFFF" />
                        )}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.description}>{description}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" style={styles.arrowIcon} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
        overflow: 'hidden',
    },
    card: {
        width: '100%',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    arrowIcon: {
        marginLeft: 8,
    },
});

export default AnimatedCard; 