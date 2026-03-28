import axios from 'axios'

const API_URL = "http://34.202.165.57:8000";
const API = axios.create({
  baseURL: 'http://localhost:8000'  // adjust if needed
})

// LOGIN FUNCTION
export const loginRequest = async (loginPayload) => {
  console.log('Login payload:', loginPayload)
  // const formData = new URLSearchParams()
  // formData.append('username', loginPayload.username)
  // formData.append('password', loginPayload.password)
  // formData.append('grant_type', 'password')
  const response = await API.post(`/auth/login`, loginPayload, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log('Login response:', response.data)
  return response.data
}

export const registerRequest = async (email, username, password, role) => {
    console.log('Registering user with:', { email, username, password, role })
  const response = await API.post('/auth/register', { email, username, password, role: 'user' })
  return response.data
}   