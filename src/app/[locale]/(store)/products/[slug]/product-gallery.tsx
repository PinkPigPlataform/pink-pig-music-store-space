'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-white via-gray-50/80 to-gray-100/50 rounded-3xl overflow-hidden relative border border-white shadow-[0_8px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-black/5 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <Download className="w-24 h-24" />
        </div>
      </div>
    )
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group relative aspect-square bg-gradient-to-br from-white via-gray-50/80 to-gray-100/50 rounded-3xl overflow-hidden border border-white shadow-[0_8px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-black/5 flex items-center justify-center">
        <Image
          src={images[activeIndex]}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          className="object-contain p-8 drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out group-hover:scale-[1.03]"
          priority
        />

        {/* Navigation Arrows (only if multi-image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white sm:flex hidden"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white sm:flex hidden"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails (only if multi-image) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative aspect-square w-20 sm:w-24 rounded-2xl overflow-hidden flex-shrink-0 bg-white border transition-all snap-start",
                activeIndex === idx
                  ? "border-pink-500 ring-2 ring-pink-500/20 shadow-md"
                  : "border-gray-100 hover:border-gray-200 shadow-sm"
              )}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                className={cn(
                  "object-contain p-2 drop-shadow-sm transition-opacity",
                  activeIndex === idx ? "opacity-100" : "opacity-70 hover:opacity-100"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
