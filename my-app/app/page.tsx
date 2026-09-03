"use client"
// app/page.tsx
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import PillNavRaw from "../components/PillNav"
import ScrollReveal, { type RevealItem } from "../components/ScrollReveal"
import DriftWall, { type DriftWallItem } from "../components/DriftWall"

type PillNavItem = { href: string; label: string; ariaLabel?: string }

type PillNavProps = {
  logo: string
  logoAlt?: string
  items: PillNavItem[]
  activeHref?: string
  className?: string
  ease?: string
  baseColor?: string
  pillColor?: string
  hoveredPillTextColor?: string
  pillTextColor?: string
  navHeight?: number
  logoSize?: number
  pillGap?: number
  pillPadX?: number
  onMobileMenuClick?: () => void
  initialLoadAnimation?: boolean
}

const PillNav = PillNavRaw as ComponentType<PillNavProps>

const LoadingSplash = () => (
  <div className="loading-splash" role="status" aria-live="polite">
    <span className="loading-text">Booting terminal...</span>
  </div>
)

const FaultyTerminal = dynamic(() => import('../components/FaultyTerminal'), {
  ssr: false,
  loading: () => <LoadingSplash />,
}) as unknown as ComponentType<any>

const TextType = dynamic(() => import('../components/TextType'), {
  ssr: false,
  loading: () => null,
}) as unknown as ComponentType<any>

const DecryptedText = dynamic(() => import('../components/DecryptedText'), {
  ssr: false,
  loading: () => null,
}) as unknown as ComponentType<any>

// How much extra vertical scrolling it takes to cross the timeline, relative
// to the horizontal distance the cards travel. Higher = less sensitive.
const TIMELINE_SCROLL_MULTIPLIER = 2.2

// Timing for the one-shot "This timeline marks..." intro text.
const TIMELINE_INTRO_FADE_MS = 450
const TIMELINE_INTRO_SCROLL_LOCK_MS = 500
const TIMELINE_INTRO_TEXT_HOLD_MS = 3500

type TimelineIconType = "code" | "graduation" | "briefcase" | "flag" | "trophy" | "book"

const TIMELINE_ICON_PATHS: Record<TimelineIconType, string> = {
  code: "M5 3.5L1.5 7l3.5 3.5M9 3.5L12.5 7 9 10.5",
  graduation: "M1 5l6-3 6 3-6 3-6-3zM4 6.4V9.6c0 1.1 1.4 2 3 2s3-.9 3-2V6.4",
  briefcase: "M1.5 4.5h11a1 1 0 011 1V11a1 1 0 01-1 1h-11a1 1 0 01-1-1V5.5a1 1 0 011-1zM5 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5",
  flag: "M2.5 1v12",
  trophy: "M4 2h6v3a3 3 0 01-6 0V2zM4 3H2.2A2 2 0 004 6M10 3h1.8A2 2 0 0110 6M6 8v2M4.5 12h5M6 10h2v2H6z",
  book: "M1.5 2.8c1-.5 2.5-.6 3.5 0 .4.2.8.5 1 .8.2-.3.6-.6 1-.8 1-.6 2.5-.5 3.5 0v8c-1-.5-2.5-.6-3.5 0-.4.2-.8.5-1 .8-.2-.3-.6-.6-1-.8-1-.6-2.5-.5-3.5 0v-8z",
}

// The flag's pennant is a filled triangle (a stroked one reads as the letter "F" at this size).
const TIMELINE_FLAG_PENNANT = "M2.5 1.8l7 2.4-7 2.4z"

function TimelineIcon({ type }: { type: TimelineIconType }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={TIMELINE_ICON_PATHS[type]} />
      {type === "flag" && <path d={TIMELINE_FLAG_PENNANT} fill="currentColor" stroke="none" />}
    </svg>
  )
}

type ProjectStatus = "active" | "archived"

type Project = {
  name: string
  status: ProjectStatus
  description: string
  stack: string
  lastUpdated: string
  href: string
}

