import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Services from './pages/Services'
import WhyCounselling from './pages/WhyCounselling'
import CounsellingBook from './pages/CounsellingBook'
import BookIndex from './pages/BookIndex'
import TrackRecord from './pages/TrackRecord'
import AboutUs from './pages/AboutUs'

import JLPTN5 from './pages/JLPTN5'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/why" element={<WhyCounselling />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book" element={<CounsellingBook />} />
          <Route path="/book/index" element={<BookIndex />} />
          <Route path="/track-record" element={<TrackRecord />} />
          <Route path="/jlpt-n5" element={<JLPTN5 />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
