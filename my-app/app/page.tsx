"use client"
// app/page.tsx
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from "react"

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

  const gridMul = useMemo(() => [2, 1] as const, [])
  const [showAbout, setShowAbout] = useState(false)
  useEffect(() => {
  const aboutTimer = setTimeout(() => {
    setShowAbout(true)
  }, 1000)
  return () => {
    clearTimeout(aboutTimer)
  }
  }, [])

  return (
    
    <div className="background">
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

    </div>
  )
}
