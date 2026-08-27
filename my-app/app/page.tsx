"use client"
// app/page.tsx
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useRef, useState } from "react"
import PillNavRaw from "../components/PillNav"

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

export default function Home() {

  const pageRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const timelineRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLUListElement | null>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const projectsRef = useRef<HTMLElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackDistance, setTrackDistance] = useState(0)
  const timelineEntries = useMemo(
    () => [
      {
        period: "SUMMER 2026",
        title: "Began Building DropList",
        detail:
          "Began building DropList, an AI-powered internship aggregator that monitors company career pages in real time. Built a Playwright-based scraper with SHA-256 change detection, learned XPath for HTML navigation, and started work on an autofill module for job applications using LLM-guided form detection.",
        icon: "code" as TimelineIconType,
      },
      {
        period: "SPRING 2026",
        title: "Started Working on StopSafe",
        detail:
          "Started working on StopSafe, a mobile app providing real-time driver assistance during police stops. Joined as a backend/infrastructure engineer, building the accident flow, gated capture logic, and evidence manifest system — including PDF generation for incident documentation with GPS data and timestamped capture nodes.",
        icon: "code" as TimelineIconType,
      },
      {
        period: "WINTER 2025",
        title: "Started Devloping My First Website",
        detail: "Started Developing My First Website. Began building the personal portfolio you’re viewing now, using it to showcase projects and experiences.",
        icon: "code" as TimelineIconType,
      },
      {
        period: "FALL 2025",
        title: "Started Studying Comp Sci @ UF",
        detail:
          "Began my Computer Science degree at the University of Florida. My first semester consisted of Advanced Programming, Calculus III, and Discrete Structures, while also participating in my first hackathon. This set the tone for a hands-on, technically focused CS journey.",
        icon: "graduation" as TimelineIconType,
      },
      {
        period: "SUMMER 2025",
        title: "Graduated from Highschool/Started My Second Job",
        detail:
          "Graduated from high school and started my second job as a Code Ninjas instructor. I competed in district, state, and national programming competitions, earning multiple first-place finishes, while taking 13 AP classes and graduating 11th in my class.",
        icon: "briefcase" as TimelineIconType,
      },
      {
        period: "FALL 2024",
        title: "Became My FBLA Chapter President",
        detail: "Became President of my FBLA chapter. Led the chapter through competitive events and placed first at the district level.",
        icon: "flag" as TimelineIconType,
      },
      {
        period: "SUMMER 2023",
        title: "Competed at the National Level",
        detail: "Competed at the National Level. Advanced through district and state competitions to attend the national conference in Atlanta, Georgia, where I met people I still stay in touch with today.",
        icon: "trophy" as TimelineIconType,
      },
      {
        period: "FALL 2021",
        title: "Started High School",
        detail: "Started High School at River Ride High School. Began exploring academic interests and extracurriculars that shaped my later focus in computer science.",
        icon: "book" as TimelineIconType,
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
    const handleScroll = () => {
      const heroHeight = Math.max(heroRef.current?.offsetHeight ?? 0, window.innerHeight)
      const timelineTop = timelineRef.current?.offsetTop ?? heroHeight
      const progress = Math.min(Math.max(window.scrollY / (heroHeight * 0.6), 0), 1)
      const eased = Math.pow(progress, 0.8)
      const veilStart = heroHeight * 0.55
      const veilEnd = timelineTop - window.innerHeight * 0.35
      const veilRaw = (window.scrollY - veilStart) / Math.max(veilEnd - veilStart, 1)
      const veilProgress = Math.min(Math.max(veilRaw, 0), 1)
      const veilEased = Math.pow(veilProgress, 0.7)

      // While the timeline is pinned, page scroll drives horizontal motion of the track.
      const scrollRunway = trackDistance * TIMELINE_SCROLL_MULTIPLIER
      const timelineRaw = (window.scrollY - timelineTop) / Math.max(scrollRunway, 1)
      const timelineProgress = Math.min(Math.max(timelineRaw, 0), 1)
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

      pageRef.current?.style.setProperty("--scroll-progress", eased.toString())
      pageRef.current?.style.setProperty("--veil-progress", veilEased.toString())
      pageRef.current?.style.setProperty("--timeline-progress", timelineProgress.toString())
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
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
            pause={false}
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
                text={["Freshman @ UF.", "Python Enthusiast.", "The Weeknd Fanatic.", "Loves Coding <3.",]}
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
          <div className="timeline-pin" aria-label="Milestones">
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
          <p className="section-text">
            A mix of personal builds and class work: terminal-inspired UIs, automation scripts, and small web apps.
            Always looking for ways to blend clean design with solid engineering practices.
          </p>
        </section>

        <section id="personal" className="section personal-section">
          <h2 className="section-title">Personal</h2>
          <p className="section-text">
            When I am not coding, you will find me listening to The Weeknd, tweaking workflows, or testing new tech stacks.
            I like learning by shipping and experimenting with ideas that feel a bit out of the ordinary.
          </p>
        </section>

        <section id="contact" className="section contact-section">
          <h2 className="section-title">Contact</h2>
          <p className="section-text">
            Want to connect or collaborate? Send a note to yourname@example.com or reach
            out through LinkedIn.
          </p>
        </section>
      </main>
    </div>
  )
}
