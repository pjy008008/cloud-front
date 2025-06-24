// app/posts/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"
import { getPostById, deletePost, type Post } from "@/lib/api"
import { getStoredUser } from "@/lib/auth"

// Next.js에서 제공하는 PageProps 타입을 import 합니다.
import type { PageProps } from 'next';

// 기존 PostPageProps 인터페이스는 이제 필요 없으므로 삭제합니다.
// interface PostPageProps {
//   params: {
//     id: string
//   }
// }

// PostPage 컴포넌트의 props 타입을 PageProps<{ id: string }>로 직접 지정합니다.
export default function PostPage({ params }: PageProps<{ id: string }>) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const user = getStoredUser()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(Number.parseInt(params.id))
        setPost(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id]) // 의존성 배열에 params.id만 있어도 됩니다.

  const handleDelete = async () => {
    // 사용자 권한 확인 로직 추가 (선택 사항이지만 안전을 위해 필요)
    if (!user || !post || user.username !== post.authorUsername) {
      setError("게시글을 삭제할 권한이 없습니다.")
      return
    }

    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return

    setDeleting(true)
    try {
      await deletePost(post.id)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post")
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // canEditPost 로직은 유지
  const canEditPost = user && post && user.username === post.authorUsername

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg border p-8">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-6 w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 에러 또는 게시글이 없는 경우 처리
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertDescription>{error || "Post not found"}</AlertDescription>
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
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-4">{post.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <Badge variant="secondary">{post.authorUsername}</Badge>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>

              {canEditPost && (
                <div className="flex space-x-2">
                  <Link href={`/posts/${post.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deleting ? "삭제 중..." : "삭제"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{post.content}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Link href="/">
            <Button variant="outline">목록으로 돌아가기</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}