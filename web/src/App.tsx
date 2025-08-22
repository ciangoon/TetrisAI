import React, { useState } from 'react'
import { TetrisCanvas } from './components/TetrisCanvas'
import { Loader2 } from 'lucide-react'

export default function App() {
  const [autoplay, setAutoplay] = useState(false)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [speed, setSpeed] = useState(10)

  const reset = () => {
    setReloading(true)
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#000',
      display: 'flex', 
      flexDirection: 'column', 
      color: '#fff', 
      fontFamily: 'system-ui, sans-serif' 
    }}>
      <header style={{ padding: 16 }}>
        <h1 style={{ margin: 0, color: '#fff', textAlign: 'center'}}>Tetris</h1>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {!started ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <button 
              onClick={() => { setAutoplay(false); setStarted(true) }}
              style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '10px 18px', borderRadius: 4, cursor: 'pointer' }}
            >
              Play Yourself
            </button>
            <button 
              onClick={() => { setAutoplay(true); setStarted(true) }}
              style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '10px 18px', borderRadius: 4, cursor: 'pointer' }}
            >
              Watch Autoplayer
            </button>
          </div>
        ) : (
          <>
            <TetrisCanvas autoplay={autoplay} onScoreChange={setScore} onGameOver={() => setGameOver(true)} speedFactor={speed} />
            {gameOver && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                <div style={{ background: '#111', border: '1px solid #333', padding: 24, borderRadius: 8, textAlign: 'center', minWidth: 240 }}>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>Game Over</div>
                  <div style={{ marginBottom: 16 }}>Final Score: <b>{score}</b></div>
                  <button onClick={reset} disabled={reloading} style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '10px 18px', borderRadius: 4, cursor: reloading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {reloading ? (<><Loader2 size={16} className="spin" /> Restarting…</>) : 'Play Again'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, justifyContent: 'center', padding: 16 }}>
        <button 
          onClick={() => setAutoplay((v) => !v)}
          disabled={!started || gameOver}
          style={{
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: !started || gameOver ? 'not-allowed' : 'pointer',
            opacity: !started || gameOver ? 0.5 : 1
          }}
        >
          {autoplay ? 'Let me play' : 'I need the BOT!'}
        </button>
        {autoplay && started && !gameOver && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ color: '#bbb', fontSize: 12 }}>Speed</label>
            <input
              type="range"
              min={10}
              max={1000}
              step={1}
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
            />
            <span style={{ fontSize: 12, color: '#bbb' }}>{speed}x</span>
          </div>
        )}
        <div style={{ color: '#fff' }}>Score: <b>{score}</b></div>
      </div>

      <footer style={{ padding: 16 }}>
        <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>
          Controls: Left/Right (move), Down (soft drop), Space (hard drop), Up/z/x (rotate)
        </div>
      </footer>
    </div>
  )
}