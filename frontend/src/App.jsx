import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import WhyCounselling from './pages/WhyCounselling'
import Services from './pages/Services'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/why" element={<WhyCounselling />} />
          <Route path="/services" element={<Services />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
