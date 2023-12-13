import React from 'react';

const LoadingBar = ({ progress }) => {
  const barStyle = {
    width: `${progress}%`,
    height: '20px',
    backgroundColor: `rgba(0, 255, 0, ${progress / 100})`, // Dynamically update green color
    borderRadius: '4px',
    transition: 'background-color 0.3s ease-in-out', // Add transition for smoother color change
  };

  return (
    <div>
      <div style={barStyle}>
        {/* Loading bar */}
      </div>
      <p>{progress === 100 ? 'Loading Complete!' : `Loading... ${progress}%`}</p>
    </div>
  );
};

export default LoadingBar;