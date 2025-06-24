import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/lib/api"

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
            <Badge variant="secondary">{post.authorUsername}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 line-clamp-3 mb-2">{post.content}</p>
          <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
