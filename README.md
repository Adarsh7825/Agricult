# SmartSheti - Smart Farming Assistant

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

## Application Screenshots

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/5d156f80-f62d-49eb-9664-ee8b4662d31f" width="200"/><br/>
      <em>Welcome Screen: Entry point to SmartSheti</em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/aded5af1-0d72-4a06-b0d8-50161e011bd0" width="200"/><br/>
      <em>Home Dashboard: Quick access to features</em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/22b829ed-d4f8-4354-a44c-f813a16fa8d9" width="200"/><br/>
      <em>Crop Disease Detection</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/f307a22b-2cbd-406b-8346-23314ac52e50" width="200"/><br/>
      <em>Disease Analysis Results</em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/fb253d9b-6800-471a-976e-9b1120455c00" width="200"/><br/>
      <em>Agricultural Marketplace</em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/1d1214ab-d60a-4f25-8fe7-abddcb33dbca" width="200"/><br/>
      <em>Market Listings</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/1b2c6483-7b05-495c-ae02-fb735534b88e" width="200"/><br/>
      <em>Price Prediction</em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/b90feaa3-e82f-487e-9a79-0729e5a2c637" width="200"/><br/>
      <em>Historical Price Trends</em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/7c1ff116-aef3-4b82-9128-2297d60a2c0f" width="200"/><br/>
      <em>Farming Assistant Chatbot</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/e1146d38-e8e4-4523-a431-5fd6a1ba2cec" width="200"/><br/>
      <em>Weather Information</em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/630b159f-1e35-430a-9400-24da64b4b07e" width="200"/><br/>
      <em>Voice Input Feature</em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/eae2248d-9d90-4e80-8a3e-107b42851b6e" width="200"/><br/>
      <em>Settings and Preferences</em>
    </td>
  </tr>
</table>

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
- Node.js (v14 or later)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio/Xcode (optional, for native builds)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/agricult.git
cd agricult
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Start with development client (for native features)
```bash
npm run dev:client
```

### Running with Backend

1. Start the backend server
```bash
npm run start:backend
```

2. Run everything together
```bash
npm run start:full
```

### Building for Production

For Android:
```bash
npm run build:android
```

For iOS (requires macOS):
```bash
eas build -p ios --profile production
```

## Technical Stack

- **Frontend**: React Native/Expo
- **State Management**: React Context API
- **UI Components**: Custom components with performance optimization
- **Offline Support**: AsyncStorage and SQLite
- **Data Visualization**: Lightweight charting libraries
- **AI Models**: TensorFlow Lite (on-device inference)
- **Backend**: Node.js with Express (for API services)
- **Machine Learning**: Python with Flask (for complex ML tasks)

## Contributing

We welcome contributions! Please check our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
