import { Route, Routes } from 'react-router-dom'
import CartePage from './pages/CartePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CartePage />} />
    </Routes>
  )
}
