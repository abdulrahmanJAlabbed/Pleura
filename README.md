# 🎬 Pleura - Next Gen Movie & TV Streaming App

![Pleura Banner](assets/images/banner_placeholder.png)

**Pleura** is a cutting-edge movie and TV show tracking application built with **React Native (Expo)** and **Firebase**. It offers a premium, immersive experience with a sleek dark-mode UI, real-time data from TMDB, and robust user authentication.

Now available as a **Progressive Web App (PWA)** for instant access on any device.

---

## 📥 Get started

### 🌐 Web App (PWA) - Recommended

Why install? Just visit the website and add it to your home screen for a full native app experience.

👉 **[Launch Pleura](https://alabed.work/pleura-new/APP)** 👈

**Installation:**

- **iOS:** Open in Safari -> Tap **Share** -> **Add to Home Screen**.
- **Android:** Open in Chrome -> Tap **Install App** or **Add to Home Screen**.

### 📱 Android (APK)

Prefer a classic install? Download the APK file directly.

- [Download APK](https://alabed.work/pleura-new/APP/app.apk)

---

## ✨ Features

### 🔐 Advanced Authentication

- **Phone Number Login**: Secure, OTP-based authentication.
- **Smart User Detection**: Automatically detects existing users.
- **Guest Mode**: Explore without signing up.

### 🎥 Content Discovery

- **Hero Section**: Dynamic, auto-rotating featured content.
- **Media Details**: Rich details with trailers, cast, and more.
- **Search**: Powerful search functionality.

### 💾 Personalization

- **My List**: Save your favorite movies and shows.
- **Profile Management**: Customizable user profiles.

---

## 📱 Screenshots

|                 Login / Auth                 |                Home Screen                 |                  Movie Details                   |
| :------------------------------------------: | :----------------------------------------: | :----------------------------------------------: |
| ![Login](assets/images/screenshot_login.png) | ![Home](assets/images/screenshot_home.png) | ![Details](assets/images/screenshot_details.png) |

|                  Profile Setup                   |                     Search                     |                TV Shows                |
| :----------------------------------------------: | :--------------------------------------------: | :------------------------------------: |
| ![Profile](assets/images/screenshot_profile.png) | ![Search](assets/images/screenshot_search.png) | ![TV](assets/images/screenshot_tv.png) |

---

## 🛠️ Developer Guide

Want to contribute? Check out our **[CONTRIBUTING.md](CONTRIBUTING.md)** guide.

### Tech Stack

- **Framework**: React Native (Expo)
- **Backend**: Firebase (Auth + Firestore)
- **Data**: TMDB API
- **Styling**: Custom StyleSheet + LinearGradient

### Local Development

```bash
# Clone
git clone https://github.com/your-username/pleura.git

# Install
npm install

# Run
npx expo start
```

---

## 🚀 Deployment (Self-Hosting)

Host your own version of Pleura on any static file server (Nginx, Apache, Vercel, etc.).

### 1. Build the PWA

```bash
npm run build:web
```

This generates a `dist` folder with the static files.

### 2. Configure Nginx

If deploying to a subdirectory (e.g., `/pleura-new/APP`), update `app.json` `baseUrl` first, then add this to your Nginx config:

```nginx
location /pleura-new/APP/ {
    alias /var/www/portfolio/pleura-new/APP/;
    try_files $uri $uri/ /pleura-new/APP/index.html;
}
```

### 3. Deploy

Copy the `dist` folder contents to your server's web root defined in the alias above.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

**Pleura** © 2026. Open Source Project.
