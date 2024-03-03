import React from 'react';
import Toast from './Toast';

interface ToastProps {
  title: string;
  message: string;
  icon: any;
  color: string;
}

const showToast: React.FC<ToastProps> = ({ title, message, icon, color }) => {
  console.log("toast")
  return (
    <Toast title={title} message={message} icon={icon} color={color} />
  );
};

export default showToast;
