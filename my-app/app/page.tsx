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

  const pageRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const timelineEntries = useMemo(
    () => [
      {
        period: "Fall 2024",
        title: "Started at UF for Computer Science",
        detail:
          "Diving into algorithms, data structures, and systems programming while building a strong math foundation.",
      },
      {
        period: "Summer 2024",
        title: "Built terminal-inspired web experiences",
        detail: "Combined React, TypeScript, and creative coding shaders to ship playful UI experiments.",
      },
      {
        period: "2023",
        title: "Automated workflows with Python",
        detail: "Created scripts to streamline daily tasks, practice data processing, and explore APIs.",
      },
      {
        period: "2022",
        title: "Robotics & maker projects",
        detail: "Learned hands-on electronics and collaborative problem solving through hardware builds.",
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
      const progress = Math.min(Math.max(window.scrollY / (heroHeight * 0.6), 0), 1)
      const eased = Math.pow(progress, 0.8)
      pageRef.current?.style.setProperty("--scroll-progress", eased.toString())
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

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

        <section id="timeline" className="section timeline-section">
          <h2 className="section-title">Timeline</h2>
          <div className="timeline-wrapper" aria-label="Milestones">
            <div className="timeline-line" aria-hidden="true" />
            <ul className="timeline-list">
              {timelineEntries.map((entry) => (
                <li className="timeline-item" key={entry.period}>
                  <span className="timeline-marker" aria-hidden="true" />
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
