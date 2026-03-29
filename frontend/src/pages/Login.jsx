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
      localStorage.setItem('role', data.role)
     
      // Redirect
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    }
  }

  return (
    <>
    <div className="login-container">
      <h2>Login</h2>

      {error && <p className="text-red-500">{error}</p>}

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
      <p>Don't have an account?</p>
      <button onClick={() => navigate('/register')}>Create an account</button>
    </div>
    </>
  )
}