"use client"
// app/page.tsx
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useRef, useState } from "react"
import PillNav from "../components/PillNav"

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

export default function Home() {

  // Adjust this to move the reference point for the glowing line and activation (0 = top, 1 = bottom of viewport).
  const timelineRefRatio = 0.6
  const pageRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const timelineRef = useRef<HTMLElement | null>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const timelineEntries = useMemo(
    () => [
      {
        period: "WINTER 2025",
        title: "Started Devloping My First Website",
        detail: "Started Developing My First Website. Began building the personal portfolio you’re viewing now, using it to showcase projects and experiences.",
      },
      {
        period: "FALL 2025",
        title: "Started Studying Comp Sci @ UF",
        detail:
          "Began my Computer Science degree at the University of Florida. My first semester consisted of Advanced Programming, Calculus III, and Discrete Structures, while also participating in my first hackathon. This set the tone for a hands-on, technically focused CS journey.",
      },
      {
        period: "SUMMER 2025",
        title: "Graduated from Highschool/Started My Second Job",
        detail:
          "Graduated from high school and started my second job as a Code Ninjas instructor. I competed in district, state, and national programming competitions, earning multiple first-place finishes, while taking 13 AP classes and graduating 11th in my class.",
      },
      {
        period: "FALL 2024",
        title: "Became My FBLA Chapter President",
        detail: "Became President of my FBLA chapter. Led the chapter through competitive events and placed first at the district level.",
      },
      {
        period: "SUMMER 2023",
        title: "Competed at the National Level",
        detail: "Competed at the National Level. Advanced through district and state competitions to attend the national conference in Atlanta, Georgia, where I met people I still stay in touch with today.",
      },
      {
        period: "FALL 2021",
        title: "Started High School",
        detail: "Started High School at River Ride High School. Began exploring academic interests and extracurriculars that shaped my later focus in computer science.",
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
    const handleScroll = () => {
      const heroHeight = Math.max(heroRef.current?.offsetHeight ?? 0, window.innerHeight)
      const timelineTop = timelineRef.current?.offsetTop ?? heroHeight
      const timelineHeight = timelineRef.current?.offsetHeight ?? 1
      const probe = window.scrollY + window.innerHeight * timelineRefRatio
      const progressRaw = (probe - timelineTop) / timelineHeight
      const scrollProgress = Math.min(Math.max(progressRaw, 0), 1)
      const visibleTop = timelineTop - window.scrollY
      const fillPx = Math.min(
        Math.max(window.innerHeight * timelineRefRatio - visibleTop, 0),
        timelineHeight
      )
      const progress = Math.min(Math.max(window.scrollY / (heroHeight * 0.6), 0), 1)
      const eased = Math.pow(progress, 0.8)
      const veilStart = heroHeight * 0.55
      const veilEnd = timelineTop - window.innerHeight * 0.35
      const veilRaw = (window.scrollY - veilStart) / Math.max(veilEnd - veilStart, 1)
      const veilProgress = Math.min(Math.max(veilRaw, 0), 1)
      const veilEased = Math.pow(veilProgress, 0.7)
      // Pick the item whose center is closest to the shared reference line for consistent activation with the glow.
      let closestIdx = activeIndex
      let closestDelta = Number.POSITIVE_INFINITY
      const probeY = window.scrollY + window.innerHeight * timelineRefRatio
      itemRefs.current.forEach((el, idx) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const center = rect.top + window.scrollY + rect.height * 0.5
        const delta = Math.abs(center - probeY)
        if (delta < closestDelta) {
          closestDelta = delta
          closestIdx = idx
        }
      })
      if (closestIdx !== activeIndex) setActiveIndex(closestIdx)
      const lastEl = itemRefs.current[timelineEntries.length - 1]
      const lastCenter = lastEl
        ? (lastEl.getBoundingClientRect().top + window.scrollY + lastEl.getBoundingClientRect().height * 0.5) - timelineTop
        : timelineHeight
      const fillMax = Math.min(Math.max(lastCenter, 0), timelineHeight)
      const fillClamped = Math.min(fillPx, fillMax)
      pageRef.current?.style.setProperty("--scroll-progress", eased.toString())
      pageRef.current?.style.setProperty("--veil-progress", veilEased.toString())
      pageRef.current?.style.setProperty("--timeline-progress", scrollProgress.toString())
      pageRef.current?.style.setProperty("--timeline-fill-px", `${fillPx}px`)
      pageRef.current?.style.setProperty("--timeline-fill-max", `${fillMax}px`)
      pageRef.current?.style.setProperty("--timeline-fill-clamped", `${fillClamped}px`)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index)
            if (!Number.isNaN(idx)) setActiveIndex(idx)
          }
        })
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0.25 }
    )

    itemRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [timelineEntries.length])

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

        <section id="timeline" className="section timeline-section" ref={timelineRef}>
          <h2 className="section-title">Timeline</h2>
          <div className="timeline-wrapper" aria-label="Milestones">
            <div className="timeline-line" aria-hidden="true" />
            <ul className="timeline-list">
              {timelineEntries.map((entry, idx) => (
                <li
                  className={`timeline-item ${activeIndex === idx ? "is-active" : ""}`}
                  key={entry.period}
                  data-index={idx}
                  ref={(el) => (itemRefs.current[idx] = el)}
                >
                  <span className="timeline-marker" aria-hidden="true" />
                  <span className="timeline-floating-date">{entry.period}</span>
                  <div className="timeline-content">
                    <span className="timeline-date">{entry.period}</span>
                    <h3 className="timeline-title">{entry.title}</h3>
                    <p className="timeline-body">{entry.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="projects" className="section projects-section">
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
