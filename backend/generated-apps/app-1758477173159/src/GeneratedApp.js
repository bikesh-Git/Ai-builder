import React, { useState } from 'react';
import './App.css';

export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');

    const handleAdd = () => {
        if (newTodo) {
            setTodos([...todos, { text: newTodo, completed: false }]);
            setNewTodo('');
        }
    };

    const handleDelete = (index) => {
        setTodos(todos.filter((todo, i) => i !== index));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add new todo"
                style={{
                    padding: 10,
                    border: '1px solid #ccc',
                    borderRadius: 5,
                    marginBottom: 20,
                }}
            />
            <button onClick={handleAdd} style={{ padding: 10, backgroundColor: '#4CAF50', color: '#fff' }}>
                Add
            </button>
            <ul>
                {todos.map((todo, index) => (
                    <li key={index}>
                        {todo.text}
                        {' '}
                        <span
                            style={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? '#aaa' : '#000',
                            }}
                        >
                            {' '}
                            {todo.completed ? 'Completed' : 'Not completed'}
                        </span>
                        {' '}
                        <button onClick={() => handleDelete(index)} style={{ padding: 5, backgroundColor: '#FF69B4', color: '#fff' }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}