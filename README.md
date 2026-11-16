# 🌤️ Weather App

A responsive weather application built with **Next.js**, **React**, and **Tailwind CSS**. It allows users to search for a city and retrieve its current weather conditions using the OpenWeatherMap API.

## ✨ Features

- Search for weather conditions by city name.
- Display current temperature in Celsius.
- Show humidity and weather descriptions.
- Display weather icons.
- Loading and error states.
- Responsive user interface.
- Server-side API integration to keep the API key private.

## 🛠️ Technologies

- **Next.js 16** – React framework using the App Router.
- **React** – User interface.
- **Tailwind CSS** – Styling and responsive design.
- **JavaScript** – Application logic.
- **OpenWeatherMap API** – Weather and geocoding data.
- **Vitest** – Automated testing.

## 🏗️ Architecture

The application uses a Next.js API Route as an intermediary between the frontend and OpenWeatherMap.

```text
User
  |
  v
Next.js Frontend
  |
  v
/api/weather
  |
  v
OpenWeatherMap API
  |
  +-- Geocoding API
  |
  +-- Current Weather API
  |
  v
Weather information
  |
  v
Frontend display
```

The API key is stored on the server and is never exposed directly to the browser.

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- An OpenWeatherMap API key

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the project directory

```bash
cd weather-app
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your OpenWeatherMap API key.

**Important:** Never commit `.env.local` or expose your API key in the frontend.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

Run the automated tests with:

```bash
npm run test:run
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 🌐 Weather Data Provider

This project uses [OpenWeatherMap](https://openweathermap.org/api) for:

- Geocoding API – Converts city names into geographic coordinates.
- Current Weather API – Retrieves current weather information.

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Vitest Documentation](https://vitest.dev/)

## 👨‍💻 Author

Developed as a personal project to practice modern frontend development, API integration, server-side logic, and automated testing.
