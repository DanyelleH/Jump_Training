import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { registerRequest } from '../api/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    // Basic validation
    if (!email) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (!username) {
      setError('Username is required')
      return
    }

    try {
      const response = await registerRequest(email, username, password, 'user')
      // notify user of success before navigating
      setSuccessMessage('Registration successful! Redirecting to login...')

      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

    return (
  <div className="login-page">
    <div className="login-card">
      <h2 className="login-title">Create Account</h2>

      {error && <p className="login-error">{error}</p>}
      {successMessage && <p className="login-success">{successMessage}</p>}

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

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
          Register
        </button>
      </form>

      <div className="login-footer">
        <p>Already have an account?</p>
        <button
          className="login-secondary-button"
          onClick={() => navigate('/')}
        >
          Login
        </button>
      </div>
    </div>
  </div>
)
}
