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
