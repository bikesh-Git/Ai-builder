import React, { useState } from 'react';
import './App.css';

function TodoList() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');

    const handleAddTodo = () => {
        setTodos([...todos, { text: newTodo, completed: false }]);
        setNewTodo('');
    };

    const handleDeleteTodo = (index) => {
        setTodos(todos.filter((todo, i) => i !== index));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add todo..."
                style={{
                    padding: 10,
                    border: '1px solid #ccc',
                    borderRadius: 5,
                    marginBottom: 20,
                }}
            />
            <button onClick={handleAddTodo} style={{ backgroundColor: '#4CAF50', color: '#fff' }}>
                Add Todo
            </button>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {todos.map((todo, index) => (
                    <li key={index}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() =>
                                setTodos(
                                    todos.map((t, i) =>
                                        i === index ? { ...t, completed: !t.completed } : t
                                    )
                                )
                            }
                        />
                        {todo.text}
                        <button onClick={() => handleDeleteTodo(index)} style={{ backgroundColor: '#FF69B4', color: '#fff' }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

export default TodoList;