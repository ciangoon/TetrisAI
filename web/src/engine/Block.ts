import { Direction, Rotation, Shape, shapeToCells, shapeToColor, shapeToCenter } from './enums'

export type CellsSet = Set<string>

export function key(x: number, y: number): string {
  return `${x},${y}`
}

export function parseKey(k: string): { x: number; y: number } {
  const [xs, ys] = k.split(',')
  return { x: parseInt(xs, 10), y: parseInt(ys, 10) }
}

export class Block {
  shape: Shape
  color: string
  cells: CellsSet
  center: { cx: number; cy: number }

  constructor(shape: Shape) {
    this.shape = shape
    this.color = shapeToColor[shape]
    this.cells = new Set<string>(shapeToCells[shape])
    this.center = { ...shapeToCenter[shape] }
  }

  clone(): Block {
    const b = new Block(this.shape)
    b.cells = new Set(this.cells)
    b.center = { ...this.center }
    return b
  }

  get left(): number {
    return Math.min(...Array.from(this.cells).map((k) => parseKey(k).x))
  }

  get right(): number {
    return Math.max(...Array.from(this.cells).map((k) => parseKey(k).x))
  }

  get top(): number {
    return Math.min(...Array.from(this.cells).map((k) => parseKey(k).y))
  }

  get bottom(): number {
    return Math.max(...Array.from(this.cells).map((k) => parseKey(k).y))
  }

  initialize(boardWidth: number): void {
    const center = this.left + Math.floor((this.right - this.left) / 2)
    const shift = Math.floor(boardWidth / 2) - center
    this.cells = new Set(
      Array.from(this.cells).map((k0) => {
        const { x, y } = parseKey(k0)
        return key(x + shift, y)
      })
    )
    this.center = { cx: this.center.cx + shift, cy: this.center.cy }
  }

  move(direction: Direction, count = 1): void {
    if (direction === Direction.Right) {
      this.cells = new Set(
        Array.from(this.cells).map((k0) => {
          const { x, y } = parseKey(k0)
          return key(x + count, y)
        })
      )
      this.center = { cx: this.center.cx + count, cy: this.center.cy }
    } else if (direction === Direction.Left) {
      this.cells = new Set(
        Array.from(this.cells).map((k0) => {
          const { x, y } = parseKey(k0)
          return key(x - count, y)
        })
      )
      this.center = { cx: this.center.cx - count, cy: this.center.cy }
    } else if (direction === Direction.Down) {
      this.cells = new Set(
        Array.from(this.cells).map((k0) => {
          const { x, y } = parseKey(k0)
          return key(x, y + count)
        })
      )
      this.center = { cx: this.center.cx, cy: this.center.cy + count }
    } else if (direction === Direction.Drop) {
      // handled by Board logic using supported()
    }
  }

  rotate(rotation: Rotation): void {
    const oldCells = new Set(this.cells)
    const oldCenter = { ...this.center }

    const cx = this.center.cx
    const cy = this.center.cy

    const rotated = new Set<string>
    if (rotation === Rotation.Clockwise) {
      for (const k0 of this.cells) {
        const { x, y } = parseKey(k0)
        const nx = Math.trunc(-(y - cy) + cx)
        const ny = Math.trunc(x - cx + cy)
        rotated.add(key(nx, ny))
      }
    } else {
      for (const k0 of this.cells) {
        const { x, y } = parseKey(k0)
        const nx = Math.trunc(y - cy + cx)
        const ny = Math.trunc(-(x - cx) + cy)
        rotated.add(key(nx, ny))
      }
    }

    this.cells = rotated

    // center remains the same
    this.center = { cx, cy }

    // caller must validate bounds/collisions and revert if needed
    ;(this as any)._previous = { oldCells, oldCenter }
  }
}
