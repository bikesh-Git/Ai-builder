import React, { useState } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (number) => {
    if (display === '0') {
      setDisplay(number);
    } else {
      setDisplay(display + number);
    }
  };

  const handleOperator = (operator) => {
    setEquation(display + operator);
    setDisplay('0');
  };

  const handleEqual = () => {
    const result = eval(equation + display);
    setDisplay(result.toString());
    setEquation('');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <div style={styles.calculator}>
      <div style={styles.display}>{display}</div>
      
      <div style={styles.buttonGrid}>
        <button onClick={handleClear} style={styles.button}>C</button>
        <button onClick={() => handleOperator('/')} style={styles.button}>/</button>
        <button onClick={() => handleOperator('*')} style={styles.button}>×</button>
        <button onClick={() => handleOperator('-')} style={styles.button}>-</button>
        
        <button onClick={() => handleNumber('7')} style={styles.button}>7</button>
        <button onClick={() => handleNumber('8')} style={styles.button}>8</button>
        <button onClick={() => handleNumber('9')} style={styles.button}>9</button>
        <button onClick={() => handleOperator('+')} style={styles.button}>+</button>
        
        <button onClick={() => handleNumber('4')} style={styles.button}>4</button>
        <button onClick={() => handleNumber('5')} style={styles.button}>5</button>
        <button onClick={() => handleNumber('6')} style={styles.button}>6</button>
        <button onClick={handleEqual} style={{...styles.button, height: '120px', gridRow: 'span 2'}}>=</button>
        
        <button onClick={() => handleNumber('1')} style={styles.button}>1</button>
        <button onClick={() => handleNumber('2')} style={styles.button}>2</button>
        <button onClick={() => handleNumber('3')} style={styles.button}>3</button>
        
        <button onClick={() => handleNumber('0')} style={{...styles.button, width: '120px', gridColumn: 'span 2'}}>0</button>
        <button onClick={() => handleNumber('.')} style={styles.button}>.</button>
      </div>
    </div>
  );
};

const styles = {
  calculator: {
    width: '240px',
    padding: '20px',
    borderRadius: '10px',
    background: '#f0f0f0',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  display: {
    background: '#fff',
    padding: '20px',
    fontSize: '24px',
    textAlign: 'right',
    marginBottom: '20px',
    borderRadius: '5px',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  button: {
    padding: '15px',
    fontSize: '18px',
    border: 'none',
    borderRadius: '5px',
    background: '#fff',
    cursor: 'pointer',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
    ':hover': {
      background: '#f9f9f9'
    }
  }
};

export default Calculator;
