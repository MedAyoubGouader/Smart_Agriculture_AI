import { createContext } from 'react'

// Utilisateur connecté + actions (connexion, inscription, déconnexion…), fourni par AuthProvider.
export const AuthContext = createContext(null)
