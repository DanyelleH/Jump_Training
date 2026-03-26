import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000', // adjust if needed
})

// LOGIN FUNCTION
export const loginRequest = async (username, password) => {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)
  formData.append('grant_type', 'password')
  const response = await API.post(`/auth/login`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  return response.data
}

export const registerRequest = async (email, username, password, role) => {
    console.log('Registering user with:', { email, username, password, role })
  const response = await API.post('/auth/register', { email, username, password, role: 'user' })
  return response.data
}   