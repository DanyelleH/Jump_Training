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
    <div>
      <h2>Employee Dashboard</h2>

      {error && <p>{error}</p>}

      {/* 🔍 Search Section */}
      <div>
        <input
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <button onClick={handleSearchById}>Search by ID</button>
      </div>

      <div>
        <input
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <button onClick={handleSearchByDept}>Search by Department</button>
      </div>

      {/* ➕ Admin Actions */}
      {role === 'admin' && (
        <div>
          <h3>Add Employee</h3>

          <input name="employee_id" placeholder="Employee ID" onChange={handleChange} />
          <input name="name" placeholder="Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="position" placeholder="Position" onChange={handleChange} />
          <input name="department" placeholder="Department" onChange={handleChange} />
          <input name="salary" placeholder="Salary" onChange={handleChange} />
          <input name="status" placeholder="Status" onChange={handleChange} />

          <button onClick={handleAddEmployee}>Add Employee</button>

         <h3>Update Employee</h3>

            <input
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />

            {/* Dropdown */}
            <select
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

            <button onClick={handleAddField}>Add Field</button>

            {/* Dynamic Fields */}
            <div style={{ marginTop: '10px' }}>
              {Object.keys(updateData).map((field) => (
                <div key={field} style={{ marginBottom: '8px' }}>
                  <label style={{ marginRight: '8px' }}>{field}:</label>

                  <input
                    value={updateData[field]}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                  />

                  <button onClick={() => handleRemoveField(field)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button onClick={handleUpdate}>Update</button>
        </div>
      )}

      {/* 📋 Employee List */}
      <ul>
        {employees.map((emp) => (
          <li key={emp.employee_id}>
            <strong>{emp.name}</strong> ({emp.employee_id}) <br />
            {emp.email} | {emp.position} | {emp.department} <br />
            ${emp.salary} | {emp.status}

            {role === 'admin' && (
              <button onClick={() => handleDelete(emp.employee_id)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
      <button onClick={() => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        window.location.href = '/'
      }}>Logout</button>
    </div>
  )
}