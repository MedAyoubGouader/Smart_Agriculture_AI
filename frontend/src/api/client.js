import axios from 'axios'

// Client HTTP unique pour l'API Django. En dev, Vite redirige /api vers le port 8000.
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export default api
