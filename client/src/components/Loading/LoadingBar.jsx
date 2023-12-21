import React from 'react';

const LoadingBar = ({ progress }) => {
  const barStyle = {
    width: `${progress}%`,
    height: '20px',
    backgroundColor: `rgba(0, 255, 0, ${progress / 100})`, // Dynamically update green color
    borderRadius: '10px',
    transition: 'background-color 0.3s ease-in-out', // Add transition for smoother color change
  };

  return (
    <div>
      <div style={barStyle}>
        {/* Loading bar */}
      </div>
      <div className="item-center justify-center flex flex-1">
        <p>{progress === 100 ? 'Loading Complete!' : (progress === 0 ? "" : `Loading... ${progress}%`)}</p>
      </div>
    </div>
  );
};

export default LoadingBar;
