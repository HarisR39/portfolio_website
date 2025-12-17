"use client"
// app/page.tsx
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

// Dynamic import with SSR disabled (prevents server-side render errors)
const FaultyTerminal = dynamic(() => import('../components/FaultyTerminal'), { ssr: false }) as unknown as ComponentType<any>
const TextType = dynamic(() => import('../components/TextType'), { ssr: false }) as unknown as ComponentType<any>
const DecryptedText = dynamic(() => import('../components/DecryptedText'), { ssr: false }) as unknown as ComponentType<any>

export default function Home() {
  return (
    <div className="background">
      <div className="wall">
        <FaultyTerminal
          scale={2}
          gridMul={[2, 1]}
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
      </div>
      <div className="welcome">
        <span className="welcome-line">
          <DecryptedText text="Harishankar" animateOn="view" revealDirection="center" speed={150} />
        </span>
        <span className="welcome-line">
          <DecryptedText text="Rajesh" animateOn="view" revealDirection="center" speed={150} />
        </span>
      </div>
    </div>
  )
}