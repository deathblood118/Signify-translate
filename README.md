# Signify Translate

A language translation app using OpenAI's GPT API and Google Translate API. Built with React Native and Expo.

---

## 🚀 Getting Started

### 📦 Prerequisites

Make sure you have the following installed:

- [Node.js & npm](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
  ```bash
  npm install -g expo-cli
  ```

---

### 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/deathblood118/Signify-translate.git
   cd Signify-translate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

---

## 🧠 Setting Up API Keys

The app requires two API keys:

- **OpenAI API Key** – for GPT-based translation
- **Google Cloud Translation API Key** – for language detection or additional translation logic

### 🔑 How to set them up

1. **Generate OpenAI API Key**  
   - Go to [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
   - Create a key and copy it.

2. **Generate Google Translate API Key**  
   - Follow this guide: [https://cloud.google.com/translate/docs/setup](https://cloud.google.com/translate/docs/setup)

3. **Create a `.env` file** in the root of the project:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_API_KEY=your-google-api-key
   ```

4. **Update `TranslateApp.js`** to use environment variables:
   ```js
   import 'dotenv/config';

   const openaiKey = process.env.OPENAI_API_KEY;
   const googleKey = process.env.GOOGLE_API_KEY;
   ```

> ✅ Make sure `.env` is added to `.gitignore` to avoid accidentally committing secrets.

---

## 📱 Running the App

To run on your local device or emulator:

```bash
npm start
```
or
```bash
expo start
```

Then follow the on-screen instructions to open it in your Expo Go app (Android/iOS) or emulator.

---

## 🧩 Folder Structure

```
src/
├── DemoPage.js
├── Settings.js
├── TranslateApp.js
assets/
├── icons, splash images, etc.
```

---

## ✅ Features

- GPT-powered language translation
- Customizable UI via React Native
- Google Translate support
- Easy-to-extend code structure

---

## 📄 License

MIT — feel free to use and modify.