// Placeholder project data — swap in real GitHub repo URLs (and update status/
// last-updated as projects wrap up) once available.
const PROJECTS: Project[] = [
  {
    name: "droplist",
    status: "active",
    description:
      "AI-powered internship aggregator that monitors company career pages in real time, detects changes, and surfaces new postings the moment they go live.",
    stack: "Python, Playwright, XPath, LLM APIs",
    lastUpdated: "Aug 2026",
    href: "https://github.com/HarisR39/DropList",
  },
  {
    name: "stopsafe",
    status: "active",
    description:
      "Mobile app providing real-time driver assistance during police stops, with gated capture logic and a PDF-backed evidence manifest.",
    stack: "React Native, Node.js, PostgreSQL",
    lastUpdated: "Aug 2026",
    href: "https://github.com/HarisR39",
  },
  {
    name: "portfolio-website",
    status: "active",
    description:
      "This site — a personal portfolio with a scroll-driven horizontal timeline, a WebGL terminal background, and a Spotify-linked now-playing widget.",
    stack: "Next.js, TypeScript, OGL (WebGL)",
    lastUpdated: "Aug 2026",
    href: "https://github.com/HarisR39/portfolio_website",
  },
  {
    name: "trackify",
    status: "archived",
    description:
      "A student involvement tracking system built for schools — lets educators monitor and manage student participation in extracurricular activities, clubs, and events, with attendance tracking, performance analytics, and teacher confirmation codes for verifying records.",
    stack: "Python, Tkinter, MongoDB",
    lastUpdated: "Jun 2023",
    href: "https://github.com/aidanq06/Trackify",
  },
]

type ContactLink = {
  label: string
  value: string
  href?: string
}

// Placeholder contact info — swap in real details once ready to publish.
const CONTACT_LINKS: ContactLink[] = [
  { label: "email", value: "yourname@example.com", href: "mailto:yourname@example.com" },
  { label: "phone", value: "+1 (555) 012-3456", href: "tel:+15550123456" },
  { label: "location", value: "Gainesville, FL" },
  { label: "github", value: "github.com/yourhandle", href: "#" },
  { label: "linkedin", value: "linkedin.com/in/yourhandle", href: "#" },
]

// Real photos, resized/compressed into public/personal-gallery/ (originals in
// C:\Users\firep\OneDrive\Pictures\personal_porfolio_photo_wall). Titles are
// alt/aria text only (DriftWall never renders them on-screen), derived from
// each photo's capture date where the filename had one.
const PERSONAL_GALLERY_ITEMS: DriftWallItem[] = [
  { image: "/personal-gallery/photo-01.webp", title: "Sep 2026" },
  { image: "/personal-gallery/photo-02.webp", title: "Oct 2023" },
  { image: "/personal-gallery/photo-03.webp", title: "Jul 2023" },
  { image: "/personal-gallery/photo-04.webp", title: "Jul 2023" },
  { image: "/personal-gallery/photo-05.webp", title: "Nov 2024" },
  { image: "/personal-gallery/photo-06.webp", title: "Oct 2022" },
  { image: "/personal-gallery/photo-07.webp", title: "Sep 2026" },
  { image: "/personal-gallery/photo-08.webp", title: "Apr 2023" },
  { image: "/personal-gallery/photo-09.webp", title: "Snapshot" },
  { image: "/personal-gallery/photo-10.webp", title: "Snapshot" },
  { image: "/personal-gallery/photo-11.webp", title: "Mar 2024" },
  { image: "/personal-gallery/photo-12.webp", title: "Aug 2025" },
  { image: "/personal-gallery/photo-13.webp", title: "Jul 2025" },
  { image: "/personal-gallery/photo-14.webp", title: "Dec 2023" },
  { image: "/personal-gallery/photo-15.webp", title: "Jul 2025" },
  { image: "/personal-gallery/photo-16.webp", title: "Sep 2026" },
  { image: "/personal-gallery/photo-17.webp", title: "Apr 2026" },
  { image: "/personal-gallery/photo-18.webp", title: "Jul 2025" },
  { image: "/personal-gallery/photo-19.webp", title: "Snapshot" },
  { image: "/personal-gallery/photo-20.webp", title: "Sep 2026" },
  { image: "/personal-gallery/photo-21.webp", title: "Dec 2024" },
  { image: "/personal-gallery/photo-22.webp", title: "Jul 2023" },
  { image: "/personal-gallery/photo-23.webp", title: "Sep 2024" },
  { image: "/personal-gallery/photo-24.webp", title: "Snapshot" },
  { image: "/personal-gallery/photo-25.webp", title: "Jul 2025" },
  { image: "/personal-gallery/photo-26.webp", title: "Nov 2024" },
  { image: "/personal-gallery/photo-27.webp", title: "Jun 2025" },
  { image: "/personal-gallery/photo-28.webp", title: "Dec 2024" },
  { image: "/personal-gallery/photo-29.webp", title: "Apr 2024" },
  { image: "/personal-gallery/photo-30.webp", title: "Jul 2023" },
  { image: "/personal-gallery/photo-31.webp", title: "Feb 2025" },
  { image: "/personal-gallery/photo-32.webp", title: "Jul 2025" },
  { image: "/personal-gallery/photo-33.webp", title: "Sep 2026" },
  { image: "/personal-gallery/photo-34.webp", title: "Sep 2026" },
  { image: "/personal-gallery/photo-35.webp", title: "Dec 2023" },
  { image: "/personal-gallery/photo-36.webp", title: "Sep 2026" },
  { image: "/personal-gallery/photo-37.webp", title: "Snapshot" },
  { image: "/personal-gallery/photo-38.webp", title: "Apr 2025" },
]

