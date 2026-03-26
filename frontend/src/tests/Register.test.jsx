import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import axios from 'axios'
// Mock useNavigate BEFORE importing Register
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})
import Register from '../pages/Register'
import { BrowserRouter } from 'react-router-dom'

// Mock axios
vi.mock('axios')

// ...existing code...

// Helper to render component
const renderRegister = () => {
  render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  )
}

describe('Register Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ✅ 1. Render form
  it('renders registration form correctly', () => {
    renderRegister()

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  // ✅ 2. Required field validation
  it('shows validation errors when fields are empty', async () => {
    renderRegister()

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })
  })

  // ✅ 3. API failure
  it('displays error message when registration fails', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { detail: 'Registration failed' }
      }
    })

    renderRegister()

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@test.com' }
    })

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    })

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' }
    })

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument()
    })
  })

  // ✅ 4. Successful registration
  // it('redirects to login on successful registration', async () => {
  //   axios.post.mockResolvedValueOnce({
  //     data: { message: 'User created successfully' }
  //   })

  //   renderRegister()

  //   fireEvent.change(screen.getByPlaceholderText(/email/i), {
  //     target: { value: 'test@test.com' }
  //   })

  //   fireEvent.change(screen.getByPlaceholderText(/password/i), {
  //     target: { value: 'password123' }
  //   })

  //   fireEvent.change(screen.getByPlaceholderText(/username/i), {
  //     target: { value: 'testuser' }
  //   })

  //   fireEvent.click(screen.getByRole('button', { name: /register/i }))

  //   await waitFor(() => {
  //     expect(mockNavigate).toHaveBeenCalledWith('/')
  //   })
  // })

})