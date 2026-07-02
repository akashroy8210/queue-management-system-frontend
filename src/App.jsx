import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Patient from './pages/Patient'
import Reception from "./pages/Reception"
import api from './api/api'
function App() {

  return (
    <div className="h-full w-full overflow-hidden bg-background">
      <Routes>
        Redirect base to /reception
        <Route path="/" element={<Navigate to="/reception" replace />} />

        <Route
          path="/reception"
          element={
            <Reception />
          }
        />

        <Route
          path="/patient"
          element={
            <Patient />
          }
        />
      </Routes>
    </div>
  )
}

export default App
