import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000/employees',
})

// Attach JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* =========================
   GET ALL
   ========================= */
export const getEmployees = async () => {
  const res = await API.get('/')
  return res.data
}

/* =========================
   GET BY ID
   ========================= */
export const getEmployeeById = async (employeeId) => {
  const res = await API.get(`/${employeeId}`)
  return res.data
}

/* =========================
   GET BY DEPARTMENT
   ========================= */
export const getEmployeesByDepartment = async (department) => {
  const res = await API.get(`/department/${department}`)
  return res.data
}

/* =========================
   ADD EMPLOYEE
   ========================= */
export const addEmployee = async (employee) => {
  // ensure correct structure
  const payload = {
    employee_id: employee.employee_id,
    name: employee.name,
    email: employee.email,
    position: employee.position,
    department: employee.department,
    salary: Number(employee.salary),
    status: employee.status,
  }

  const res = await API.post('/', payload)
  return res.data
}

/* =========================
   DELETE
   ========================= */
export const deleteEmployee = async (employeeId) => {
  const res = await API.delete(`/${employeeId}`)
  return res.data
}

/* =========================
   UPDATE
   ========================= */
export const updateEmployee = async (employeeId, updateData) => {
  const res = await API.put(`/${employeeId}`, updateData)
  return res.data
}