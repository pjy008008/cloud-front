import { getAuthHeaders } from "./auth"

const API_BASE_URL = "http://3.87.129.184:8080/api"

export interface Post {
  id: number
  title: string
  content: string
  authorUsername: string
  createdAt: string
}

export interface CreatePostRequest {
  title: string
  content: string
}

export interface UpdatePostRequest {
  title: string
  content: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegistrationRequest {
  username: string
  password: string
}

// Auth API
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "Login failed")
  }

  return response.json()
}

export const register = async (data: RegistrationRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "Registration failed")
  }

  return response.text()
}

// Posts API
export const getAllPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE_URL}/posts`)

  if (!response.ok) {
    throw new Error("Failed to fetch posts")
  }

  return response.json()
}

export const getPostById = async (id: number): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch post")
  }

  return response.json()
}

export const createPost = async (data: CreatePostRequest): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to create post")
  }

  return response.json()
}

export const updatePost = async (id: number, data: UpdatePostRequest): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to update post")
  }

  return response.json()
}

export const deletePost = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete post")
  }
}
