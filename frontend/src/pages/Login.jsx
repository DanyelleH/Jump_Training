import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    // Basic validation
    if (!username) {
      setError('Username is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    const loginPayload = { username: username, password: password }

    try {
      const data = await loginRequest(loginPayload)

      // Store JWT
      localStorage.setItem('token', data.access_token)
      // access role when needed by decogind JWT payload instead of setting local storage item
      // localStorage.setItem('role', data.role)
     
      // Redirect
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    }
  }

  return (
  <div className="login-page">
    <div className="login-card">
      <h2 className="login-title">Welcome Back</h2>

      {error && <p className="login-error">{error}</p>}

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-button" type="submit">
          Login
        </button>
      </form>

      <div className="login-footer">
        <p>Don't have an account?</p>
        <button
          className="login-secondary-button"
          onClick={() => navigate('/register')}
        >
          Create an account
        </button>
      </div>
    </div>
  </div>
)
}