import { Direction, Rotation, Shape, BOARD_WIDTH, BOARD_HEIGHT } from './enums'
import { Block, key, parseKey } from './Block'

export type CellColor = string

export class Board {
  width: number
  height: number
  score: number
  cells: Set<string>
  cellColor: Map<string, CellColor>
  falling: Block | null
  next: Block | null

  constructor(width = BOARD_WIDTH, height = BOARD_HEIGHT, score = 0) {
    this.width = width
    this.height = height
    this.score = score
    this.cells = new Set()
    this.cellColor = new Map()
    this.falling = null
    this.next = null
  }

  clone(): Board {
    const b = new Board(this.width, this.height, this.score)
    b.cells = new Set(this.cells)
    b.cellColor = new Map(this.cellColor)
    b.falling = this.falling ? this.falling.clone() : null
    b.next = this.next ? this.next.clone() : null
    return b
  }

  get alive(): boolean {
    return this.falling === null || !this.collides(this.falling)
  }

  private collides(block: Block): boolean {
    for (const k0 of block.cells) {
      if (this.cells.has(k0)) return true
      const { x, y } = parseKey(k0)
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true
    }
    return false
  }

  private supported(block: Block): boolean {
    for (const k0 of block.cells) {
      const { x, y } = parseKey(k0)
      if (y + 1 === this.height) return true
      if (this.cells.has(key(x, y + 1))) return true
    }
    return false
  }

  private placeNextBlock(): void {
    this.falling = this.next
    if (this.falling) {
      this.falling.initialize(this.width)
    }
    this.next = null
  }

  runAdversary(nextShape: Shape): Shape {
    this.next = new Block(nextShape)
    return nextShape
  }

  lineFull(row: number): boolean {
    for (let x = 0; x < this.width; x++) {
      if (!this.cells.has(key(x, row))) return false
    }
    return true
  }

  private removeLine(row: number): void {
    const newCellColor = new Map<string, CellColor>()
    const newCells = new Set<string>()
    for (const [k0, color] of this.cellColor.entries()) {
      const { x, y } = parseKey(k0)
      if (y === row) continue
      const nk = y < row ? key(x, y + 1) : key(x, y)
      newCellColor.set(nk, color)
    }
    for (const k0 of this.cells) {
      const { x, y } = parseKey(k0)
      if (y === row) continue
      const nk = y < row ? key(x, y + 1) : key(x, y)
      newCells.add(nk)
    }
    this.cellColor = newCellColor
    this.cells = newCells
  }

  private clean(): number {
    const scores = [0, 100, 400, 800, 1600]
    let removed = 0
    for (let row = this.height - 1; row > 0; row--) {
      while (this.lineFull(row)) {
        this.removeLine(row)
        removed++
      }
    }
    return scores[removed]
  }

  private landBlock(): void {
    if (!this.falling) return
    for (const k0 of this.falling.cells) {
      this.cells.add(k0)
      this.cellColor.set(k0, this.falling.color)
    }
    this.falling = null
    this.score += this.clean()
    this.placeNextBlock()
  }

  move(direction: Direction): boolean {
    if (!this.falling) return false
    const before = this.falling.clone()

    if (direction === Direction.Drop) {
      while (!this.supported(this.falling)) {
        this.falling.move(Direction.Down)
        this.score += 1
      }
      this.landBlock()
      return true
    }

    // Try move
    this.falling.move(direction)
    if (this.collides(this.falling)) {
      this.falling = before
      return false
    }

    // Implicit down
    if (this.supported(this.falling)) {
      this.landBlock()
      return true
    } else {
      this.falling.move(Direction.Down)
      this.score += 1
      if (this.supported(this.falling)) {
        this.landBlock()
        return true
      }
    }
    return false
  }

  rotate(rotation: Rotation): boolean {
    if (!this.falling) return false
    const before = this.falling.clone()

    this.falling.rotate(rotation)
    // corrections like Python (bounds and collisions)
    // Correct left
    if (this.falling.left < 0) {
      const shift = -this.falling.left
      this.falling.move(Direction.Right, shift)
      if (this.falling.left < 0) {
        this.falling = before
        return false
      }
    }
    // Correct right
    if (this.falling.right >= this.width) {
      const shift = this.falling.right - this.width + 1
      this.falling.move(Direction.Left, shift)
      if (this.falling.right >= this.width) {
        this.falling = before
        return false
      }
    }
    // Correct top
    if (this.falling.top < 0) {
      const shift = -this.falling.top
      this.falling.move(Direction.Down, shift)
      if (this.falling.top < 0) {
        this.falling = before
        return false
      }
    }
    // Bottom overflow invalid
    if (this.falling.bottom >= this.height) {
      this.falling = before
      return false
    }
    if (this.collides(this.falling)) {
      this.falling = before
      return false
    }

    // Implicit down
    if (this.supported(this.falling)) {
      this.landBlock()
      return true
    } else {
      this.falling.move(Direction.Down)
      this.score += 1
      if (this.supported(this.falling)) {
        this.landBlock()
        return true
      }
    }
    return false
  }

  skip(): boolean {
    if (!this.falling) return false
    if (this.supported(this.falling)) {
      this.landBlock()
      return true
    }
    this.falling.move(Direction.Down)
    this.score += 1
    if (this.supported(this.falling)) {
      this.landBlock()
      return true
    }
    return false
  }
}
