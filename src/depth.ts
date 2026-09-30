import { useSpring } from 'motion/react'
import { useEffect, type PointerEvent, type RefObject } from 'react'
import { useMediaQuery, usePrefersReducedMotion } from './lib'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/**
 * Writes the pointer's place over the window to --tx and --ty (-1 to 1) on the
 * element, eased, so CSS can turn and shift layers in depth. Mouse and pen only;
 * nothing moves for touch or with reduced motion.
 */
export function usePointerDepth(ref: RefObject<HTMLElement | null>) {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !fine || reduced) return
    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let raf = 0
    const tick = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      el.style.setProperty('--tx', x.toFixed(4))
      el.style.setProperty('--ty', y.toFixed(4))
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onMove = (e: globalThis.PointerEvent) => {
      if (e.pointerType === 'touch') return
      tx = (e.clientX / window.innerWidth) * 2 - 1
      ty = (e.clientY / window.innerHeight) * 2 - 1
      kick()
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      kick()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      el.style.removeProperty('--tx')
      el.style.removeProperty('--ty')
    }
  }, [ref, fine, reduced])
}

/** A card that leans toward the pointer, the edge under it coming forward. */
export function useTilt(max = 7) {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = usePrefersReducedMotion()
  const rotateX = useSpring(0, { stiffness: 220, damping: 22 })
  const rotateY = useSpring(0, { stiffness: 220, damping: 22 })
  const enabled = fine && !reduced

  return {
    style: { rotateX, rotateY, transformPerspective: 900 },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return
      const r = e.currentTarget.getBoundingClientRect()
      rotateX.set(((e.clientY - r.top) / r.height - 0.5) * 2 * max)
      rotateY.set(-((e.clientX - r.left) / r.width - 0.5) * 2 * max)
    },
    onPointerLeave: () => {
      rotateX.set(0)
      rotateY.set(0)
    },
  }
}
