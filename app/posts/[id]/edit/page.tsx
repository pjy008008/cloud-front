"use client"

import { useEffect, useState } from "react"
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

export default function EditPostPageClient({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({ title: "", content: "" })
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
        const data = await getPostById(Number(id))

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
  }, [id, user, router])

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
    return <div className="p-6">로딩 중...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">게시글 수정</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="min-h-[300px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
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
