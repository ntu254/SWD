import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        {/* Add routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
