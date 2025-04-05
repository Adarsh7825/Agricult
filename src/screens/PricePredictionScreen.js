import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import CustomButton from '../components/CustomButton';

// Sample data for price prediction
const COMMODITIES = [
    { id: 'potato', name: 'Potato' },
    { id: 'onion', name: 'Onion' },
    { id: 'tomato', name: 'Tomato' },
    { id: 'wheat', name: 'Wheat' },
    { id: 'rice', name: 'Rice' },
    { id: 'soybean', name: 'Soybean' },
];

const TIME_PERIODS = [
    { id: '1w', name: '1 Week' },
    { id: '1m', name: '1 Month' },
    { id: '3m', name: '3 Months' },
    { id: '6m', name: '6 Months' },
];

// Sample price data
const priceData = {
    potato: {
        current: 2500,
        unit: 'per quintal',
        data: {
            '1w': {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        data: [2400, 2450, 2500, 2480, 2550, 2600, 2500],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    },
                ],
                prediction: [2520, 2550, 2600],
                trend: 'up',
                confidence: 75,
            },
            '1m': {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        data: [2300, 2450, 2500, 2500],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    },
                ],
                prediction: [2550, 2600, 2650, 2700],
                trend: 'up',
                confidence: 82,
            },
            '3m': {
                labels: ['Jan', 'Feb', 'Mar'],
                datasets: [
                    {
                        data: [2200, 2350, 2500],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    },
                ],
                prediction: [2600, 2700, 2800],
                trend: 'up',
                confidence: 65,
            },
            '6m': {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        data: [2000, 2100, 2300, 2400, 2450, 2500],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    },
                ],
                prediction: [2550, 2600, 2650, 2700, 2750, 2800],
                trend: 'up',
                confidence: 60,
            },
        },
    },
    onion: {
        current: 3500,
        unit: 'per quintal',
        data: {
            '1w': {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        data: [3600, 3550, 3500, 3450, 3500, 3550, 3500],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    },
                ],
                prediction: [3450, 3400, 3350],
                trend: 'down',
                confidence: 70,
            },
            '1m': {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        data: [3700, 3650, 3550, 3500],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    },
                ],
                prediction: [3450, 3400, 3350, 3300],
                trend: 'down',
                confidence: 78,
            },
            '3m': {
                labels: ['Jan', 'Feb', 'Mar'],
                datasets: [
                    {
                        data: [3800, 3650, 3500],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    },
                ],
                prediction: [3400, 3300, 3200],
                trend: 'down',
                confidence: 68,
            },
            '6m': {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        data: [4000, 3900, 3800, 3700, 3600, 3500],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    },
                ],
                prediction: [3400, 3300, 3200, 3300, 3400, 3500],
                trend: 'stable',
                confidence: 55,
            },
        },
    },
};

