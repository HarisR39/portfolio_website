"use client"
// app/page.tsx
import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled (prevents server-side render errors)
const DotGrid = dynamic(() => import('../components/DotGrid'), { ssr: false })
import GradientText from '../components/GradientText'


export default function Home() {
  return (
    <div className="container">
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <DotGrid
          dotSize={3}
          gap={25}
          baseColor="#111111ff"
          activeColor="#ffffffff"
          proximity={200}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <div className="welcome">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={10}
          showBorder={false}
          className="custom-class"
          >
          Welcome
        </GradientText>
      </div>
    </div>
  )
}