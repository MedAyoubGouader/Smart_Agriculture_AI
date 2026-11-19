import { Route, Routes } from 'react-router-dom'
import RouteProtegee from './auth/RouteProtegee.jsx'
import EnTete from './components/EnTete.jsx'
import CartePage from './pages/CartePage.jsx'
import ConnexionPage from './pages/ConnexionPage.jsx'
import InscriptionPage from './pages/InscriptionPage.jsx'
import ProfilPage from './pages/ProfilPage.jsx'

export default function App() {
  return (
    <div className="application">
      <EnTete />
      <main id="contenu" className="contenu">
        <Routes>
          <Route path="/" element={<CartePage />} />
          <Route path="/connexion" element={<ConnexionPage />} />
          <Route path="/inscription" element={<InscriptionPage />} />
          <Route
            path="/profil"
            element={
              <RouteProtegee>
                <ProfilPage />
              </RouteProtegee>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