const VolleyballIcon = (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
    <circle cx="50" cy="50" r="42" />
    <path d="M50 8C35 22 35 78 50 92" />
    <path d="M50 8C65 22 65 78 50 92" />
    <path d="M11 38C30 48 70 48 89 38" />
    <path d="M14 68C34 56 66 56 86 68" />
  </svg>
)

const SoccerIcon = (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
    <circle cx="50" cy="50" r="42" />
    <path d="M50 30L64 40L58 58H42L36 40Z" strokeLinejoin="round" />
    <path d="M50 30V14M64 40L78 30M58 58L64 76M42 58L36 76M36 40L22 30" strokeLinecap="round" />
  </svg>
)

const TennisIcon = (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
    <ellipse cx="42" cy="38" rx="26" ry="32" strokeWidth="3" />
    <path d="M42 6V70M20 20 22 56M64 20 62 56M18 30h48M18 46h48" strokeWidth="1.4" />
    <path d="M42 70L52 92" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 88h10" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

const PERSONAL_REVEAL_ITEMS: RevealItem[] = [
  {
    label: "Volleyball",
    eyebrow: "01 — Indoor & Sand",
    blurb: "Reading the set before it's even hit. Fast hands, faster footwork, and a lot of yelling \"mine.\"",
    color: "#2F7FD1",
    colorDark: "#1E5A9A",
    icon: VolleyballIcon,
  },
  {
    label: "Soccer",
    eyebrow: "02 — Back of the Net",
    blurb: "Ninety minutes of small decisions. I'd rather make the pass that makes the assist possible.",
    color: "#1F8A4C",
    colorDark: "#146336",
    icon: SoccerIcon,
  },
  {
    label: "Tennis",
    eyebrow: "03 — Baseline to Net",
    blurb: "A one-on-one problem to solve every point. No teammates to hide behind, no excuses either.",
    color: "#C7D93E",
    colorDark: "#8F9F1E",
    icon: TennisIcon,
  },
]

export default function Home() {

  const pageRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const timelineRef = useRef<HTMLElement | null>(null)
  const timelinePinRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLUListElement | null>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const musicWidgetRef = useRef<HTMLDivElement | null>(null)
  const projectsRef = useRef<HTMLElement | null>(null)
  const personalRef = useRef<HTMLDivElement | null>(null)
  const contactRef = useRef<HTMLElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackDistance, setTrackDistance] = useState(0)
  const [songArtByHref, setSongArtByHref] = useState<Record<string, string>>({})
  const [showTimelineIntro, setShowTimelineIntro] = useState(false)
  const [terminalPaused, setTerminalPaused] = useState(false)
  const handleRevealOpaqueChange = useCallback((opaque: boolean) => {
    setTerminalPaused(opaque)
  }, [])
  const timelineIntroTriggeredRef = useRef(false)
  const showTimelineIntroRef = useRef(false)
  const timelineIntroHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timelineEntries = useMemo(
    () => [
      {
        period: "SUMMER 2026",
        title: "Began Building DropList",
        detail:
          "Began building DropList, an AI-powered internship aggregator that monitors company career pages in real time. Built a Playwright-based scraper with SHA-256 change detection, learned XPath for HTML navigation, and started work on an autofill module for job applications using LLM-guided form detection.",
        icon: "code" as TimelineIconType,
        song: { title: "Rolling Stone", artist: "The Weeknd", href: "https://open.spotify.com/track/29fTi7Tdh9CiU8HuVDaqVY?si=67fdd0931c444098" },
      },
      {
        period: "SPRING 2026",
        title: "Started Working on StopSafe",
        detail:
          "Started working on StopSafe, a mobile app providing real-time driver assistance during police stops. Joined as a backend/infrastructure engineer, building the accident flow, gated capture logic, and evidence manifest system — including PDF generation for incident documentation with GPS data and timestamped capture nodes.",
        icon: "code" as TimelineIconType,
        song: { title: "Woman", artist: "Doja Cat", href: "https://open.spotify.com/track/6Uj1ctrBOjOas8xZXGqKk4?si=58fac68c13d140d4" },
      },
      {
        period: "WINTER 2025",
        title: "Started Devloping My First Website",
        detail: "Started Developing My First Website. Began building the personal portfolio you’re viewing now, using it to showcase projects and experiences.",
        icon: "code" as TimelineIconType,
        song: { title: "Les", artist: "Childish Gambino", href: "https://open.spotify.com/track/7ghKr0pCYyPPyp7t1FH8k4?si=379207d563284f05" },
      },
      {
        period: "FALL 2025",
        title: "Started Studying Comp Sci @ UF",
        detail:
          "Began my Computer Science degree at the University of Florida. My first semester consisted of Advanced Programming, Calculus III, and Discrete Structures, while also participating in my first hackathon. This set the tone for a hands-on, technically focused CS journey.",
        icon: "graduation" as TimelineIconType,
        song: { title: "Die For You", artist: "The Weeknd", href: "https://open.spotify.com/track/2Ch7LmS7r2Gy2kc64wv3Bz?si=25cc957b09a14545" },
      },
      {
        period: "SUMMER 2025",
        title: "Graduated from Highschool/Started My Second Job",
        detail:
          "Graduated from high school and started my second job as a Code Ninjas instructor. I competed in district, state, and national programming competitions, earning multiple first-place finishes, while taking 13 AP classes and graduating 11th in my class.",
        icon: "briefcase" as TimelineIconType,
        song: { title: "Pretend Lovers", artist: "Montell Fish", href: "https://open.spotify.com/track/7GddnyejWAEvLkzwgAPxi6?si=51382ff3bc06449c" },
      },
      {
        period: "FALL 2024",
        title: "Became My FBLA Chapter President",
        detail: "Became President of my FBLA chapter. Led the chapter through competitive events and placed first at the district level.",
        icon: "flag" as TimelineIconType,
        song: { title: "Poison", artist: "Brent Faiyaz", href: "https://open.spotify.com/track/5NijSs5dAwaIybq1GaRTIe?si=292a51f5ebe441d0" },
      },
      {
        period: "SUMMER 2023",
        title: "Competed at the National Level",
        detail: "Competed at the National Level. Advanced through district and state competitions to attend the national conference in Atlanta, Georgia, where I met people I still stay in touch with today.",
        icon: "trophy" as TimelineIconType,
        song: { title: "Can't Feel My Face", artist: "The Weeknd", href: "https://open.spotify.com/track/22VdIZQfgXJea34mQxlt81?si=5477b558dbb0441d" },
      },
      {
        period: "FALL 2021",
        title: "Started High School",
        detail: "Started High School at River Ride High School. Began exploring academic interests and extracurriculars that shaped my later focus in computer science.",
        icon: "book" as TimelineIconType,
        song: { title: "Cherrry Blossoms", artist: "Shady Moon", href: "https://open.spotify.com/track/0i55G9XxEPCxYwzozhQun5?si=7e46c458c2824321" },
      },
    ],
    []
  )
  const gridMul = useMemo(() => [2, 1] as const, [])
  const navItems = useMemo(
    () => [
      { href: "#top", label: "Home" },
      { href: "#timeline", label: "Timeline" },
      { href: "#projects", label: "Projects" },
      { href: "#personal", label: "Personal" },
      { href: "#contact", label: "Contact" },
    ],
    []
  )
  const [showAbout, setShowAbout] = useState(false)
  useEffect(() => {
  const aboutTimer = setTimeout(() => {
    setShowAbout(true)
  }, 1000)
  return () => {
    clearTimeout(aboutTimer)
  }
  }, [])
  useEffect(() => {
    if (typeof window === "undefined") return
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [])

  useEffect(() => {
    const spotifyHrefs = Array.from(
      new Set(
        timelineEntries
          .map((entry) => entry.song.href)
          .filter((href) => href.includes("open.spotify.com/track/"))
      )
    )
    if (!spotifyHrefs.length) return

    let cancelled = false
    spotifyHrefs.forEach(async (href) => {
      try {
        const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(href)}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data.thumbnail_url) {
          setSongArtByHref((prev) => ({ ...prev, [href]: data.thumbnail_url }))
        }
      } catch {
        // Art stays as the placeholder icon if the fetch fails.
      }
    })
    return () => {
      cancelled = true
    }
  }, [timelineEntries])

  useEffect(() => {
    if (typeof window === "undefined") return
    const updateTrackDistance = () => {
      const track = trackRef.current
      if (!track) return
      // getBoundingClientRect (not scrollWidth) because .timeline-track has
      // overflow: visible, and scrollWidth under-reports on visible-overflow
      // elements in some browsers, which was cutting the last card short.
      const trackWidth = track.getBoundingClientRect().width
      setTrackDistance(Math.max(trackWidth - window.innerWidth, 0))
    }
    updateTrackDistance()
    window.addEventListener("resize", updateTrackDistance)
    return () => window.removeEventListener("resize", updateTrackDistance)
  }, [timelineEntries.length])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Swallows scroll-driving input for the brief lock window only - attached
    // on demand below rather than for the page's whole lifetime, since a
    // non-passive wheel/touchmove listener forces the browser to wait on the
    // main thread before it can commit any scroll, which otherwise adds scroll
    // latency site-wide for the sake of a ~1s window near the top of the page.
    const blockScroll = (e: Event) => e.preventDefault()
    const blockScrollKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)) {
        e.preventDefault()
      }
    }
    const attachScrollLock = () => {
      window.addEventListener("wheel", blockScroll, { passive: false })
      window.addEventListener("touchmove", blockScroll, { passive: false })
      window.addEventListener("keydown", blockScrollKey)
    }
    const releaseScrollLock = () => {
      window.removeEventListener("wheel", blockScroll)
      window.removeEventListener("touchmove", blockScroll)
      window.removeEventListener("keydown", blockScrollKey)
    }

    const update = () => {
      const heroHeight = Math.max(heroRef.current?.offsetHeight ?? 0, window.innerHeight)
      const timelineTop = timelineRef.current?.offsetTop ?? heroHeight
      const progress = Math.min(Math.max(window.scrollY / (heroHeight * 0.6), 0), 1)
      const eased = Math.pow(progress, 0.8)
      const veilStart = heroHeight * 0.55
      const veilEnd = timelineTop - window.innerHeight * 0.35
      const veilRaw = (window.scrollY - veilStart) / Math.max(veilEnd - veilStart, 1)
      const veilProgress = Math.min(Math.max(veilRaw, 0), 1)
      const veilEased = Math.pow(veilProgress, 0.7)

      // Show the timeline intro once the veil has fully darkened (not before -
      // it should read as appearing after the tint, not alongside it). Scroll
      // stays locked for the shorter window so a hard scroll can't skip it,
      // while the text itself lingers longer so it isn't cut off the instant
      // scrolling resumes.
      if (!timelineIntroTriggeredRef.current && veilProgress >= 1) {
        timelineIntroTriggeredRef.current = true
        showTimelineIntroRef.current = true
        setShowTimelineIntro(true)
        attachScrollLock()
        setTimeout(() => {
          releaseScrollLock()
        }, TIMELINE_INTRO_FADE_MS + TIMELINE_INTRO_SCROLL_LOCK_MS)
        timelineIntroHideTimeoutRef.current = setTimeout(() => {
          timelineIntroHideTimeoutRef.current = null
          showTimelineIntroRef.current = false
          setShowTimelineIntro(false)
        }, TIMELINE_INTRO_FADE_MS + TIMELINE_INTRO_TEXT_HOLD_MS)
      }

      // While the timeline is pinned, page scroll drives horizontal motion of the track.
      const scrollRunway = trackDistance * TIMELINE_SCROLL_MULTIPLIER
      const timelineRaw = (window.scrollY - timelineTop) / Math.max(scrollRunway, 1)
      const timelineProgress = Math.min(Math.max(timelineRaw, 0), 1)

      // Cut the intro text short (instead of waiting out its full hold timer)
      // once the user scrolls past the pinned timeline - it shouldn't still
      // be lingering on screen over the Projects section.
      if (showTimelineIntroRef.current && timelineProgress >= 1) {
        showTimelineIntroRef.current = false
        setShowTimelineIntro(false)
        if (timelineIntroHideTimeoutRef.current) {
          clearTimeout(timelineIntroHideTimeoutRef.current)
          timelineIntroHideTimeoutRef.current = null
        }
      }
      const offsetPx = timelineProgress * trackDistance
      if (trackRef.current) {
        trackRef.current.style.transform = `translateY(-50%) translateX(-${offsetPx}px)`
      }

      // Which card is "active" comes from progress alone (guarantees every card,
      // including the first and last, gets its turn). Position-based proximity
      // to viewport center is used only for the cosmetic fade/scale below,
      // since the track's translation range doesn't sweep the end cards all
      // the way to center.
      const nextIdx = Math.min(
        Math.max(Math.round(timelineProgress * (timelineEntries.length - 1)), 0),
        timelineEntries.length - 1
      )
      if (nextIdx !== activeIndex) setActiveIndex(nextIdx)

      const referenceX = window.innerWidth / 2
      const proximitySpan = Math.max(window.innerWidth * 0.32, 1)
      itemRefs.current.forEach((el) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const proximity = Math.min(Math.max(1 - Math.abs(centerX - referenceX) / proximitySpan, 0), 1)
        el.style.setProperty("--proximity", proximity.toString())
      })

      // Park the "now playing" widget to the right of the active dot, nudged
      // slightly off the line - above it when that card's text sits below,
      // below it when the text sits above - so it never sits flush against
      // the line itself. Clamped so it can't run past the visible edge for
      // cards whose dot already sits near the right side of the viewport.
      const activeEl = itemRefs.current[nextIdx]
      const pinEl = timelinePinRef.current
      const widgetEl = musicWidgetRef.current
      if (activeEl && pinEl && widgetEl) {
        const markerEl = activeEl.querySelector(".timeline-marker") as HTMLElement | null
        const markerRect = (markerEl ?? activeEl).getBoundingClientRect()
        const pinRect = pinEl.getBoundingClientRect()
        const relX = markerRect.left + markerRect.width / 2 - pinRect.left
        const relY = markerRect.top + markerRect.height / 2 - pinRect.top
        const widgetOffset = 90
        const widgetMaxWidth = 220
        const edgeMargin = 16
        const maxRelX = pinRect.width - widgetOffset - widgetMaxWidth - edgeMargin
        const verticalNudge = 75
        const activeTextIsAbove = nextIdx % 2 === 0
        widgetEl.style.left = `${Math.min(relX, maxRelX)}px`
        widgetEl.style.top = `${relY + (activeTextIsAbove ? verticalNudge : -verticalNudge)}px`

        // Drive the line-fill from the active dot's real pixel position rather
        // than raw scroll progress - the track's edge padding and per-item
        // spacing mean progress isn't linear with where a dot actually lands
        // on screen, so using progress directly made the fill drift out of
        // sync with the dot it's supposed to lead up to.
        const lineProgress = Math.min(Math.max(relX / pinRect.width, 0), 1)
        pageRef.current?.style.setProperty("--timeline-progress", lineProgress.toString())
      }

      // Bright/upbeat "outdoors" environment swap for the Personal section:
      // rises to 1 as the transition spacer between Projects and Personal
      // scrolls fully through the viewport - top to bottom - so a taller
      // spacer directly means a slower fade, holds through the whole
      // section, then falls back to 0 as Contact approaches so the site
      // returns to its usual dark terminal theme. Driven the same way as
      // veilProgress above (a plain 0-1 CSS var), with the actual crossfade
      // handled by CSS transitions on the elements that read it.
      const personalSpacerEl = personalRef.current
      let personalEnterProgress = 0
      if (personalSpacerEl) {
        const rect = personalSpacerEl.getBoundingClientRect()
        const spacerTravel = rect.height + window.innerHeight
        const personalEnterRaw = (window.innerHeight - rect.top) / Math.max(spacerTravel, 1)
        personalEnterProgress = Math.min(Math.max(personalEnterRaw, 0), 1)
      }

      const personalFadeStart = window.innerHeight * 0.85
      const personalFadeEnd = window.innerHeight * 0.15
      const contactTop = contactRef.current?.getBoundingClientRect().top ?? Infinity
      const personalExitRaw = (contactTop - personalFadeEnd) / (personalFadeStart - personalFadeEnd)
      const personalExitProgress = Math.min(Math.max(personalExitRaw, 0), 1)

      const personalProgress = Math.min(personalEnterProgress, personalExitProgress)

      pageRef.current?.style.setProperty("--scroll-progress", eased.toString())
      pageRef.current?.style.setProperty("--veil-progress", veilEased.toString())
      pageRef.current?.style.setProperty("--personal-progress", personalProgress.toString())
    }

    // Native 'scroll' events can fire far more often than the display can
    // paint (especially with high-precision trackpads), so this was running
    // its full body - including several getBoundingClientRect() reads right
    // after a style write, forcing a synchronous layout - many times per
    // frame. Throttling to one update per animation frame fixes both.
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        update()
        ticking = false
      })
    }

    update()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      releaseScrollLock()
    }
  }, [activeIndex, timelineEntries.length, trackDistance])

  return (
    <div className="page" id="top" ref={pageRef}>
      <div className="nav-holder">
        <div className="nav-top-bar" aria-hidden="true" />
        <PillNav
          logo="/favicon.ico"
          items={navItems}
          activeHref="#top"
          baseColor="#ffffffff"
          pillColor="#0b061a"
          hoveredPillTextColor="#000000"
          pillTextColor="#f7f4ff"
          navHeight={52}
          logoSize={46}
          pillGap={4}
          pillPadX={22}
          initialLoadAnimation={true}
          className="pill-nav"
        />
      </div>

      <div className="background" aria-hidden="true">
        <div className="wall">
          <FaultyTerminal
            scale={2}
            gridMul={gridMul}
            digitSize={1.5}
            timeScale={0.5}
            pause={terminalPaused}
            scanlineIntensity={0.5}
            glitchAmount={0.5}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0.1}
            tint="#a7ef9e"
            mouseReact={true}
            mouseStrength={0.4}
            pageLoadAnimation={true}
            brightness={1}
          />
          <div className="terminal-overlay"/>
        </div>
      </div>

      <div className="parallax-veil" aria-hidden="true" />
      <div className="personal-veil" aria-hidden="true" />

      <div
        className={`timeline-intro ${showTimelineIntro ? "is-visible" : ""}`}
        aria-hidden={!showTimelineIntro}
      >
        <p>This timeline marks key milestones in my academic and professional journey.</p>
        <p>Each song was what I was listening to most during that chapter.</p>
      </div>

      <main className="content">
        <section className="hero" aria-label="Intro" ref={heroRef}>
          <div className="name">
            <span className="name-line">
              <DecryptedText text="Harishankar" animateOn="view" revealDirection="center" speed={150} />
            </span>
            <span className="name-line">
              <DecryptedText text="Rajesh" animateOn="view" revealDirection="center" speed={150} />
            </span>
          </div>

          {showAbout && (
            <div className="about_me">
              <TextType
                text={["Sophomore @ UF.", "Python Enthusiast.", "The Weeknd Fanatic.", "Loves Coding <3.",]}
                typingSpeed={50}
                pauseDuration={1000}
                showCursor={true}
                cursorCharacter="_"
              />
            </div>
          )}
        </section>

        <section
          id="timeline"
          className="section timeline-section"
          ref={timelineRef}
          style={{ height: `calc(100vh + ${trackDistance * TIMELINE_SCROLL_MULTIPLIER}px)` }}
        >
          <div className="timeline-pin" aria-label="Milestones" ref={timelinePinRef}>
            <div className="timeline-music timeline-music--right" ref={musicWidgetRef}>
              <a
                className="timeline-music-card"
                href={timelineEntries[activeIndex].song.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Currently playing: ${timelineEntries[activeIndex].song.title}`}
              >
                <span className="timeline-music-art" aria-hidden="true">
                  {songArtByHref[timelineEntries[activeIndex].song.href] ? (
                    <img
                      src={songArtByHref[timelineEntries[activeIndex].song.href]}
                      alt=""
                      width={120}
                      height={120}
                    />
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5.5 12.5V3.8L13 2.5v8.2" />
                      <circle cx="3.8" cy="12.5" r="1.7" />
                      <circle cx="11.3" cy="10.7" r="1.7" />
                    </svg>
                  )}
                </span>
                <span className="timeline-music-info">
                  <span className="timeline-music-title-row">
                    <span className="timeline-music-eq" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="timeline-music-title">{timelineEntries[activeIndex].song.title}</span>
                  </span>
                  <span className="timeline-music-artist">{timelineEntries[activeIndex].song.artist}</span>
                </span>
              </a>
            </div>
            <div className="timeline-line" aria-hidden="true">
              <span className="timeline-line-fill" aria-hidden="true" />
            </div>
            <ul className="timeline-track" ref={trackRef}>
              {timelineEntries.map((entry, idx) => {
                const isAbove = idx % 2 === 0
                return (
                  <li
                    className={`timeline-item ${activeIndex === idx ? "is-active" : ""} ${
                      isAbove ? "timeline-item--above" : "timeline-item--below"
                    }`}
                    key={entry.period}
                    tabIndex={0}
                    ref={(el) => {
                      itemRefs.current[idx] = el
                    }}
                  >
                    <span className="timeline-connector" aria-hidden="true" />
                    <span className="timeline-marker" aria-hidden="true">
                      <TimelineIcon type={entry.icon} />
                    </span>
                    <div className="timeline-block">
                      <span className="timeline-eyebrow">{`MILESTONE ${String(timelineEntries.length - idx).padStart(2, "0")}`}</span>
                      <span className="timeline-floating-date">{entry.period}</span>
                      <div className="timeline-content">
                        <p className="timeline-body">{entry.detail}</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section id="projects" className="section projects-section" ref={projectsRef}>
          <h2 className="section-title">Projects</h2>
          <div className="projects-grid">
            {PROJECTS.map((project) => (
              <a
                key={project.name}
                className={`project-card ${project.status === "archived" ? "project-card--archived" : ""}`}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="project-card-header">
                  <span
                    className={`project-status-dot project-status-dot--${project.status}`}
                    aria-hidden="true"
                  />
                  <span className="project-status-label">{project.status}</span>
                </div>
                <p className="project-path">
                  {`C:\\projects\\${project.name}`}
                  {project.status === "active" && <span className="project-cursor" aria-hidden="true">_</span>}
                </p>
                <p className="project-description">{project.description}</p>
                <p className="project-stack">{`> stack: ${project.stack}`}</p>
                <p className="project-updated">
                  <span>{`> last updated: ${project.lastUpdated}`}</span>
                  <span className="project-view-hint">[view →]</span>
                </p>
              </a>
            ))}
          </div>
        </section>

        <section id="personal" className="personal-section">
          <div className="personal-transition-spacer" ref={personalRef}>
            <p className="personal-transition-text">transitioning to my personal life...</p>
          </div>
          <p className="personal-gallery-caption">A few moments along the way...</p>
          <div className="personal-gallery">
            <DriftWall
              items={PERSONAL_GALLERY_ITEMS}
              columns={7}
              duplicateLastColumn
              tileWidth={230}
              tileHeight={160}
              gap={16}
              tilt={14}
              turn={-7}
              perspective={1400}
              depth={140}
              speed={30}
              direction="up"
              variance={0.4}
              parallax={0.5}
              lift={56}
              fade={0.4}
              dim={0.98}
              overlayColor="#2b1a0f"
              overlayOpacity={0.03}
            />
          </div>
          <ScrollReveal items={PERSONAL_REVEAL_ITEMS} onOpaqueChange={handleRevealOpaqueChange} />
        </section>

        <section id="contact" className="section contact-section" ref={contactRef}>
          <h2 className="section-title">Contact</h2>
          <p className="section-text">
            Got a project, an opportunity, or just want to talk shop? My inbox is open.
          </p>
          <div className="contact-card">
            <div className="contact-card-header">
              <span className="project-status-dot project-status-dot--active" aria-hidden="true" />
              <span className="project-status-label">online</span>
            </div>
            <p className="contact-path">
              {"C:\\contact\\me"}
              <span className="project-cursor" aria-hidden="true">_</span>
            </p>
            <ul className="contact-list">
              {CONTACT_LINKS.map((item) => {
                const isExternal = item.href?.startsWith("http")
                return (
                  <li className="contact-row" key={item.label}>
                    <span className="contact-label">{`> ${item.label}:`}</span>
                    {item.href ? (
                      <a
                        className="contact-value contact-link"
                        href={item.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="contact-value">{item.value}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
