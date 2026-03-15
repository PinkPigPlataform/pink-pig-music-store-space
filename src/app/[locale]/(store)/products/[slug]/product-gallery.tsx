'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Download, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  // Autoplay
  useEffect(() => {
    if (images.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      handleNext()
    }, 3000)

    return () => clearInterval(interval)
  }, [handleNext, images.length, isPaused])

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-white via-gray-50/80 to-gray-100/50 rounded-3xl overflow-hidden relative border border-white shadow-[0_8px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-black/5 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <Download className="w-24 h-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Main Image */}
      <div 
        className="group relative aspect-[4/5] sm:aspect-square bg-gradient-to-br from-white via-gray-50/80 to-gray-200/30 rounded-[2rem] overflow-hidden border border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] ring-1 ring-black/5 flex items-center justify-center transition-all duration-500"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Image
          src={images[activeIndex]}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          className="object-contain p-4 sm:p-8 drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)] transition-all duration-700 ease-out group-hover:scale-[1.05]"
          priority
        />

        {/* Navigation Arrows (optimized for mobile/desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-gray-100 flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white hover:scale-110 active:scale-95 sm:flex hidden z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-gray-100 flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white hover:scale-110 active:scale-95 sm:flex hidden z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination dots for mobile */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden z-10">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeIndex === idx ? "w-6 bg-pink-500" : "w-1.5 bg-gray-300/60"
                  )} 
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails (only if multi-image) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide snap-x no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative aspect-square w-20 sm:w-24 rounded-2xl overflow-hidden flex-shrink-0 bg-white border transition-all duration-300 snap-start",
                activeIndex === idx
                  ? "border-pink-500 ring-4 ring-pink-500/10 shadow-lg scale-95"
                  : "border-gray-100 hover:border-gray-300 shadow-sm opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 80px, 96px"
                className="object-contain p-2 drop-shadow-sm"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
