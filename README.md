# Car Shipping Receipts App

A React Native application for generating professional car shipping receipts in PDF format.

## Features

- Create professional car shipping receipts with company and customer information
- Add vehicle details including make, model, year, mileage, and VIN
- Calculate costs including car cost, service charges, and taxes
- Choose from multiple receipt templates
- Add company logo to receipts
- Generate PDF receipts that can be shared or saved
- View receipt history
- Offline-first functionality

## Tech Stack

- React Native with Expo
- TypeScript
- React Hook Form + Zod for form validation
- React Native Paper for UI components
- Expo Print for PDF generation
- Expo Sharing for sharing PDFs
- Expo File System for file management
- Expo Image Picker for logo selection
- AsyncStorage for local data storage

## Project Structure

```
app/
├── assets/           # App icons and images
├── components/       # Reusable UI components
├── lib/              # Business logic and utilities
│   ├── forms/        # Form validation and hooks
│   ├── images/       # Image handling utilities
│   ├── pdf/          # PDF generation and templates
│   └── storage/      # Data storage utilities
├── screens/          # Screen components
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. To run on Android:
   ```bash
   npm run android
   ```

4. To run on iOS:
   ```bash
   npm run ios
   ```

## Dependencies

- `expo`: ~51.0.28
- `react`: 18.2.0
- `react-native`: 0.74.5
- `react-native-paper`: 4.9.2
- `react-hook-form`: ^7.52.1
- `zod`: ^3.23.8
- `expo-print`: ~13.4.2
- `expo-sharing`: ~12.4.2
- `expo-file-system`: ~17.0.1
- `expo-image-picker`: ~15.0.7
- `@react-native-async-storage/async-storage`: 1.23.1
- `@react-navigation/native`: ^6.1.17
- `@react-navigation/native-stack`: ^6.10.1
- `uuid`: ^10.0.0
- `@hookform/resolvers`: ^3.9.0

## Development

This project follows standard React Native and Expo development practices. All components are written in TypeScript for type safety.

### Code Organization

- **Types**: All TypeScript interfaces and types are defined in the `app/types/` directory
- **Components**: Reusable UI components are in `app/components/`
- **Screens**: Each screen of the application is in `app/screens/`
- **Libraries**: Business logic is organized in `app/lib/` by functionality
- **Utilities**: Helper functions are in `app/utils/`

## Templates

The app includes two receipt templates:

1. **Minimal**: Clean, business-style receipt
2. **Card**: Modern card-based design

Templates are defined as HTML strings with inline CSS for consistent rendering across platforms.

## Data Storage

Receipts are stored locally using AsyncStorage. The app keeps the last 500 receipts for quick access.

## PDF Generation

PDFs are generated using Expo Print, which converts HTML templates to PDF format. This allows for rich formatting and consistent output across platforms.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.