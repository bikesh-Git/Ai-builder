import React from 'react';

const GreetingCard = ({ recipient, message, sender }) => {
  const cardStyle = {
    width: '300px',
    padding: '20px',
    margin: '20px auto',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    color: '#2c3e50',
    fontSize: '24px',
    marginBottom: '15px'
  };

  const messageStyle = {
    color: '#34495e',
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '20px 0'
  };

  const senderStyle = {
    color: '#7f8c8d',
    fontSize: '14px',
    fontStyle: 'italic',
    marginTop: '20px'
  };

  return (
    <div style={cardStyle}>
      <h2 style={headerStyle}>Dear {recipient}</h2>
      <p style={messageStyle}>{message}</p>
      <p style={senderStyle}>From, {sender}</p>
    </div>
  );
};

export default GreetingCard;
