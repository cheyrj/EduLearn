// pages/_app.js

import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import '../styles/global.css';
import Header from '../components/Header';
import Notification from '../components/Notification'; // Import the Notification component

function MyApp({ Component, pageProps }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState(null); // State for notification

  useEffect(() => {
    // Check if the theme is saved in localStorage on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, []); // This effect runs only on initial page load

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Function to show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null); // Clear notification after 4 seconds
    }, 4000);
  };

  const handleCloseNotification = () => {
    setNotification(null); // Manual close of the notification
  };

  return (
    <>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <Component {...pageProps} isDarkMode={isDarkMode} showNotification={showNotification} />

      {/* Render the Notification component if there's a message */}
      {notification && (
        <Notification message={notification} onClose={handleCloseNotification} />
      )}
    </>
  );
}

export default MyApp;