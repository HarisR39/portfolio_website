import './App.css'
import LiquidEther from './components/LiquidEther'
import GradientText from './components/GradientText'

function App() {
  return (
    <div className="app">
      
      <div className="content">

      <LiquidEther
        colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />

        <h1 className="greeting">
          <GradientText
            colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
            animationSpeed={10}
            showBorder={false}
            className="custom-class"
          >
            Welcome
          </GradientText>
        </h1>
      </div>
    </div>
  )
}

export default App
