import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client' for React 18
import { BrowserRouter } from 'react-router-dom'; // Only import BrowserRouter here
import App from './App'; // App should handle the routing
// import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
import './index.css'; // Assuming you have some global CSS

// Find the root DOM node
const rootElement = document.getElementById('root');

// Use createRoot instead of ReactDOM.render
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* Only one BrowserRouter wrapping your app */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