const PricePredictionScreen = () => {
    const [selectedCommodity, setSelectedCommodity] = useState('potato');
    const [selectedPeriod, setSelectedPeriod] = useState('1m');
    const [isLoading, setIsLoading] = useState(false);

    const { width } = Dimensions.get('window');

    // Get current commodity data
    const commodity = priceData[selectedCommodity] || priceData.potato;
    const periodData = commodity.data[selectedPeriod] || commodity.data['1m'];

    // Handle commodity change
    const handleCommodityChange = (commodityId) => {
        setIsLoading(true);
        setSelectedCommodity(commodityId);

        // Simulate loading
        setTimeout(() => {
            setIsLoading(false);
        }, 800);
    };

    // Handle period change
    const handlePeriodChange = (periodId) => {
        setIsLoading(true);
        setSelectedPeriod(periodId);

        // Simulate loading
        setTimeout(() => {
            setIsLoading(false);
        }, 600);
    };

    // Chart configuration
    const chartConfig = {
        backgroundGradientFrom: '#FFFFFF',
        backgroundGradientTo: '#FFFFFF',
        color: (opacity = 1) => `rgba(46, 64, 83, ${opacity})`,
        strokeWidth: 2,
        decimalPlaces: 0,
        style: {
            borderRadius: 16,
        },
    };

    // Get trend icon and color
    const getTrendIcon = () => {
        if (periodData.trend === 'up') {
            return {
                icon: 'trending-up',
                color: '#4CAF50',
                text: 'Rising',
            };
        } else if (periodData.trend === 'down') {
            return {
                icon: 'trending-down',
                color: '#F44336',
                text: 'Falling',
            };
        } else {
            return {
                icon: 'trending-neutral',
                color: '#FF9800',
                text: 'Stable',
            };
        }
    };

    const trend = getTrendIcon();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Price Prediction</Text>
                    <Text style={styles.subtitle}>
                        Make better selling decisions with AI-powered price forecasts
                    </Text>
                </View>

                {/* Commodity Selector */}
                <View style={styles.selectorContainer}>
                    <Text style={styles.selectorTitle}>Select Commodity</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.commoditiesContainer}
                    >
                        {COMMODITIES.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.commodityButton,
                                    selectedCommodity === item.id && styles.selectedCommodityButton,
                                ]}
                                onPress={() => handleCommodityChange(item.id)}
                            >
                                <Text
                                    style={[
                                        styles.commodityButtonText,
                                        selectedCommodity === item.id && styles.selectedCommodityButtonText,
                                    ]}
                                >
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Current Price Card */}
                <View style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                        <Text style={styles.priceTitle}>Current Price</Text>
                        <View style={styles.priceValue}>
                            <Text style={styles.priceAmount}>₹{commodity.current}</Text>
                            <Text style={styles.priceUnit}>{commodity.unit}</Text>
                        </View>
                    </View>

                    {/* Market Trend */}
                    <View style={styles.trendContainer}>
                        <MaterialCommunityIcons name={trend.icon} size={20} color={trend.color} />
                        <Text style={[styles.trendText, { color: trend.color }]}>
                            {trend.text} trend with {periodData.confidence}% confidence
                        </Text>
                    </View>
                </View>

                {/* Time Period Selector */}
                <View style={styles.periodSelectorContainer}>
                    <Text style={styles.selectorTitle}>Time Period</Text>
                    <View style={styles.periodButtonsContainer}>
                        {TIME_PERIODS.map((period) => (
                            <TouchableOpacity
                                key={period.id}
                                style={[
                                    styles.periodButton,
                                    selectedPeriod === period.id && styles.selectedPeriodButton,
                                ]}
                                onPress={() => handlePeriodChange(period.id)}
                            >
                                <Text
                                    style={[
                                        styles.periodButtonText,
                                        selectedPeriod === period.id && styles.selectedPeriodButtonText,
                                    ]}
                                >
                                    {period.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Price Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Price Trend</Text>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
                            <Text style={styles.loadingText}>Loading data...</Text>
                        </View>
                    ) : (
                        <>
                            <LineChart
                                data={periodData}
                                width={width - 32}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                            />

                            <View style={styles.legendContainer}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                                    <Text style={styles.legendText}>Historical</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                                    <Text style={styles.legendText}>Predicted</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Recommendation Card */}
                <View style={styles.recommendationCard}>
                    <Text style={styles.recommendationTitle}>AI Recommendation</Text>
                    <Text style={styles.recommendationText}>
                        {periodData.trend === 'up'
                            ? 'Consider holding your stock for the next few weeks as prices are expected to rise.'
                            : periodData.trend === 'down'
                                ? 'Consider selling soon as prices are expected to decrease in the coming weeks.'
                                : 'Prices seem stable for the upcoming period. Monitor the market for any changes.'}
                    </Text>

                    <View style={styles.actionButtonsContainer}>
                        <CustomButton
                            title="View Markets"
                            onPress={() => { }}
                            style={styles.actionButton}
                        />
                        <CustomButton
                            title="Set Price Alert"
                            onPress={() => { }}
                            primary={false}
                            style={styles.actionButton}
                        />
                    </View>
                </View>
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
    selectorContainer: {
        marginTop: 16,
        marginHorizontal: 16,
    },
    selectorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E4053',
        marginBottom: 8,
    },
    commoditiesContainer: {
        paddingBottom: 8,
    },
    commodityButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedCommodityButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    commodityButtonText: {
        fontSize: 14,
        color: '#2E4053',
    },
    selectedCommodityButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    priceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        margin: 16,
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
    priceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceTitle: {
        fontSize: 16,
        color: '#2E4053',
    },
    priceValue: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E4053',
    },
    priceUnit: {
        fontSize: 14,
        color: '#7E8C8D',
        marginLeft: 4,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    trendText: {
        fontSize: 14,
        marginLeft: 8,
    },
    periodSelectorContainer: {
        marginHorizontal: 16,
        marginBottom: 8,
    },
    periodButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    periodButton: {
        flex: 1,
        paddingVertical: 8,
        marginHorizontal: 4,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedPeriodButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    periodButtonText: {
        fontSize: 14,
        color: '#2E4053',
    },
    selectedPeriodButtonText: {
        color: '#FFFFFF',
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        margin: 16,
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
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E4053',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 8,
        marginVertical: 8,
    },
    loadingContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#7E8C8D',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#7E8C8D',
    },
    recommendationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        margin: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        marginBottom: 24,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E4053',
        marginBottom: 8,
    },
    recommendationText: {
        fontSize: 14,
        color: '#2E4053',
        lineHeight: 20,
        marginBottom: 16,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
});

export default PricePredictionScreen; 