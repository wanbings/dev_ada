import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import SearchPage from './components/SearchPage'
import AuthPage from './components/AuthPage'
import FavoritesPage from './components/FavoritesPage'
import AboutUs from './components/AboutUs'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <>
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'search' && <SearchPage />}
      {currentPage === 'auth' && <AuthPage />}
      {currentPage === 'favorites' && <FavoritesPage />}
      {currentPage === 'about' && <AboutUs />}
    </>
  )
}

export default App
