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
        <button style={styles.button} onClick={() => handleNumber('7')}>7</button>
        <button style={styles.button} onClick={() => handleNumber('8')}>8</button>
        <button style={styles.button} onClick={() => handleNumber('9')}>9</button>
        <button style={styles.button} onClick={() => handleOperator('+')}>+</button>

        <button style={styles.button} onClick={() => handleNumber('4')}>4</button>
        <button style={styles.button} onClick={() => handleNumber('5')}>5</button>
        <button style={styles.button} onClick={() => handleNumber('6')}>6</button>
        <button style={styles.button} onClick={() => handleOperator('-')}>-</button>

        <button style={styles.button} onClick={() => handleNumber('1')}>1</button>
        <button style={styles.button} onClick={() => handleNumber('2')}>2</button>
        <button style={styles.button} onClick={() => handleNumber('3')}>3</button>
        <button style={styles.button} onClick={() => handleOperator('*')}>×</button>

        <button style={styles.button} onClick={() => handleNumber('0')}>0</button>
        <button style={styles.button} onClick={handleClear}>C</button>
        <button style={styles.button} onClick={handleEqual}>=</button>
        <button style={styles.button} onClick={() => handleOperator('/')}>/</button>
      </div>
    </div>
  );
};

const styles = {
  calculator: {
    width: '300px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: '#f0f0f0',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  display: {
    backgroundColor: '#fff',
    padding: '20px',
    marginBottom: '20px',
    borderRadius: '5px',
    textAlign: 'right',
    fontSize: '24px'
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
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#e0e0e0'
    }
  }
};

export default Calculator;
