import { useCallback, useEffect, useState } from 'react'

function requestFullscreen(el) {
  if (el.requestFullscreen) return el.requestFullscreen()
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen()
  return Promise.reject(new Error('Fullscreen not supported'))
}

function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen()
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen()
  return Promise.reject(new Error('Fullscreen not supported'))
}

function isActive() {
  return Boolean(
    document.fullscreenElement || document.webkitFullscreenElement,
  )
}

export function useFullscreen() {
  const [active, setActive] = useState(() => isActive())

  useEffect(() => {
    const sync = () => setActive(isActive())
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  const toggle = useCallback(async () => {
    try {
      if (isActive()) {
        await exitFullscreen()
      } else {
        await requestFullscreen(document.documentElement)
      }
    } catch {
      /* Some browsers block fullscreen; ignore */
    }
  }, [])

  return { isFullscreen: active, toggle }
}
