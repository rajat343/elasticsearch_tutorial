# Frontend - React Vite Search App

A modern React application built with Vite for searching items with a beautiful, responsive UI.

## Features

-   🔍 **Real-time Search**: Debounced search with instant results
-   📱 **Responsive Design**: Works perfectly on desktop and mobile
-   🎨 **Modern UI**: Beautiful gradient design with smooth animations
-   ⚡ **Fast Performance**: Built with Vite for lightning-fast development
-   🔄 **Auto-reload**: Hot module replacement for instant updates

## Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn

## Setup

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Start the development server:**

    ```bash
    npm run dev
    ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Available Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build
-   `npm run lint` - Run ESLint

## Project Structure

```
src/
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
├── index.css            # Global styles
└── services/
    └── api.js           # API service functions
```

## API Integration

The frontend connects to the backend API through:

-   **Base URL**: `/api` (proxied to `http://localhost:5000`)
-   **Search Endpoint**: `/api/items/search?q=query`
-   **All Items**: `/api/items`

## Features

### Search Functionality

-   Debounced search (300ms delay)
-   Real-time results as you type
-   Clear search functionality
-   Loading states and error handling

### UI Components

-   **Search Bar**: Large, prominent search input with icon
-   **Item Cards**: Beautiful cards showing item details
-   **Loading States**: Spinner and loading messages
-   **Empty States**: Helpful messages when no results found
-   **Error Handling**: User-friendly error messages

### Responsive Design

-   Mobile-first approach
-   Grid layout that adapts to screen size
-   Touch-friendly interface
-   Optimized for all device sizes

## Styling

The app uses modern CSS with:

-   CSS Grid and Flexbox for layouts
-   CSS Custom Properties for theming
-   Smooth animations and transitions
-   Gradient backgrounds and glassmorphism effects
-   Responsive breakpoints

## Browser Support

-   Chrome (latest)
-   Firefox (latest)
-   Safari (latest)
-   Edge (latest)

## Development

The app is configured with:

-   **Vite**: Fast build tool and dev server
-   **React**: Latest version with hooks
-   **Axios**: HTTP client for API calls
-   **Lucide React**: Beautiful icons
-   **ESLint**: Code linting and formatting
