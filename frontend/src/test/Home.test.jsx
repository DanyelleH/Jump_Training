import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import * as employeeApi from '../api/employees'

console.log('LOCALSTORAGE:', localStorage)
console.log('TYPE OF CLEAR:', typeof localStorage.clear)

// Mock API layer
vi.mock('../api/employees', () => ({
  getEmployees: vi.fn(),
  getEmployeeById: vi.fn(),
  getEmployeesByDepartment: vi.fn(),
  addEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  updateEmployee: vi.fn(),
}))

describe('Employee Home Page', () => {

  beforeEach(() => {
  vi.clearAllMocks()

  // 🔥 Proper safe mock
  const store = {}

  vi.stubGlobal('localStorage', {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    }
  })
})

  const renderHome = (role = 'user') => {
    localStorage.setItem('role', role)
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
  }

  // 🧪 1. Render employee list
  it('renders a list of employees', async () => {
    employeeApi.getEmployees.mockResolvedValueOnce([
      { employee_id: '1', name: 'John Doe', department: 'IT' },
      { employee_id: '2', name: 'Jane Smith', department: 'HR' },
    ])

    renderHome()

    expect(await screen.findByText(/john doe/i)).toBeInTheDocument()
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument()
  })

  // 🧪 2. Guests cannot see employees
  it('prevents guests from viewing employees', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(await screen.findByText(/unauthorized/i)).toBeInTheDocument()
  })

  // // 🧪 3. Validate employee ID input
  it('validates required field for employee ID search', async () => {
  employeeApi.getEmployees.mockResolvedValueOnce([])

  renderHome()

  fireEvent.click(screen.getByRole('button', { name: /search by id/i }))

  expect(await screen.findByText(/employee id is required/i)).toBeInTheDocument()
})

  // // 🧪 4. Validate department input
  it('validates required field for department search', async () => {
    employeeApi.getEmployees.mockResolvedValueOnce([])

    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /search by department/i }))

    expect(await screen.findByText(/department is required/i)).toBeInTheDocument()
  })

  // // 🧪 5. Fetch employee by ID
  it('fetches employee by ID', async () => {
    employeeApi.getEmployeeById.mockResolvedValueOnce({
      employee_id: '1',
      name: 'John Doe'
    })

    renderHome()

    fireEvent.change(screen.getByPlaceholderText(/employee id/i), {
      target: { value: '1' }
    })

    fireEvent.click(screen.getByRole('button', { name: /search by id/i }))

    expect(await screen.findByText(/john doe/i)).toBeInTheDocument()
  })

  // // 🧪 6. Fetch employees by department
  it('fetches employees by department', async () => {
    employeeApi.getEmployeesByDepartment.mockResolvedValueOnce([
      { employee_id: '1', name: 'Jane Smith' }
    ])

    renderHome()

    fireEvent.change(screen.getByPlaceholderText(/department/i), {
      target: { value: 'HR' }
    })

    fireEvent.click(screen.getByRole('button', { name: /search by department/i }))

    expect(await screen.findByText(/jane smith/i)).toBeInTheDocument()
  })
})