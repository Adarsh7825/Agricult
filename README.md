# SmartSheti  - Smart Farming Assistant

A mobile application built to empower farmers with AI-powered tools, market access, and agricultural insights while addressing the specific challenges and limitations of rural agricultural contexts.

## MVP Features

### 1. Crop Disease Detection
- Upload or capture leaf images to identify diseases
- AI-powered disease recognition with offline capability
- Get treatment recommendations based on detected diseases
- Works with limited connectivity and basic smartphone cameras

### 2. Agricultural Marketplace
- Direct connection between farmers and buyers
- Offline-first approach with SMS fallback for communications
- Post and browse listings that sync when connectivity is available
- Location-based filtering with distance indicators

### 3. Price Prediction
- AI-based forecasting of crop prices
- Historical trend visualization
- Works with limited data and connectivity
- Set price alerts for optimal selling time

### 4. Farming Assistant Chatbot
- Multilingual support for regional languages
- Text-based interface optimized for low bandwidth
- Practical farming advice and weather information
- Voice input option for users with limited digital literacy

## Design Considerations

Our application addresses the specific challenges outlined in the requirements:

### Technical Realities
- **Connectivity**: Fully functional offline mode with background syncing when connectivity is available
- **Devices**: Optimized for basic smartphones with limited processing power and storage
- **Power Reliability**: Low-power mode and crash recovery for unstable power conditions

### User Context
- **Digital Literacy**: Simple, intuitive UI with minimal text input requirements
- **Language Support**: Multiple regional language options available
- **Trust Building**: Transparent information display and progressive disclosure of advanced features

### Resource Limitations
- **Economic Constraints**: Free core features with minimal data usage
- **Data Sparsity**: Bootstrap models with minimal data requirements
- **Technical Support**: In-app guidance and troubleshooting

### Ethical Considerations
- **Data Privacy**: Minimal data collection, local-first processing
- **Transparency**: Clear explanations of AI recommendations
- **Bias Mitigation**: Models trained on diverse agricultural contexts
- **Sustainability**: Community contribution model for long-term maintenance

## Getting Started

### Prerequisites
- Node.js
- Expo CLI
- Android Studio/Xcode (optional, for native builds)

### Installation

1. Clone the repository
```
git clone https://github.com/your-username/agricult.git
cd agricult
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

### Building for Production
```
expo build:android
expo build:ios
```

## Technical Stack

- **Frontend**: React Native/Expo
- **State Management**: React Context API
- **UI Components**: Custom components with performance optimization
- **Offline Support**: AsyncStorage and SQLite
- **Data Visualization**: Lightweight charting libraries
- **AI Models**: TensorFlow Lite (on-device inference)

## Contributing

We welcome contributions! Please check our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
