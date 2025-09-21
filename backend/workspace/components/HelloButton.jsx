import React, { useState } from 'react';

const HelloButton = () => {
  const [message, setMessage] = useState('Click me!');

  const handleClick = () => {
    setMessage('Hello World!');
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  return (
    <button 
      style={buttonStyle}
      onClick={handleClick}
    >
      {message}
    </button>
  );
};

export default HelloButton;
// Updated at Sun Sep 21 17:20:45 IST 2025
// Test comment added at Sun Sep 21 17:30:20 IST 2025
// New test comment Sun Sep 21 17:34:52 IST 2025
