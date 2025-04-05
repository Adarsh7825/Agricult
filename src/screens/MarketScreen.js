import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    FlatList,
    Animated,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { useOffline } from '../context/OfflineContext';
import { useLocalization } from '../context/LocalizationContext';
import offlineManager from '../utils/OfflineManager';

// Import AppImages from utils
import AppImages from '../utils/AppImages';

// Create a component for product image with offline-first approach
const ProductImage = ({ source, category }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Get appropriate icon based on product category for fallback
    const getCategoryIcon = () => {
        switch (category?.toLowerCase()) {
            case 'vegetables': return 'food-apple';
            case 'fruits': return 'fruit-cherries';
            case 'grains': return 'barley';
            case 'dairy': return 'cup';
            default: return 'leaf';
        }
    };

    return (
        <View style={styles.imageContainer}>
            {!isLoaded && (
                <View style={styles.imagePlaceholderOverlay}>
                    <MaterialCommunityIcons name={getCategoryIcon()} size={30} color="#4CAF50" />
                </View>
            )}
            <Image
                source={hasError ? AppImages.placeholder : source}
                style={styles.productImage}
                resizeMode="cover"
                onError={() => setHasError(true)}
                onLoad={() => setIsLoaded(true)}
            />
            {hasError && (
                <View style={styles.imagePlaceholderOverlay}>
                    <MaterialCommunityIcons name={getCategoryIcon()} size={30} color="#4CAF50" />
                </View>
            )}
        </View>
    );
};

// Offline-first sample data for products
const PRODUCTS = [
    {
        id: '1',
        name: 'Organic Potatoes',
        price: '₹25/kg',
        location: 'Nashik, Maharashtra',
        distance: '15 km',
        seller: 'Ramesh Patel',
        rating: 4.8,
        image: AppImages.potato,
        quantity: '500 kg',
        category: 'Vegetables',
        lastUpdated: '2 days ago',
        pricesByLocation: {
            'Delhi': 28,
            'Mumbai': 25,
            'Bangalore': 32,
            'Chennai': 30,
            'Hyderabad': 27,
            'Kolkata': 29
        },
        unit: 'kg',
        trend: 'down',
        trendPercentage: 3,
        description: 'Fresh organic potatoes grown using natural farming techniques. No pesticides used. Ideal for making various dishes.'
    },
    {
        id: '2',
        name: 'Fresh Tomatoes',
        price: '₹30/kg',
        location: 'Pune, Maharashtra',
        distance: '22 km',
        seller: 'Suresh Kumar',
        rating: 4.5,
        image: AppImages.tomato,
        quantity: '200 kg',
        category: 'Vegetables',
        lastUpdated: '1 day ago',
        pricesByLocation: {
            'Delhi': 35,
            'Mumbai': 30,
            'Bangalore': 38,
            'Chennai': 32,
            'Hyderabad': 34,
            'Kolkata': 33
        },
        unit: 'kg',
        trend: 'up',
        trendPercentage: 5,
        description: 'Juicy and fresh tomatoes harvested this week. Perfect balance of sweetness and acidity.'
    },
    {
        id: '3',
        name: 'Wheat',
        price: '₹2200/quintal',
        location: 'Ahmednagar, Maharashtra',
        distance: '35 km',
        seller: 'Ganesh Patil',
        rating: 4.9,
        image: AppImages.wheat,
        quantity: '20 quintals',
        category: 'Grains',
        lastUpdated: '3 days ago',
        pricesByLocation: {
            'Delhi': 2300,
            'Mumbai': 2200,
            'Bangalore': 2400,
            'Chennai': 2350,
            'Hyderabad': 2250,
            'Kolkata': 2280
        },
        unit: 'quintal',
        trend: 'stable',
        trendPercentage: 0,
        description: 'High-quality wheat with excellent protein content. Ideal for making chapatis, bread, and other wheat products.'
    },
    {
        id: '4',
        name: 'Rice (Basmati)',
        price: '₹3500/quintal',
        location: 'Kolhapur, Maharashtra',
        distance: '42 km',
        seller: 'Vijay Singh',
        rating: 4.7,
        image: AppImages.rice,
        quantity: '15 quintals',
        category: 'Grains',
        lastUpdated: '5 days ago',
        pricesByLocation: {
            'Delhi': 3600,
            'Mumbai': 3500,
            'Bangalore': 3700,
            'Chennai': 3650,
            'Hyderabad': 3550,
            'Kolkata': 3480
        },
        unit: 'quintal',
        trend: 'up',
        trendPercentage: 2,
        description: 'Premium quality basmati rice with long grains and aromatic flavor. Aged for optimal taste.'
    },
    {
        id: '5',
        name: 'Fresh Apples',
        price: '₹150/kg',
        location: 'Raigad, Maharashtra',
        distance: '50 km',
        seller: 'Ajay Sharma',
        rating: 4.6,
        image: AppImages.apple,
        quantity: '300 kg',
        category: 'Fruits',
        lastUpdated: '1 day ago',
        pricesByLocation: {
            'Delhi': 160,
            'Mumbai': 150,
            'Bangalore': 170,
            'Chennai': 165,
            'Hyderabad': 155,
            'Kolkata': 158
        },
        unit: 'kg',
        trend: 'down',
        trendPercentage: 1,
        description: 'Sweet and juicy apples picked at peak ripeness. Rich in flavor and nutrients.'
    },
];

