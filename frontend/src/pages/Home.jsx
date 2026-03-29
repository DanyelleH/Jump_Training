import React, { useEffect, useState } from 'react'
import {
  getEmployees,
  getEmployeeById,
  getEmployeesByDepartment,
  addEmployee,
  deleteEmployee,
  updateEmployee
} from '../api/employees'

export default function Home() {
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState('')

  const [employeeId, setEmployeeId] = useState('')
  const [department, setDepartment] = useState('')

  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    email: '',
    position: '',
    department: '',
    salary: '',
    status: ''
  })
  const [openSection, setOpenSection] = useState(null)
  const [updateName, setUpdateName] = useState('')
  const [selectedField, setSelectedField] = useState('')
  const [updateData, setUpdateData] = useState({})
  const updatableFields = [
  'name',
  'email',
  'position',
  'department',
  'salary',
  'status'
]
const toggleSection = (section) => {
  setOpenSection(prev => (prev === section ? null : section))
}
  const handleAddField = () => {
  if (!selectedField) return

  setUpdateData(prev => ({
    ...prev,
    [selectedField]: ''
  }))

  setSelectedField('')
}
const handleFieldChange = (field, value) => {
  setUpdateData(prev => ({
    ...prev,
    [field]: value
  }))
}
const handleRemoveField = (field) => {
  const updated = { ...updateData }
  delete updated[field]
  setUpdateData(updated)
}
  const role = localStorage.getItem('role')

  // 🔒 Block guests
  if (!role) {
    return <p>Unauthorized</p>
  }

  // 📦 Load all employees
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getEmployees()
        setEmployees(data)
      } catch {
        setError('Failed to fetch employees')
      }
    }

    fetchData()
  }, [])

  // 🔍 Search by ID
  const handleSearchById = async () => {
    if (!employeeId) {
      setError('Employee ID is required')
      return
    }

    try {
      const data = await getEmployeeById(employeeId)
      setEmployees([data])
      setError('')
    } catch {
      setError('Employee not found')
    }
  }

  // 🔍 Search by Department
  const handleSearchByDept = async () => {
    if (!department) {
      setError('Department is required')
      return
    }

    try {
      const data = await getEmployeesByDepartment(department)
      setEmployees(data)
      setError('')
    } catch {
      setError('No employees found')
    }
  }

  // ➕ Add employee
  const handleAddEmployee = async () => {
    try {
      await addEmployee(newEmployee)
        const data = await getEmployees()
        setEmployees(data)
      setError('')
    } catch {
      setError('Failed to add employee')
    }
  }

  // ❌ Delete employee
  const handleDelete = async (employee_id) => {
    try {
      await deleteEmployee(employee_id)
      setEmployees((prev) =>
        prev.filter(emp => emp.employee_id !== employee_id)
      )
    } catch {
      setError('Failed to delete')
    }
  }

  // ✏️ Update employee
  const handleUpdate = async () => {
  if (!employeeId) {
    setError('Employee ID is required')
    return
  }

  if (Object.keys(updateData).length === 0) {
    setError('Select at least one field to update')
    return
  }

  try {
    await updateEmployee(employeeId, updateData)

    const data = await getEmployees()
    setEmployees(data)

    setUpdateData({})
    setError('')
  } catch {
    setError('Failed to update')
  }
}

  // 🧠 Controlled form handler
  const handleChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value
    })
  }

  return (
  <div className="login-page">
    <div className="dashboard-container">

      <h2 className="dashboard-title">Employee Dashboard</h2>

      {error && <p className="login-error">{error}</p>}

      {/* 🔍 SEARCH SECTION */}
      <div className="dashboard-card">
        <div
          className="accordion-header"
          onClick={() => toggleSection('search')}
        >
          <h3>Search Employees</h3>
          <span>{openSection === 'search' ? '−' : '+'}</span>
        </div>

        {openSection === 'search' && (
          <div className="accordion-content">
            <div className="form-row">
              <input
                className="login-input"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
              <button className="login-button" onClick={handleSearchById}>
                Search by ID
              </button>
            </div>

            <div className="form-row">
              <input
                className="login-input"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
              <button className="login-button" onClick={handleSearchByDept}>
                Search by Department
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ➕ ADD SECTION */}
      {role === 'admin' && (
        <div className="dashboard-card">
          <div
            className="accordion-header"
            onClick={() => toggleSection('add')}
          >
            <h3>Add Employee</h3>
            <span>{openSection === 'add' ? '−' : '+'}</span>
          </div>

          {openSection === 'add' && (
            <div className="accordion-content">
              <div className="form-grid">
                {Object.keys(newEmployee).map((field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field}
                    className="login-input"
                    onChange={handleChange}
                  />
                ))}
              </div>

              <button className="login-button" onClick={handleAddEmployee}>
                Add Employee
              </button>
            </div>
          )}
        </div>
      )}

      {/* ✏️ UPDATE SECTION */}
      {role === 'admin' && (
        <div className="dashboard-card">
          <div
            className="accordion-header"
            onClick={() => toggleSection('update')}
          >
            <h3>Update Employee</h3>
            <span>{openSection === 'update' ? '−' : '+'}</span>
          </div>

          {openSection === 'update' && (
            <div className="accordion-content">
              <input
                className="login-input"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />

              <div className="form-row">
                <select
                  className="login-input"
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                >
                  <option value="">Select field</option>
                  {updatableFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>

                <button className="login-button" onClick={handleAddField}>
                  Add Field
                </button>
              </div>

              <div className="update-fields">
                {Object.keys(updateData).map((field) => (
                  <div key={field} className="update-row">
                    <input
                      className="login-input"
                      value={updateData[field]}
                      onChange={(e) =>
                        handleFieldChange(field, e.target.value)
                      }
                    />
                    <button
                      className="danger-button"
                      onClick={() => handleRemoveField(field)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button className="login-button" onClick={handleUpdate}>
                Update Employee
              </button>
            </div>
          )}
        </div>
      )}

      {/* 📋 EMPLOYEE LIST */}
      <div className="dashboard-card">
        <h3>Employees</h3>

        <div className="employee-list">
          {employees.map((emp) => (
            <div key={emp.employee_id} className="employee-card">
              <div>
                <strong>{emp.name}</strong>
                <p>{emp.employee_id}</p>
              </div>

              <p>{emp.email}</p>
              <p>{emp.position} • {emp.department}</p>
              <p>${emp.salary} • {emp.status}</p>

              {role === 'admin' && (
                <button
                  className="danger-button"
                  onClick={() => handleDelete(emp.employee_id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        className="logout-button"
        onClick={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('role')
          window.location.href = '/'
        }}
      >
        Logout
      </button>
    </div>
  </div>
  )
}