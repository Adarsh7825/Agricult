import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Animated } from 'react-native';

const CustomButton = ({
    title,
    onPress,
    style,
    textStyle,
    isLoading = false,
    disabled = false,
    primary = true,
    icon = null
}) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

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

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[
                    styles.button,
                    primary ? styles.primaryButton : styles.secondaryButton,
                    disabled && styles.disabledButton,
                    style,
                ]}
                onPress={onPress}
                disabled={disabled || isLoading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.7}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={primary ? "#fff" : "#4CAF50"} />
                ) : (
                    <>
                        {icon && <Text style={styles.iconStyle}>{icon}</Text>}
                        <Text
                            style={[
                                styles.text,
                                primary ? styles.primaryText : styles.secondaryText,
                                disabled && styles.disabledText,
                                textStyle
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
        borderColor: '#CCCCCC',
        elevation: 0,
    },
    text: {
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#4CAF50',
    },
    disabledText: {
        color: '#888888',
    },
    iconStyle: {
        marginRight: 8,
    }
});

export default CustomButton; 