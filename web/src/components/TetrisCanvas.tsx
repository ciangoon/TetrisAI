import React, { useEffect, useRef, useState } from 'react'
import { Board } from '../engine/Board'
import { Direction, Rotation, INTERVAL_MS, BOARD_WIDTH, BOARD_HEIGHT, Shape } from '../engine/enums'
import { PlayerAI } from '../ai/Player'
import { SeededRandom } from '../engine/rng'
import { MoveDiagonal2 } from 'lucide-react'
import { Block } from '../engine/Block'

const DEFAULT_CELL_SIZE = 20
const EXTRA_COLUMNS = 6

function isDirection(a: Direction | Rotation): a is Direction {
  return (
    a === Direction.Left ||
    a === Direction.Right ||
    a === Direction.Down ||
    a === Direction.Drop
  )
}

function isSupported(block: Block, board: Board): boolean {
  for (const k of block.cells) {
    const [xs, ys] = (k as string).split(',')
    const x = parseInt(xs, 10)
    const y = parseInt(ys, 10)
    if (y + 1 === board.height) return true
    if (board.cells.has(`${x},${y + 1}`)) return true
  }
  return false
}

export type TetrisCanvasProps = {
  autoplay: boolean
  onScoreChange?: (score: number) => void
  onGameOver?: () => void
  speedFactor?: number
}

