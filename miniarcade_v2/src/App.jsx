import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Menu from './pages/Menu'
import GamePage from './pages/GamePage'
import Scores from './pages/Scores'
import { isLoggedIn } from './lib/auth'

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/games"     element={<Menu />} />
        <Route path="/play/:id"  element={<GamePage />} />
        <Route path="/scores"    element={
          <PrivateRoute><Scores /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}