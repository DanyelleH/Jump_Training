import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import * as employeeApi from '../api/employees'

// Mock API layer
vi.mock('../api/employees', () => ({
  getEmployees: vi.fn(),
  getEmployeeById: vi.fn(),
  getEmployeesByDepartment: vi.fn(),
  addEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  updateEmployee: vi.fn(),
}))

// 🔥 helper to create fake JWT
function createMockToken(role) {
  const payload = btoa(JSON.stringify({ role }))
  return `header.${payload}.signature`
}

describe('Employee Home Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()

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
    // 🔥 SET TOKEN (NOT role)
    localStorage.setItem('token', createMockToken(role))

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

  // 🧪 3. Validate employee ID input
  it('validates required field for employee ID search', async () => {
    employeeApi.getEmployees.mockResolvedValueOnce([])

    renderHome()

    // 1. Open accordion
  fireEvent.click(screen.getByText(/search employees/i))

  // 2. Now button exists → click it
  fireEvent.click(screen.getByRole('button', { name: /search by id/i }))

    expect(await screen.findByText(/employee id is required/i)).toBeInTheDocument()
  })

  // 🧪 4. Validate department input
  it('validates required field for department search', async () => {
    employeeApi.getEmployees.mockResolvedValueOnce([])

    renderHome()
    // 1. Open accordion
    fireEvent.click(screen.getByText(/search employees/i))
    fireEvent.click(screen.getByRole('button', { name: /search by department/i }))

    expect(await screen.findByText(/department is required/i)).toBeInTheDocument()
  })

  // 🧪 5. Fetch employee by ID
  it('fetches employee by ID', async () => {
  employeeApi.getEmployees.mockResolvedValueOnce([])
  employeeApi.getEmployeeById.mockResolvedValueOnce({
    employee_id: '1',
    name: 'John Doe'
  })

  renderHome()

  // 🔥 Step 1: open accordion
  fireEvent.click(screen.getByText(/search employees/i))

  // 🔥 Step 2: now input exists
  fireEvent.change(screen.getByPlaceholderText(/employee id/i), {
    target: { value: '1' }
  })

  // 🔥 Step 3: click button
  fireEvent.click(screen.getByRole('button', { name: /search by id/i }))

  // 🔥 Step 4: assert
  expect(await screen.findByText(/john doe/i)).toBeInTheDocument()
})

  // 🧪 6. Fetch employees by department
  it('fetches employees by department', async () => {
    employeeApi.getEmployees.mockResolvedValueOnce([])
    employeeApi.getEmployeesByDepartment.mockResolvedValueOnce([
      { employee_id: '1', name: 'Jane Smith' }
    ])

    renderHome()
    fireEvent.click(screen.getByText(/search employees/i))
    fireEvent.change(screen.getByPlaceholderText(/department/i), {
      target: { value: 'HR' }
    })

    fireEvent.click(screen.getByRole('button', { name: /search by department/i }))

    expect(await screen.findByText(/jane smith/i)).toBeInTheDocument()
  })
})