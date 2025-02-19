import { useState, useEffect } from 'react'
import './App.css'
import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import { supabase } from './supabase';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  user_id: string;
}

function App() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)
        .order('id', { ascending: true });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !user) return

    const newTodo = {
      text: inputValue.trim(),
      completed: false,
      user_id: user.id
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([newTodo])
        .select()

      if (error) throw error;
      if (data) {
        setTodos([...todos, data[0]])
        setInputValue('')
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }

  const toggleTodo = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Todo List</h1>
        <button onClick={logout} className="logout-button">Logout</button>
      </div>
      <form onSubmit={handleAddTodo} className="todo-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo(e)}
            placeholder="Press Enter to add a new task..."
            className="todo-input"
            autoFocus
          />
          {inputValue && (
            <button type="submit" className="submit-icon" aria-label="Add todo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </form>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="todo-checkbox"
            />
            <span className="todo-text">{todo.text}</span>
            <div
              onClick={() => deleteTodo(todo.id)}
              className="delete-button"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && deleteTodo(todo.id)}
              aria-label="Delete todo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App