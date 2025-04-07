import { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Notification({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/80 border-green-500 text-green-100';
      case 'error':
        return 'bg-blood/80 border-blood-light text-light';
      default:
        return 'bg-dark-lighter/80 border-blood/20 text-light';
    }
  };

  return (
    <div className={`fixed top-20 right-4 p-4 rounded border max-w-sm 
      shadow-lg backdrop-blur-sm transition-all duration-300 
      animate-slide-in ${getTypeStyles()}`}
    >
      <div className="flex items-start justify-between">
        <p>{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-light-darker hover:text-light transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}