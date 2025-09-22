Here is the React component code for the simple calculator app:

import React, { useState } from 'react';
import './Calculator.css';

function Calculator() {
  const [num1, setNum1] = useState('');
  const [operator, setOperator] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState('');

  const handleNumberChange = (e) => {
    if (e.target.id === 'num1') {
      setNum1(e.target.value);
    } else {
      setNum2(e.target.value);
    }
  };

  const handleOperatorChange = (e) => {
    setOperator(e.target.value);
  };

  const calculateResult = () => {
    let num1 = parseFloat(num1);
    let num2 = parseFloat(num2);

    if (operator === '+') {
      setResult(num1 + num2);
    } else if (operator === '-') {
      setResult(num1 - num2);
    } else if (operator === '*') {
      setResult(num1 * num2);
    } else if (operator === '/') {
      setResult(num1 / num2);
    }
  };

  const handleCalculate = () => {
    calculateResult();
  };

  return (
    <div className="calculator">
      <input
        id="num1"
        type="number"
        value={num1}
        onChange={handleNumberChange}
        placeholder="Enter first number"
      />
      <select value={operator} onChange={handleOperatorChange}>
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="*">*</option>
        <option value="/">/</option>
      </select>
      <input
        id="num2"
        type="number"
        value={num2}
        onChange={handleNumberChange}
        placeholder="Enter second number"
      />
      <button onClick={handleCalculate}>Calculate</button>
      <p>Result: {result}</p>
    </div>
  );
}

export default Calculator;
