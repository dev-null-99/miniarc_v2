export function getUser() {
  const username = localStorage.getItem('username')
  const user_id  = localStorage.getItem('user_id')
  if (!username) return null
  return { username, user_id }
}

export function setAuth(token, username, user_id) {
  localStorage.setItem('token',    token)
  localStorage.setItem('username', username)
  localStorage.setItem('user_id',  String(user_id))
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('user_id')
}

export function isLoggedIn() {
  return !!localStorage.getItem('token')
}