export function TetrisCanvas({ autoplay, onScoreChange, onGameOver, speedFactor = 1 }: TetrisCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const boardRef = useRef<Board>(new Board())
  const aiRef = useRef<PlayerAI>(new PlayerAI())
  const queueRef = useRef<(Direction | Rotation)[]>([])
  const rngRef = useRef<SeededRandom>(new SeededRandom(42))

  const [boxSize, setBoxSize] = useState<{ w: number; h: number }>(() => ({
    w: (BOARD_WIDTH + EXTRA_COLUMNS) * DEFAULT_CELL_SIZE,
    h: BOARD_HEIGHT * DEFAULT_CELL_SIZE,
  }))
  const resizingRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)
  const endedRef = useRef<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const shapes = [Shape.I, Shape.J, Shape.L, Shape.O, Shape.S, Shape.T, Shape.Z]
    const randomShape = () => shapes[rngRef.current.nextInt(0, shapes.length - 1)]

    const ensureSpawn = (b: Board) => {
      if (!b.falling && b.next === null) {
        b.runAdversary(randomShape())
        ;(b as any).placeNextBlock?.()
        b.runAdversary(randomShape())
      }
      if (b.falling && b.next === null) {
        b.runAdversary(randomShape())
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowLeft","ArrowRight","ArrowDown"," ","ArrowUp","z","x"].includes(e.key)) {
        e.preventDefault()
      }
      const b = boardRef.current
      ensureSpawn(b)
      if (!b.falling || endedRef.current) return
      if (autoplay) return
      switch (e.key) {
        case 'ArrowLeft': b.move(Direction.Left); break
        case 'ArrowRight': b.move(Direction.Right); break
        case 'ArrowDown': b.move(Direction.Down); break
        case ' ': b.move(Direction.Drop); break
        case 'ArrowUp': b.rotate(Rotation.Clockwise); break
        case 'z': b.rotate(Rotation.Anticlockwise); break
        case 'x': b.rotate(Rotation.Clockwise); break
      }
      onScoreChange?.(b.score)
    }
    window.addEventListener('keydown', handleKey)

    let last = performance.now()
    let acc = 0
    let anim = 0

    const draw = () => {
      const b = boardRef.current

      if (canvas.width !== boxSize.w) canvas.width = boxSize.w
      if (canvas.height !== boxSize.h) canvas.height = boxSize.h

      const cellW = canvas.width / (BOARD_WIDTH + EXTRA_COLUMNS)
      const cellH = canvas.height / BOARD_HEIGHT
      const S = Math.floor(Math.min(cellW, cellH)) || 1

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Ghost piece (landing silhouette)
      if (b.falling) {
        const ghost = b.falling.clone()
        let guard = 0
        while (!isSupported(ghost as any, b) && guard++ < 1000) {
          ghost.move(Direction.Down)
        }
        ctx.save()
        ctx.globalAlpha = 0.25
        ctx.fillStyle = '#888'
        for (const k of ghost.cells) {
          const [xs, ys] = (k as string).split(',')
          const x = parseInt(xs, 10)
          const y = parseInt(ys, 10)
          // do not draw over existing locked cells
          if (b.cells.has(`${x},${y}`)) continue
          ctx.fillRect(x * S, y * S, S - 1, S - 1)
        }
        ctx.restore()
      }

      // draw placed cells
      for (const k of b.cells) {
        const [xs, ys] = (k as string).split(',')
        const x = parseInt(xs, 10)
        const y = parseInt(ys, 10)
        ctx.fillStyle = b.cellColor.get(k as string) || 'gray'
        ctx.fillRect(x * S, y * S, S - 1, S - 1)
      }
      // draw falling
      if (b.falling) {
        ctx.fillStyle = b.falling.color
        for (const k of b.falling.cells) {
          const [xs, ys] = (k as string).split(',')
          const x = parseInt(xs, 10)
          const y = parseInt(ys, 10)
          ctx.fillRect(x * S, y * S, S - 1, S - 1)
        }
      }

      ctx.strokeStyle = '#333'
      ctx.beginPath()
      ctx.moveTo(BOARD_WIDTH * S + 2, 0)
      ctx.lineTo(BOARD_HEIGHT * 0 + BOARD_WIDTH * S + 2, BOARD_HEIGHT * S)
      ctx.stroke()

      if (b.next) {
        ctx.fillStyle = b.next.color
        for (const k of b.next.cells) {
          const [xs, ys] = (k as string).split(',')
          const x = parseInt(xs, 10) + BOARD_WIDTH + 2
          const y = parseInt(ys, 10) + 1
          ctx.fillRect(x * S, y * S, S - 1, S - 1)
        }
      }
    }

    const step = (dt: number) => {
      if (endedRef.current) return
      const b = boardRef.current
      ensureSpawn(b)

      if (!b.alive) {
        endedRef.current = true
        onGameOver?.()
        cancelAnimationFrame(anim)
        return
      }

      const minFactor = 0.25
      const effInterval = autoplay ? INTERVAL_MS / Math.max(minFactor, speedFactor) : INTERVAL_MS

      acc += dt
      while (acc >= effInterval) {
        ensureSpawn(b)

        if (!b.alive) {
          endedRef.current = true
          onGameOver?.()
          cancelAnimationFrame(anim)
          return
        }

        if (autoplay && b.falling) {
          if (queueRef.current.length === 0) {
            const best = aiRef.current.findBestMove(b.clone())
            queueRef.current = aiRef.current.buildMoveSequence(b.clone(), best.position, best.rotation)
          }
          const action = queueRef.current.shift()
          if (action !== undefined) {
            if (isDirection(action)) {
              b.move(action)
            } else {
              b.rotate(action)
            }
          }
        } else if (b.falling) {
          b.skip()
        }
        acc -= effInterval
        onScoreChange?.(b.score)
      }

      draw()
    }

    ensureSpawn(boardRef.current)

    const loop = (t: number) => {
      const dt = t - last
      last = t
      step(dt)
      if (!endedRef.current) {
        anim = requestAnimationFrame(loop)
      }
    }
    anim = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(anim)
      window.removeEventListener('keydown', handleKey)
    }
  }, [autoplay, onScoreChange, onGameOver, speedFactor, boxSize.w, boxSize.h])

  const onMouseDownHandle = (e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: boxSize.w,
      startH: boxSize.h,
    }

    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return
      const dx = ev.clientX - resizingRef.current.startX
      const dy = ev.clientY - resizingRef.current.startY
      const minW = 240
      const minH = 240
      const newW = Math.max(minW, resizingRef.current.startW + dx)
      const newH = Math.max(minH, resizingRef.current.startH + dy)
      setBoxSize({ w: newW, h: newH })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      resizingRef.current = null
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ position: 'relative', width: boxSize.w, height: boxSize.h, border: '1px solid #333', background: '#000' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        <div
          onMouseDown={onMouseDownHandle}
          title="Resize"
          style={{
            position: 'absolute',
            right: -20,
            bottom: 0,
            width: 20,
            height: 20,
            cursor: 'nwse-resize',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MoveDiagonal2 color="#aaa" size={16} />
        </div>
      </div>
    </div>
  )
}