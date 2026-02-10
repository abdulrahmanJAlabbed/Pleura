# Contributing to Pleura

Thank you for your interest in contributing to **Pleura**! Whether you're fixing a bug, improving documentation, or adding a new feature, we welcome your help.

## 🚀 Getting Started for Developers

To run this project on your local machine, you'll need to set up your own environment credentials, as the project relies on Firebase and TMDB.

### Prerequisites

- **Node.js** (v18 or higher)
- **Expo CLI**: `npm install -g expo-cli`
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pleura.git
cd pleura
npm install
```

### 2. Environment Configuration

This project uses environment variables for API keys. You need to create a `.env` file in the root directory.

1.  Copy the example file:

    ```bash
    cp .env.example .env
    ```

2.  Open `.env` and fill in the required values:

    **Firebase Configuration:**
    - Create a project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable **Authentication** (Phone Auth) and **Firestore**.
    - Go to Project Settings and copy your web app configuration.

    **TMDB API Configuration:**
    - Create an account on [The Movie Database (TMDB)](https://www.themoviedb.org/).
    - Go to Settings -> API and generate a Read Access Token (v4).

    **Ngrok Configuration (Optional for Local Dev):**
    - If you want to test on a physical device, get a free static domain from [Ngrok](https://dashboard.ngrok.com/cloud-edge/domains).
    - Add `NGROK_DOMAIN=your-domain.ngrok-free.dev` to your `.env`.

### 3. Run the Project

You can start the development server with:

```bash
# Standard Expo start
npx expo start

# OR with Tunnel (recommended for physical devices)
npm run tunnel
```

---

## 📱 Project Structure

- `/app`: Expo Router file-based routing.
- `/components`: Reusable UI components.
- `/configs`: Firebase and other service configurations.
- `/context`: React Context providers (Auth, Theme, etc.).
- `/scripts`: Helper scripts for development.
- `/website`: The landing page for the app distribution.

## 🤝 Submitting Changes

1.  Fork the repo.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

Happy coding! 🎬
