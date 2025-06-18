📚 PageTurner: Your Gamified Ebook Reader
PageTurner is an innovative React Native ebook reader designed to transform your reading experience. Beyond standard features like adjustable fonts and night mode, PageTurner gamifies your reading journey, rewarding you for building consistent habits. In future iterations, it will leverage AI for intelligent summaries and personalized recommendations, turning every read into an adventure.

🌟 Features
PageTurner is developed in phases, ensuring a robust core before expanding into advanced capabilities.

Phase 1: Core Ebook Reader (MVP)
Seamless EPUB Reading: Load and render EPUB files with rich text, images, and embedded styling.

Intuitive Navigation: Effortlessly swipe or tap to turn pages, or jump directly to chapters via the Table of Contents.

Local Library Management: Easily scan your device's file system, import EPUBs, and organize your digital book collection.

Automatic Metadata Extraction: Books are automatically cataloged with their title, author, cover, publisher, and more.

Customizable Reading Experience:

Adjustable Font Size: Tailor the text size to your comfort.

In-App Brightness Control: Adjust screen brightness without leaving the app.

Day & Night Modes: Switch between light and dark themes for optimal reading in any environment.

Flexible Reading Views: Choose between continuous scroll or traditional page-by-page viewing.

Reading Progress & Bookmarks: Automatically saves your last read position and allows you to set and manage multiple custom bookmarks.

Phase 2: Gamification & Enhanced Features
Reading Progress Tracking: Monitor your pages read, total reading time, and build impressive reading streaks.

Achievement System: Earn badges and points for hitting reading milestones, motivating you to read more consistently.

Text-to-Speech (TTS): Have your books read aloud with adjustable speech rate, pitch, and voice selection.

In-Book Search: Quickly find specific words or phrases within the current book.

Phase 3: Premium & Social Features (Future Renditions)
AI-Powered Summaries: (Premium) Instantly generate concise summaries of chapters or entire books.

AI-Driven Key Lessons: (Premium) Extract the most important takeaways from any text selection.

Personalized AI Recommendations: (Premium) Discover your next favorite book based on your reading history, preferred authors, and themes.

User Accounts & Cloud Sync: Create a profile, synchronize your library and progress across multiple devices, and unlock social features.

Social & Community: Connect with friends, share your reading progress, achievements, and exchange book recommendations.

Leaderboards: Compete with other users and see who reads the most!

🛠️ Technical Stack
PageTurner is built with modern, robust technologies to ensure a smooth and scalable experience:

Development Framework: React Native

EPUB Rendering: @epubjs-react-native/core and react-native-webview

File System Access: react-native-fs

Local Data Storage: MMKV (for fast key-value) or WatermelonDB / Realm (for structured data and persistence)

Text-to-Speech: react-native-tts

Brightness Control: @reeq/react-native-device-brightness

State Management: Zustand or React Context API

AI Integration (Premium): Gemini API

Authentication (Future): Firebase Authentication

Cloud Database (Future): Firestore

Styling: React Native's StyleSheet API, potentially with React Native Paper or NativeBase.

🚀 Installation
To get a local copy up and running, follow these simple steps.

Clone the repository:

git clone https://github.com/your-username/pageturner.git
cd pageturner

Install dependencies:

npm install
# or
yarn install

Install iOS pods (if developing for iOS):

cd ios
pod install
cd ..

Run the app:

For Android:

npx react-native run-android

For iOS:

npx react-native run-ios

Make sure you have a device or emulator running.

📖 Usage
Launch the app on your device or emulator.

Grant file system access permissions when prompted.

Navigate to the "Import Books" section to scan your device for EPUB files.

Select books to add them to your library.

Tap on a book cover in your library to start reading!

Explore the settings within the reader to adjust font size, toggle night mode, and control brightness.

📁 Project Structure
pageturner/
├── android/              # Android native code
├── ios/                  # iOS native code
├── assets/               # Static assets (images, fonts, etc.)
├── src/
│   ├── api/              # API service integrations (e.g., Gemini)
│   ├── components/       # Reusable UI components
│   ├── config/           # App configurations (e.g., Firebase, AI keys)
│   ├── contexts/         # React Contexts for global state
│   ├── data/             # Local storage wrappers, data models
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # Main application screens (Library, Reader, Settings, etc.)
│   ├── services/         # Business logic, utilities (e.g., EPUB parser, gamification logic)
│   └── App.js            # Main application entry point
├── .env                  # Environment variables
├── package.json          # Project dependencies and scripts
└── README.md             # This file

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

📞 Contact
Karabo Sambo - karabosambo@outlook.com 

PageTurner: https://github.com/blaqbox-prime/pageturner
