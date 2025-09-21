import React from 'react';
import AuthContext from './components/AuthContext';
import Button from './components/Button';
import ButtonPad from './components/ButtonPad';
import Calculator from './components/Calculator';
import Display from './components/Display';
import FormInput from './components/FormInput';
import GreetingCard from './components/GreetingCard';
import HelloButton from './components/HelloButton';
import InputField from './components/InputField';
import LoginForm from './components/LoginForm';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SubmitButton from './components/SubmitButton';

function App() {
  return (
    <div className="App">
      <div style={{ padding: '20px' }}>
        <h1>Generated React App</h1>
        <AuthContext />
        <Button />
        <ButtonPad />
        <Calculator />
        <Display />
        <FormInput />
        <GreetingCard />
        <HelloButton />
        <InputField />
        <LoginForm />
        <LoginPage />
        <RegisterPage />
        <SubmitButton />
      </div>
    </div>
  );
}

export default App;