import { Outlet, Route, Routes } from 'react-router-dom'
import RouteProtegee from './auth/RouteProtegee.jsx'
import CartePublique from './carte/CartePublique.jsx'
import EnTete from './components/EnTete.jsx'
import ConnexionPage from './pages/ConnexionPage.jsx'
import EspacePage from './pages/EspacePage.jsx'
import InscriptionPage from './pages/InscriptionPage.jsx'

// Pages de compte : en-tête clair + contenu.
function MiseEnPageCompte() {
  return (
    <div className="application">
      <EnTete />
      <main id="contenu" className="contenu">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Accueil public = carte plein écran (maquette de design), sans compte. */}
      <Route path="/" element={<CartePublique />} />
      <Route element={<MiseEnPageCompte />}>
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
      </Route>
      {/* Espace connecté : pas encore traité. */}
      <Route
        path="/espace"
        element={
          <RouteProtegee>
            <EspacePage />
          </RouteProtegee>
        }
      />
    </Routes>
  )
}
