'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function MetaPixel() {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  // O primeiro PageView já é disparado dentro do script de init.
  // Este efeito cobre apenas as navegações seguintes (App Router = SPA).
  useEffect(() => {
    if (!PIXEL_ID) return
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.fbq?.('track', 'PageView')
  }, [pathname, PIXEL_ID])

  if (!PIXEL_ID) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `}</Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
