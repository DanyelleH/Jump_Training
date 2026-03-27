import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import axios from 'axios'
import * as authApi from '../api/auth'

// Mock axios
vi.mock('axios')

// Mock useNavigate
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})
// describe (component being tested)....
describe('Login Page', () => {
// what to do before each test is ran
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(localStorage).forEach(key => localStorage.removeItem(key))
  })

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  it('renders login form correctly', () => {
    renderLogin()
    screen.debug()

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    renderLogin()

    const button = screen.getByRole('button', { name: /login/i })

    fireEvent.click(button)

    // Only expect ONE error (username first)
    expect(await screen.findByText(/username is required/i)).toBeInTheDocument()

    // Ensure password error is NOT shown yet
    expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument()
  })

  it('displays error message when login fails', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    })

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'test@test.com' }
    })

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpassword' }
    })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })

  // it('redirects to home page on successful login', async () => {
  //   axios.post.mockResolvedValueOnce({
  //     data: {
  //       access_token: 'fake-jwt-token',
  //       role: 'admin'
  //     }
  //   })

  //   renderLogin()

  //   fireEvent.change(screen.getByPlaceholderText(/username/i), {
  //     target: { value: 'admin@test.com' }
  //   })

  //   fireEvent.change(screen.getByPlaceholderText(/password/i), {
  //     target: { value: 'password123' }
  //   })

  //   fireEvent.click(screen.getByRole('button', { name: /login/i }))

  //   await waitFor(() => {
  //     expect(mockNavigate).toHaveBeenCalledWith('/home')
  //   })
  // })

//   it('stores JWT on successful login', async () => {
//   loginRequest.mockResolvedValueOnce({
//     access_token: 'fake-jwt-token',
//     role: 'admin'
//   })

//   renderLogin()

//   fireEvent.change(screen.getByPlaceholderText(/username/i), {
//     target: { value: 'admin@test.com' }
//   })

//   fireEvent.change(screen.getByPlaceholderText(/password/i), {
//     target: { value: 'password123' }
//   })

//   fireEvent.click(screen.getByRole('button', { name: /login/i }))

//   await waitFor(() => {
//     expect(localStorage.getItem('token')).toBe('fake-jwt-token')
//   })
// })

})