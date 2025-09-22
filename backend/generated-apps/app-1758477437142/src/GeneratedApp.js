import React, { useState } from 'react';
import './Portfolio.css';

export default function Portfolio() {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({});

    const handleAddProject = () => {
        setProjects([...projects, newProject]);
        setNewProject({});
    };

    return (
        <div className="portfolio-container">
            <h1>My Portfolio</h1>
            <ul>
                {projects.map((project, index) => (
                    <li key={index} style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
                        {project.name}
                    </li>
                ))}
            </ul>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddProject();
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px'
                }}
            >
                <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                    style={{
                        width: '100%',
                        height: '40px',
                        fontSize: '18px',
                        padding: '10px'
                    }}
                />
                <button type="submit" style={{ backgroundColor: '#4CAF50', color: '#fff' }}>
                    Add Project
                </button>
            </form>
        </div>
    );
}