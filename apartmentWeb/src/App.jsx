import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import SearchPage from './components/SearchPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <>
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'search' && <SearchPage />}
    </>
  )
}

export default App
