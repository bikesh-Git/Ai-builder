import React, { useState } from 'react';
import './App.css';

function TodoList() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');

    function handleAddTodo(event) {
        event.preventDefault();
        setTodos([...todos, { text: newTodo, completed: false }]);
        setNewTodo('');
    }

    function handleDeleteTodo(index) {
        setTodos(todos.filter((todo, i) => i !== index));
    }

    function handleCompleteTodo(index) {
        const updatedTodos = [...todos];
        updatedTodos[index].completed = !updatedTodos[index].completed;
        setTodos(updatedTodos);
    }

    return (
        <div style={{ width: '300px', margin: '0 auto' }}>
            <h2>Todo List</h2>
            <form onSubmit={handleAddTodo}>
                <input
                    type="text"
                    value={newTodo}
                    onChange={(event) => setNewTodo(event.target.value)}
                    placeholder="Enter new todo"
                    style={{ width: '100%', height: '30px', padding: '10px' }}
                />
                <button type="submit">Add</button>
            </form>
            <ul>
                {todos.map((todo, index) => (
                    <li key={index} style={{ listStyle: 'none', padding: '10px' }}>
                        {todo.text}
                        {' '}
                        {(todo.completed ? <s>{todo.text}</s> : todo.text)}
                        {' '}
                        {todo.completed ? (
                            <button onClick={() => handleCompleteTodo(index)}>Undo</button>
                        ) : (
                            <button onClick={() => handleCompleteTodo(index)}>Complete</button>
                        )}
                        {' '}
                        <button onClick={() => handleDeleteTodo(index)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );

export default TodoList;