// Categories for filter - simplified for low-end devices
const CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'grains', name: 'Grains' },
    { id: 'dairy', name: 'Dairy' },
];

const MarketScreen = ({ navigation }) => {
    const { isOffline } = useOffline();
    const { t, locale } = useLocalization();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [showLocationFilter, setShowLocationFilter] = useState(false);
    const [activeTab, setActiveTab] = useState('buy');

    // Animation for tab switching - simple animation for low-end devices
    const tabAnimValue = useRef(new Animated.Value(0)).current;

    // Handle tab change with animation
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        Animated.timing(tabAnimValue, {
            toValue: tab === 'buy' ? 0 : 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    // Calculate tab indicator position based on animation value
    const tabIndicatorPosition = tabAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%'],
    });

    // Load products on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter products when search query, category, or location changes
    useEffect(() => {
        filterProducts();
    }, [searchQuery, selectedCategory, selectedLocation, products]);

    // Fetch products from storage or sample data
    const fetchProducts = async () => {
        try {
            setLoading(true);

            // Try to get cached products first
            const cachedProducts = await offlineManager.getData('CACHED_PRODUCTS');
            const cachedTime = await offlineManager.getData('PRODUCTS_CACHE_TIME');

            if (isOffline) {
                // Use cached data if available, otherwise use sample data
                if (cachedProducts) {
                    setProducts(cachedProducts);
                } else {
                    setProducts(PRODUCTS);
                }
            } else {
                // When online, check if cache needs refresh (24 hours)
                const cacheExpired = !cachedTime || (Date.now() - cachedTime > 24 * 60 * 60 * 1000);

                if (cacheExpired) {
                    // In a real app, fetch from API
                    // For MVP, we'll simulate API delay and use sample data
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    setProducts(PRODUCTS);

                    // Cache the fetched products
                    await offlineManager.storeData('CACHED_PRODUCTS', PRODUCTS, true);
                    await offlineManager.storeData('PRODUCTS_CACHE_TIME', Date.now(), true);
                } else {
                    // Use cached data if it's still fresh
                    setProducts(cachedProducts || PRODUCTS);
                }
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            // Fallback to sample data on error
            setProducts(PRODUCTS);
        } finally {
            setLoading(false);
        }
    };

    // Filter products based on search query, category, and location
    const filterProducts = () => {
        let filtered = [...products];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (selectedCategory !== 'All Categories') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // We don't filter by location, but highlight the selected location's price

        setFilteredProducts(filtered);
    };

    // Get product price based on selected location
    const getProductPrice = (product) => {
        // Check if product or pricesByLocation is null/undefined
        if (!product || !product.pricesByLocation) {
            return 0; // Return default price if no location data
        }

        if (selectedLocation === 'All Locations') {
            // For "All Locations", calculate average price
            const prices = Object.values(product.pricesByLocation);
            const sum = prices.reduce((total, price) => total + price, 0);
            return sum / prices.length || 0; // Return 0 if array is empty
        } else {
            // Return price for selected location or default to 0
            return product.pricesByLocation[selectedLocation] || 0;
        }
    };

    // Open product detail modal
    const openProductDetail = (product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    // Get trend icon based on trend direction
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <Ionicons name="arrow-up" size={16} color="#F44336" />;
            case 'down':
                return <Ionicons name="arrow-down" size={16} color="#4CAF50" />;
            default:
                return <Ionicons name="remove" size={16} color="#757575" />;
        }
    };

    // Get trend text color based on trend direction
    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up':
                return styles.trendUp;
            case 'down':
                return styles.trendDown;
            default:
                return styles.trendStable;
        }
    };

    // Format price with proper currency
    const formatPrice = (price) => {
        return `₹${price.toFixed(2)}`;
    };

    // Render product item
    const renderProductItem = ({ item }) => {
        const price = getProductPrice(item);

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => openProductDetail(item)}
            >
                <Image source={item.image} style={styles.productImage} />

                <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productCategory}>{item.category}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatPrice(price)}/{item.unit}</Text>

                        <View style={styles.trendContainer}>
                            {getTrendIcon(item.trend)}
                            <Text style={[styles.trendText, getTrendColor(item.trend)]}>
                                {item.trendPercentage}%
                            </Text>
                        </View>
                    </View>

                    {selectedLocation !== 'All Locations' && (
                        <Text style={styles.locationPrice}>
                            Price in {selectedLocation}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Render product detail modal
    const renderProductDetailModal = () => {
        if (!selectedProduct) return null;

        return (
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#333333" />
                        </TouchableOpacity>

                        <ScrollView>
                            <Image source={selectedProduct.image} style={styles.modalImage} />

                            <View style={styles.modalDetails}>
                                <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                                <Text style={styles.modalProductCategory}>{selectedProduct.category}</Text>

                                <Text style={styles.modalDescription}>
                                    {selectedProduct.description}
                                </Text>

                                <View style={styles.pricesByLocationContainer}>
                                    <Text style={styles.pricesByLocationTitle}>
                                        Prices by Location:
                                    </Text>

                                    {Object.entries(selectedProduct.pricesByLocation).map(([location, price]) => (
                                        <View key={location} style={styles.locationPriceRow}>
                                            <Text style={styles.locationName}>{location}</Text>
                                            <Text style={styles.locationPriceValue}>
                                                {formatPrice(price)}/{selectedProduct.unit}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.modalTrendContainer}>
                                    <Text style={styles.trendTitle}>Price Trend: </Text>
                                    {getTrendIcon(selectedProduct.trend)}
                                    <Text style={[styles.modalTrendText, getTrendColor(selectedProduct.trend)]}>
                                        {selectedProduct.trendPercentage}% {selectedProduct.trend === 'up' ? 'increase' : selectedProduct.trend === 'down' ? 'decrease' : 'stable'}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    };

    // Render createListing section for sell tab
    const renderCreateListingSection = () => {
        return (
            <View style={styles.createListingContainer}>
                <Text style={styles.sectionTitle}>Sell Your Produce</Text>
                <Text style={styles.sectionSubtitle}>
                    Create a listing to sell your agricultural products directly to buyers
                </Text>

                <CustomButton
                    title="Create New Listing"
                    onPress={() => navigation.navigate('CreateListing')}
                    style={styles.createListingButton}
                />

                <View style={styles.myListingsHeader}>
                    <Text style={styles.myListingsTitle}>My Listings</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.emptyListingsText}>
                    You don't have any active listings yet
                </Text>

                {isOffline && (
                    <View style={styles.offlineNotice}>
                        <MaterialCommunityIcons name="wifi-off" size={20} color="#F57C00" />
                        <Text style={styles.offlineText}>
                            Creating new listings requires an internet connection. Your drafts will be saved locally.
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    // Render category filter
    const renderCategoryFilter = () => (
        <View style={styles.filterContainer}>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => {
                    setShowCategoryFilter(!showCategoryFilter);
                    setShowLocationFilter(false);
                }}
            >
                <Text style={styles.filterButtonText}>
                    {selectedCategory} <Ionicons name="chevron-down" size={14} color="#333333" />
                </Text>
            </TouchableOpacity>

            {showCategoryFilter && (
                <View style={styles.filterDropdown}>
                    {CATEGORIES.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.filterOption,
                                selectedCategory === category.id && styles.selectedFilterOption
                            ]}
                            onPress={() => {
                                setSelectedCategory(category.id);
                                setShowCategoryFilter(false);
                            }}
                        >
                            <Text style={[
                                styles.filterOptionText,
                                selectedCategory === category.id && styles.selectedFilterOptionText
                            ]}>
                                {category.name}
                            </Text>
                            {selectedCategory === category.id && (
                                <Ionicons name="checkmark" size={18} color="#3E7D44" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    // Render location filter
    const renderLocationFilter = () => (
        <View style={styles.filterContainer}>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => {
                    setShowLocationFilter(!showLocationFilter);
                    setShowCategoryFilter(false);
                }}
            >
                <Text style={styles.filterButtonText}>
                    {selectedLocation} <Ionicons name="chevron-down" size={14} color="#333333" />
                </Text>
            </TouchableOpacity>

            {showLocationFilter && (
                <View style={styles.filterDropdown}>
                    {['All Locations', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'].map(location => (
                        <TouchableOpacity
                            key={location}
                            style={[
                                styles.filterOption,
                                selectedLocation === location && styles.selectedFilterOption
                            ]}
                            onPress={() => {
                                setSelectedLocation(location);
                                setShowLocationFilter(false);
                            }}
                        >
                            <Text style={[
                                styles.filterOptionText,
                                selectedLocation === location && styles.selectedFilterOptionText
                            ]}>
                                {location}
                            </Text>
                            {selectedLocation === location && (
                                <Ionicons name="checkmark" size={18} color="#3E7D44" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.container}>
                {/* Header with Tabs */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Agri Market</Text>
                        {isOffline && (
                            <View style={styles.offlineIndicator}>
                                <MaterialCommunityIcons name="wifi-off" size={16} color="#FFF" />
                                <Text style={styles.offlineIndicatorText}>Offline</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={styles.tab}
                            onPress={() => handleTabChange('buy')}
                        >
                            <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
                                Buy
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.tab}
                            onPress={() => handleTabChange('sell')}
                        >
                            <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
                                Sell
                            </Text>
                        </TouchableOpacity>

                        <Animated.View
                            style={[
                                styles.tabIndicator,
                                {
                                    left: tabIndicatorPosition,
                                },
                            ]}
                        />
                    </View>
                </View>

                {activeTab === 'buy' ? (
                    <>
                        {/* Search Bar - simplified for low-end devices */}
                        <View style={styles.searchContainer}>
                            <MaterialCommunityIcons name="magnify" size={24} color="#7E8C8D" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search products, location..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery !== '' && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <MaterialCommunityIcons name="close" size={20} color="#7E8C8D" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Category Filters - limited categories for performance */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesContainer}
                        >
                            {renderCategoryFilter()}
                        </ScrollView>

                        {/* Location Filters - limited locations for performance */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.locationsContainer}
                        >
                            {renderLocationFilter()}
                        </ScrollView>

                        {/* Loading Indicator */}
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#4CAF50" />
                                <Text style={styles.loadingText}>Loading products...</Text>
                            </View>
                        ) : (
                            /* Product List with windowing for performance */
                            <FlatList
                                data={filteredProducts}
                                renderItem={renderProductItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.productsList}
                                showsVerticalScrollIndicator={false}
                                initialNumToRender={3} // Limit initial render for performance
                                maxToRenderPerBatch={5} // Limit batch size for smoother scrolling
                                windowSize={5} // Reduce window size for performance
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <MaterialCommunityIcons name="basket-off" size={60} color="#CCCCCC" />
                                        <Text style={styles.emptyText}>No products found</Text>
                                        <Text style={styles.emptySubtext}>Try changing your search or filters</Text>
                                    </View>
                                }
                            />
                        )}
                    </>
                ) : (
                    // Sell tab content
                    <ScrollView style={styles.sellTabContainer} contentContainerStyle={styles.sellTabContent}>
                        {renderCreateListingSection()}
                    </ScrollView>
                )}
            </View>

            {renderProductDetailModal()}
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
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E4053',
    },
    offlineIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F57C00',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    offlineIndicatorText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        position: 'relative',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7E8C8D',
    },
    activeTabText: {
        color: '#4CAF50',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '50%',
        height: 3,
        backgroundColor: '#4CAF50',
        borderRadius: 3,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 6,
    },
    categoriesContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    locationsContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    filterContainer: {
        position: 'relative',
        marginRight: 12,
        zIndex: 10,
    },
    filterButton: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    filterButtonText: {
        fontSize: 14,
        color: '#333333',
    },
    filterDropdown: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 150,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedFilterOption: {
        backgroundColor: '#F0F7F0',
    },
    filterOptionText: {
        fontSize: 14,
        color: '#333333',
    },
    selectedFilterOptionText: {
        color: '#3E7D44',
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#4CAF50',
    },
    productsList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginVertical: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 100,
        resizeMode: 'cover',
    },
    productDetails: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    productCategory: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 6,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3E7D44',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: 14,
        marginLeft: 4,
    },
    trendUp: {
        color: '#F44336',
    },
    trendDown: {
        color: '#4CAF50',
    },
    trendStable: {
        color: '#757575',
    },
    locationPrice: {
        fontSize: 12,
        color: '#757575',
        marginTop: 4,
        fontStyle: 'italic',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        paddingBottom: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 6,
    },
    modalImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    modalDetails: {
        padding: 16,
    },
    modalProductName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    modalProductCategory: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 16,
    },
    modalDescription: {
        fontSize: 16,
        color: '#333333',
        lineHeight: 24,
        marginBottom: 20,
    },
    pricesByLocationContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    pricesByLocationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    locationPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    locationName: {
        fontSize: 14,
        color: '#333333',
    },
    locationPriceValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#3E7D44',
    },
    modalTrendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    trendTitle: {
        fontSize: 16,
        color: '#333333',
    },
    modalTrendText: {
        fontSize: 16,
        marginLeft: 4,
    },
    sellTabContainer: {
        flex: 1,
    },
    sellTabContent: {
        paddingBottom: 20,
    },
    createListingContainer: {
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E4053',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#7E8C8D',
        marginBottom: 16,
    },
    createListingButton: {
        marginBottom: 24,
    },
    myListingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    myListingsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E4053',
    },
    viewAllText: {
        fontSize: 14,
        color: '#4CAF50',
    },
    emptyListingsText: {
        fontSize: 14,
        color: '#7E8C8D',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    offlineNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 124, 0, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    offlineText: {
        fontSize: 14,
        color: '#F57C00',
        marginLeft: 8,
        flex: 1,
    }
});

export default MarketScreen; 