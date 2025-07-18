import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Homepage from './pages/Homepage'
import Instruction from './pages/Instruction'
import SystemCheck from './pages/SystemCheck'
import ExamPage from './pages/ExamPage'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/instructions" element={<Instruction />} />
        <Route path="/system-check" element={<SystemCheck />} />
        <Route path="/exam" element={<ExamPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
