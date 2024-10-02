import { useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    // Automatically close the notification after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      {message}
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default Notification;