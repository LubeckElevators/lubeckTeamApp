# Lubeck Team App

A modern React Native application built with Expo for the Lubeck Team platform.

## 🚀 Features

- **Cross-Platform Support**: iOS, Android, and Web
- **Modern UI/UX**: Dark theme with smooth animations
- **Custom Splash Screen**: Branded splash screen with "Lubeck Team" branding
- **File-based Routing**: Using Expo Router for navigation
- **TypeScript**: Full type safety throughout the app
- **Responsive Design**: Optimized for all screen sizes

## 📱 App Configuration

- **App Name**: Lubeck Team
- **Splash Screen**: Custom animated splash with logo and app name
- **App Icon**: Uses `icon.png` for all platforms
- **Theme**: Dark mode optimized with professional styling

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lubeck-team
```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
npm start
```

### Running on Different Platforms

- **iOS**: Press `i` in the terminal or run `npm run ios`
- **Android**: Press `a` in the terminal or run `npm run android`
- **Web**: Press `w` in the terminal or run `npm run web`

## 📁 Project Structure

```
lubeck-team/
├── app/                    # Main app screens and navigation
│   ├── _layout.tsx        # Root layout with splash screen
│   └── (tabs)/            # Tab navigation screens
├── components/            # Reusable UI components
│   ├── SplashScreen.tsx   # Custom splash screen
│   └── ui/               # UI-specific components
├── assets/               # Images, fonts, and static assets
│   └── images/           # App icons and logos
├── constants/            # App constants and configurations
└── hooks/               # Custom React hooks
```

## 🎨 Customization

### Changing the Splash Screen

The splash screen is configured in `app.json` and the component is located at `components/SplashScreen.tsx`. You can modify:

- Logo image: Update the `image` path in `app.json`
- Background color: Change `backgroundColor` in `app.json`
- Animation timing: Modify the animation durations in `SplashScreen.tsx`

### Updating App Icons

- **App Icon**: Replace `assets/images/icon.png`
- **Splash Icon**: Replace `assets/images/logo.png`
- **Favicon**: Update `assets/images/favicon.png` for web

## 🔧 Development Scripts

- `npm start` - Start the development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality
- `npm run reset-project` - Reset to clean template

## 📦 Dependencies

### Core Dependencies
- React Native 0.79.6
- Expo 53.0.22
- Expo Router 5.1.5
- React Navigation 7.x

### Key Libraries
- `react-native-reanimated` - Advanced animations
- `expo-haptics` - Haptic feedback
- `expo-blur` - Blur effects
- `expo-image` - Optimized image loading

## 🎯 Next Steps

1. **Add Authentication**: Implement user login/signup
2. **Team Features**: Add team management functionality
3. **Real-time Updates**: Integrate WebSocket for live updates
4. **Push Notifications**: Add notification support
5. **Offline Support**: Implement offline-first architecture

## 📄 License

This project is proprietary to Lubeck Team.

---

**Built with ❤️ for Lubeck Team**
