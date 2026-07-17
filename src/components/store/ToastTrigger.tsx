'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function ToastTrigger({ message, type = 'error' }: { message: string; type?: 'error' | 'success' }) {
  useEffect(() => {
    if (type === 'success') {
      toast.success(message)
    } else {
      toast.error(message)
    }
  }, [message, type])

  return null
}
