# 🎬 Pleura - Next Gen Movie & TV Streaming App

![Pleura Banner](/path/to/banner-image.png)

Pleura is a cutting-edge movie and TV show tracking application built with **React Native (Expo)** and **Firebase**. It offers a premium, immersive experience with a sleek dark-mode UI, real-time data from TMDB, and robust user authentication.

---

## ✨ Features

### 🔐 Advanced Authentication

- **Phone Number Login**: Secure, OTP-based authentication.
- **Smart User Detection**: Automatically detects existing users to skip OTP and prompt for password.
- **Password & Profile Setup**: Seamless flow for new users to set up credentials and profile (Name + Avatar).
- **Guest Mode**: Explore the app with limited features.
- **Guest Restrictions**: intelligent blocking of actions like "Save to My List" for guest users.

### 🎥 Content Discovery

- **Hero Section**: Dynamic, auto-rotating featured content with genre-based color theming.
- **Media Details**: Rich details pages for Movies and TV Shows with trailers, cast, and server selection.
- **Search**: Powerful search functionality to find your favorite content.
- **Categories**: Browse by "Now Playing", "Top Rated", "Anime", and more.

### 💾 Personalization

- **My List**: Save your favorite movies and shows to your personal library (persisted to Firestore).
- **Profile Management**: customizable user profiles.

---

## 📱 Screenshots

|                  Login / Auth                  |                 Home Screen                  |                Movie Details                 |
| :--------------------------------------------: | :------------------------------------------: | :------------------------------------------: |
| ![Login Screen](/path/to/login-screenshot.png) | ![Home Screen](/path/to/home-screenshot.png) | ![Movie Details](/path/to/movie-details.png) |

|                Profile Setup                 |                      Search                      |               TV Details               |
| :------------------------------------------: | :----------------------------------------------: | :------------------------------------: |
| ![Profile Setup](/path/to/profile-setup.png) | ![Search Screen](/path/to/search-screenshot.png) | ![TV Details](/path/to/tv-details.png) |

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Auth + Firestore)
- **Data Source**: [TMDB API](https://www.themoviedb.org/)
- **UI/Styling**: Custom styles with `StyleSheet`, `LinearGradient`, and `Lottie` animations.
- **State Management**: React Context API (`AuthContext`).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Expo CLI
- Firebase Project (configured with Phone Auth and Firestore)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/pleura.git
    cd pleura
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure Firebase**
    - Create a `configs/firebaseConfig.ts` file with your Firebase credentials.

4.  **Run the app**
    ```bash
    npx expo start
    ```

---

## 🐛 Known Issues / To-Do

- [ ] Add more comprehensive error handling for network offline states.
- [ ] Implement "Forgot Password" UI polish.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

**Pleura** © 2026. Made with ❤️ by Cella.
