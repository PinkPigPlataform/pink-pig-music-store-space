'use client'

import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'

interface YouTubeEmbedProps {
  url: string
  title?: string
}

export default function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Extrair ID do vídeo do Youtube
  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const videoId = getYouTubeID(url)

  if (!videoId) return null

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  if (!isPlaying) {
    return (
      <div 
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group cursor-pointer"
        onClick={() => setIsPlaying(true)}
      >
        <img 
          src={thumbnailUrl} 
          alt={title || 'Saiba mais'} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
            <Play className="w-8 h-8 fill-current" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-gray-200 shadow-lg">
      <iframe
        src={embedUrl}
        title={title || 'YouTube video player'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      ></iframe>
    </div>
  )
}
