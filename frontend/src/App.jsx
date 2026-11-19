import { Navigate, Route, Routes } from 'react-router-dom'
import RouteProtegee from './auth/RouteProtegee.jsx'
import CartePublique from './carte/CartePublique.jsx'
import EspacePage from './pages/EspacePage.jsx'

export default function App() {
  return (
    <Routes>
      {/* Accueil public = carte plein écran (maquette de design), sans compte.
          Connexion et inscription se font dans une fenêtre modale par-dessus la carte. */}
      <Route path="/" element={<CartePublique />} />
      <Route path="/connexion" element={<Navigate to="/" replace state={{ auth: 'connexion' }} />} />
      <Route path="/inscription" element={<Navigate to="/" replace state={{ auth: 'inscription' }} />} />
      {/* Espace connecté : pas encore traité. */}
      <Route
        path="/espace"
        element={
          <RouteProtegee>
            <EspacePage />
          </RouteProtegee>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
