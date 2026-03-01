'use client'

import { useEffect } from 'react'
import { tenantConfig } from '@/config/tenant'

export function TenantThemeInjector() {
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--color-brand',
      tenantConfig.primaryColor
    )
  }, [])
  return null
}
