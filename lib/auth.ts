export interface User {
  username: string
  token: string
}

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("user")
  return stored ? JSON.parse(stored) : null
}

export const setStoredUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user))
}

export const removeStoredUser = () => {
  localStorage.removeItem("user")
}

export const getAuthHeaders = (): Record<string, string> => {
  const user = getStoredUser()
  return user ? { Authorization: `Bearer ${user.token}` } : {}
}
