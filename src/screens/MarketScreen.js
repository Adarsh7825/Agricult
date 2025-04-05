import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';

// Import AppImages from utils
import AppImages from '../utils/AppImages';

// Create a component for product image to handle loading/errors
const ProductImage = ({ source }) => {
    const [hasError, setHasError] = useState(false);

    return (
        <View style={styles.imageContainer}>
            <Image
                source={hasError ? AppImages.icon : source}
                style={styles.productImage}
                resizeMode="cover"
                onError={() => setHasError(true)}
            />
            {hasError && (
                <View style={styles.imagePlaceholderOverlay}>
                    <MaterialCommunityIcons name="leaf" size={30} color="#4CAF50" />
                </View>
            )}
        </View>
    );
};

// Sample data for products
const PRODUCTS = [
    {
        id: '1',
        name: 'Organic Potatoes',
        price: '₹25/kg',
        location: 'Nashik, Maharashtra',
        distance: '15 km',
        seller: 'Ramesh Patel',
        rating: 4.8,
        image: AppImages.icon,
        quantity: '500 kg',
        category: 'Vegetables',
    },
    {
        id: '2',
        name: 'Fresh Tomatoes',
        price: '₹30/kg',
        location: 'Pune, Maharashtra',
        distance: '22 km',
        seller: 'Suresh Kumar',
        rating: 4.5,
        image: AppImages.icon,
        quantity: '200 kg',
        category: 'Vegetables',
    },
    {
        id: '3',
        name: 'Wheat',
        price: '₹2200/quintal',
        location: 'Ahmednagar, Maharashtra',
        distance: '35 km',
        seller: 'Ganesh Patil',
        rating: 4.9,
        image: AppImages.icon,
        quantity: '20 quintals',
        category: 'Grains',
    },
    {
        id: '4',
        name: 'Rice (Basmati)',
        price: '₹3500/quintal',
        location: 'Kolhapur, Maharashtra',
        distance: '42 km',
        seller: 'Vijay Singh',
        rating: 4.7,
        image: AppImages.icon,
        quantity: '15 quintals',
        category: 'Grains',
    },
    {
        id: '5',
        name: 'Fresh Apples',
        price: '₹150/kg',
        location: 'Raigad, Maharashtra',
        distance: '50 km',
        seller: 'Ajay Sharma',
        rating: 4.6,
        image: AppImages.icon,
        quantity: '300 kg',
        category: 'Fruits',
    },
];

// Categories for filter
const CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'grains', name: 'Grains' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'other', name: 'Other' },
];

const MarketScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'

    // Animation for tab switching
    const tabAnimValue = useRef(new Animated.Value(0)).current;

    const handleTabChange = (tab) => {
        Animated.timing(tabAnimValue, {
            toValue: tab === 'buy' ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setActiveTab(tab);
    };

    const tabIndicatorPosition = tabAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%'],
    });

    // Filter products based on search and category
    const filteredProducts = PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' ||
            product.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    // Render each product item - improved UI layout
    const renderProductItem = ({ item }) => {
        return (
            <View style={styles.productCard}>
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>Available: {item.quantity}</Text>
                </View>

                <View style={styles.productCardHeader}>
                    <ProductImage source={item.image} />
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productPrice}>{item.price}</Text>
                        <View style={styles.productLocationRow}>
                            <MaterialCommunityIcons name="map-marker" size={16} color="#7E8C8D" />
                            <Text style={styles.productLocation}>{item.location}</Text>
                            <Text style={styles.productDistance}>• {item.distance}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.productCardFooter}>
                    <View style={styles.sellerInfo}>
                        <MaterialCommunityIcons name="account-circle" size={18} color="#4CAF50" />
                        <Text style={styles.sellerName}>{item.seller}</Text>
                        <View style={styles.ratingContainer}>
                            <MaterialCommunityIcons name="star" size={14} color="#FFB300" />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                    </View>

                    <CustomButton
                        title={activeTab === 'buy' ? "Contact Seller" : "View Details"}
                        onPress={() => { }}
                        style={styles.contactButton}
                        textStyle={styles.contactButtonText}
                    />
                </View>
            </View>
        );
    };

    // Render category button
    const renderCategoryButton = (category) => (
        <TouchableOpacity
            key={category.id}
            style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.id)}
        >
            <Text
                style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.selectedCategoryButtonText,
                ]}
            >
                {category.name}
            </Text>
        </TouchableOpacity>
    );

    // Create listing section for sellers
    const renderCreateListingSection = () => (
        <View style={styles.createListingContainer}>
            <Text style={styles.sectionTitle}>Sell Your Produce</Text>
            <Text style={styles.sectionSubtitle}>Create a listing to connect with potential buyers</Text>

            <CustomButton
                title="Create New Listing"
                onPress={() => { }}
                icon={<MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />}
                style={styles.createListingButton}
            />

            <View style={styles.myListingsHeader}>
                <Text style={styles.myListingsTitle}>My Active Listings</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.emptyListingsText}>
                You don't have any active listings yet.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.container}>
                {/* Header with Tabs */}
                <View style={styles.header}>
                    <Text style={styles.title}>Agri Market</Text>

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
                        {/* Search Bar */}
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

                        {/* Category Filters */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesContainer}
                        >
                            {CATEGORIES.map(renderCategoryButton)}
                        </ScrollView>

                        {/* Product List */}
                        <FlatList
                            data={filteredProducts}
                            renderItem={renderProductItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.productsList}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="basket-off" size={60} color="#CCCCCC" />
                                    <Text style={styles.emptyText}>No products found</Text>
                                    <Text style={styles.emptySubtext}>Try changing your search or filters</Text>
                                </View>
                            }
                        />
                    </>
                ) : (
                    // Sell tab content
                    <ScrollView style={styles.sellTabContainer} contentContainerStyle={styles.sellTabContent}>
                        {renderCreateListingSection()}
                    </ScrollView>
                )}
            </View>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E4053',
        marginBottom: 16,
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
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedCategoryButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#2E4053',
    },
    selectedCategoryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
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
    productCardHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E4053',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 6,
    },
    productLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productLocation: {
        fontSize: 14,
        color: '#7E8C8D',
        marginLeft: 4,
    },
    productDistance: {
        fontSize: 14,
        color: '#7E8C8D',
        marginLeft: 4,
    },
    quantityContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    quantityText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    productCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F1F1',
        paddingTop: 12,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerName: {
        fontSize: 14,
        color: '#2E4053',
        marginLeft: 4,
        marginRight: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 179, 0, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 12,
        color: '#FFB300',
        fontWeight: 'bold',
        marginLeft: 2,
    },
    contactButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    contactButtonText: {
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E4053',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#7E8C8D',
        marginTop: 8,
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
});

export default MarketScreen; 