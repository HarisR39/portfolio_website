"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

export type RevealItem = {
  label: string
  eyebrow: string
  blurb: string
  color: string
  colorDark: string
  icon?: React.ReactNode
}

export type ScrollRevealProps = {
  items: RevealItem[]
  /** Scroll distance per item, in vh. Matches the prototype's 225vh-per-segment budget. */
  segmentVh?: number
  /**
   * Called (only on change) with whether a fully opaque panel currently covers
   * the whole viewport - true for essentially the entire pinned range (each
   * later panel paints over the last), false only during the brief opening
   * moment before the first panel has started rising. Lets a caller pause
   * whatever sits behind this component (e.g. a WebGL background) without
   * that background needing to know anything about this component's geometry.
   */
  onOpaqueChange?: (opaque: boolean) => void
}

// Perceived luminance of the item's top gradient stop, used to pick readable
// text/icon color automatically instead of hardcoding a light/dark flag per item.
function getReadableTextColor(hex: string): string {
  const clean = hex.replace("#", "")
  if (clean.length !== 6) return "#f4f1e8"
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? "#12151a" : "#f4f1e8"
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

// Cubic ease-in-out, same curve as the prototype.
function ease(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
}

type Point = [number, number]

// A wide, rounded-tip peak that flares to full width partway down (the "roof"),
// then a plain full-width rectangle for the rest (the "body"). Built in real
// pixels so it stays proportional at any screen size.
function buildRestPoints(width: number, bodyBottomY: number, roofHeight: number): Point[] {
  // A small fillet right at the point - wide arcs here read as a dome, not a
  // triangle. This keeps the roof's straight diagonal edges intact and only
  // rounds the very tip.
  const tipRadius = clamp(width * 0.018, 14, 36)
  const shoulderDeg = 20
  const steps = 8
  const overshoot = width * 0.03
  const apexX = width / 2

  const pts: Point[] = []
  pts.push([-overshoot, bodyBottomY])
  pts.push([-overshoot, roofHeight])

  for (let i = 0; i <= steps; i++) {
    const deg = -shoulderDeg + (2 * shoulderDeg * i) / steps
    const rad = (deg * Math.PI) / 180
    const x = apexX + tipRadius * Math.sin(rad)
    const y = tipRadius - tipRadius * Math.cos(rad)
    pts.push([x, y])
  }

  pts.push([width + overshoot, roofHeight])
  pts.push([width + overshoot, bodyBottomY])
  return pts
}

function pointsToPolygon(pts: Point[]): string {
  return `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",")})`
}

export default function ScrollReveal({ items, segmentVh = 340, onOpaqueChange }: ScrollRevealProps) {
  const spacerRef = useRef<HTMLDivElement | null>(null)
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([])
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const [reducedMotion, setReducedMotion] = useState(false)
  // Read inside the scroll loop via ref rather than closing over the prop, so
  // an unmemoized inline callback from the caller doesn't force the scroll
  // effect below to tear down and reattach its listeners on every render.
  const onOpaqueChangeRef = useRef(onOpaqueChange)
  useEffect(() => {
    onOpaqueChangeRef.current = onOpaqueChange
  }, [onOpaqueChange])

  // Detected client-side only, after hydration - see the static fallback branch below.
  useEffect(() => {
    if (typeof window === "undefined") return
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(query.matches)
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return
    const segments = items.length
    if (!segments) return

    let vh = 0
    let extraRise = 0
    let restPoints: Point[] = []
    // Only 1-2 segments are ever mid-transition at once; the rest sit at a
    // constant shiftY (fully hidden below, or fully settled above). Tracking
    // each segment's phase lets those idle ones skip the clip-path polygon
    // rebuild (an array map + string join per segment) once they've already
    // reached that constant state, instead of redoing it every frame forever.
    type Phase = "hidden" | "active" | "settled"
    let phases: (Phase | undefined)[] = []
    // The first segment is the only one with nothing opaque behind it, so
    // full coverage begins exactly once *it* finishes settling - every
    // segment after that paints over an already-opaque predecessor.
    const opaqueFrom = 1 / segments
    let lastReportedOpaque: boolean | undefined

    const recomputeGeometry = () => {
      // Measure the panel's own rendered width (not window.innerWidth) so the
      // shape's apex lands at exactly the same center the text flexbox uses -
      // any mismatch (e.g. scrollbar width) would throw the two out of sync.
      const vw = spacerRef.current?.getBoundingClientRect().width ?? window.innerWidth
      vh = window.innerHeight
      const roofHeight = vh * 0.3
      extraRise = roofHeight + 20
      const boxH = vh + extraRise
      restPoints = buildRestPoints(vw, boxH, roofHeight)
      const staticClip = pointsToPolygon(restPoints)
      shapeRefs.current.forEach((shape) => {
        if (!shape) return
        shape.style.height = `${boxH}px`
        shape.style.clipPath = staticClip
      })
      // Geometry changed, so every segment's cached constant-phase output is
      // stale - force the next update() to recompute all of them once.
      phases = []
    }

    const update = () => {
      const spacer = spacerRef.current
      if (!spacer) return
      const rect = spacer.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const overall = clamp((0 - rect.top) / Math.max(scrollable, 1), 0, 1)

      // Stays true all the way through overall === 1 - the last segment is
      // still fully settled and opaque there too, right up until the pin
      // itself releases and scrolls away (a brief tail this doesn't track,
      // since it's a fixed ~100vh regardless of item count and staying
      // "paused" a moment longer during it is not visually wrong either).
      const opaque = overall >= opaqueFrom
      if (opaque !== lastReportedOpaque) {
        lastReportedOpaque = opaque
        onOpaqueChangeRef.current?.(opaque)
      }

      for (let seg = 0; seg < segments; seg++) {
        const segStart = seg / segments
        const segEnd = (seg + 1) / segments
        const local = clamp((overall - segStart) / (segEnd - segStart), 0, 1)
        const phase: Phase = local <= 0 ? "hidden" : local >= 1 ? "settled" : "active"

        // Hidden/settled segments have a fixed shiftY - once that's been
        // applied, redoing the same work every frame is pure waste.
        if (phase !== "active" && phases[seg] === phase) continue
        phases[seg] = phase

        const eased = ease(local)
        // shiftY: vh (fully hidden below the viewport) at eased=0, down to
        // -extraRise (risen past "settled", tip tucked above the top) at eased=1.
        const shiftY = (1 - eased) * vh - eased * extraRise

        const shapeEl = shapeRefs.current[seg]
        if (shapeEl) shapeEl.style.transform = `translateY(${shiftY.toFixed(1)}px)`

        const contentEl = contentRefs.current[seg]
        if (contentEl) {
          const shifted: Point[] = restPoints.map((p) => [p[0], p[1] + shiftY])
          contentEl.style.clipPath = pointsToPolygon(shifted)
        }
      }
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        update()
        ticking = false
      })
    }
    const onResize = () => {
      recomputeGeometry()
      update()
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    recomputeGeometry()
    update()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      if (lastReportedOpaque) onOpaqueChangeRef.current?.(false)
    }
  }, [items.length, reducedMotion])

  if (reducedMotion) {
    return (
      <div className="scroll-reveal-static">
        {items.map((item) => (
          <div
            key={item.label}
            className="scroll-reveal-static-item"
            style={
              {
                background: `linear-gradient(180deg, ${item.color} 0%, ${item.colorDark} 100%)`,
                "--reveal-text-color": getReadableTextColor(item.color),
              } as CSSProperties
            }
          >
            {item.icon && <div className="scroll-reveal-icon">{item.icon}</div>}
            <span className="scroll-reveal-eyebrow">{item.eyebrow}</span>
            <h2 className="scroll-reveal-label">{item.label}</h2>
            <p className="scroll-reveal-blurb">{item.blurb}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={spacerRef} className="scroll-reveal-spacer" style={{ height: `${items.length * segmentVh}vh` }}>
      <div className="scroll-reveal-panel">
        {items.map((item, idx) => (
          <div className="scroll-reveal-layer" key={item.label} style={{ zIndex: idx + 1 }}>
            <div
              className="scroll-reveal-shape"
              ref={(el) => {
                shapeRefs.current[idx] = el
              }}
              style={{ background: `linear-gradient(180deg, ${item.color} 0%, ${item.colorDark} 100%)` }}
            />
            <div
              className="scroll-reveal-content"
              ref={(el) => {
                contentRefs.current[idx] = el
              }}
              style={{ "--reveal-text-color": getReadableTextColor(item.color) } as CSSProperties}
            >
              <div className="scroll-reveal-inner">
                {item.icon && <div className="scroll-reveal-icon">{item.icon}</div>}
                <span className="scroll-reveal-eyebrow">{item.eyebrow}</span>
                <h2 className="scroll-reveal-label">{item.label}</h2>
                <p className="scroll-reveal-blurb">{item.blurb}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
