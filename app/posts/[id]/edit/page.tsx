// app/posts/[id]/edit/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/components/navbar"
import { getPostById, updatePost, type Post } from "@/lib/api"
import { getStoredUser } from "@/lib/auth"

// Next.js의 PageProps 타입을 import 합니다.
// 'next'에서 직접 가져오거나, 'next/types'에서 가져올 수 있습니다.
// 일반적으로는 import { type PageProps } from 'next'; 로 충분합니다.
// 만약 Next.js 버전에 따라 PageProps가 없으면,
// { params: { id: string } } & { searchParams?: { [key: string]: string | string[] | undefined } }
// 와 같이 직접 정의할 수 있습니다.
import type { PageProps } from 'next';

// PageProps를 확장하여 params의 타입을 명확히 합니다.
interface EditPostPageProps extends PageProps<{ id: string }> {
  // PageProps가 제네릭으로 params 타입을 받을 수 있습니다.
  // 또는 명시적으로 params를 다시 정의해도 됩니다.
  // params: { id: string };
}


export default function EditPostPage({ params }: EditPostPageProps) {
  // ... (기존 코드와 동일)
  const [post, setPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const user = getStoredUser()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchPost = async () => {
      try {
        const data = await getPostById(Number.parseInt(params.id))

        if (data.authorUsername !== user.username) {
          setError("이 게시글을 수정할 권한이 없습니다.")
          return
        }

        setPost(data)
        setFormData({
          title: data.title,
          content: data.content,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return

    setSaving(true)
    setError(null)

    try {
      await updatePost(post.id, formData)
      router.push(`/posts/${post.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg border p-8">
              <div className="h-8 bg-gray-200 rounded mb-6"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">게시글 수정</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="게시글 제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  name="content"
                  required
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="게시글 내용을 입력하세요"
                  className="min-h-[300px]"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  취소
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "저장 중..." : "수정 완료"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  )
}