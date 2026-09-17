import axios from 'axios'

const API = axios.create({
  // baseURL ko humne permanently tumhare Render API par point kar diya hai
  baseURL: 'https://miniarc-v2.onrender.com',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.authorization = token
  return config
})

export default API