import React from 'react'

export default function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to the Employee Management System</h1>
      <p>This is the home page. You can view and manage employee records here.</p>
      <button onClick={() => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        window.location.href = '/'
      }}>Logout</button>
    </div>
  )
}