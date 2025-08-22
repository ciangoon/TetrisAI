import { Direction, Rotation } from '../engine/enums'
import { Board } from '../engine/Board'

export class PlayerAI {
  // Weights (tuned roughly; adjust as desired)
  holesWeight = -0.6
  bumpinessWeight = -0.18
  completeLinesWeight = 0.8
  aggregateHeightWeight = -0.5
  maxHeightWeight = -0.02
  rowTransitionsWeight = -0.15
  colTransitionsWeight = -0.15
  cumulativeWellsWeight = -0.08
  holeDepthWeight = -0.08
  rowsWithHolesWeight = -0.25
  landingHeightWeight = 0.2 // rewards deeper landings (bigger y average)

  private columnHeights(board: Board): number[] {
    const heights: number[] = []
    for (let x = 0; x < board.width; x++) {
      let h = 0
      for (let y = 0; y < board.height; y++) {
        if (board.cells.has(`${x},${y}`)) {
          h = board.height - y
          break
        }
        if (y === board.height - 1) {
          h = 0
        }
      }
      heights.push(h)
    }
    return heights
  }

  private bumpiness(heights: number[], board: Board): number {
    let s = 0
    for (let x = 0; x < board.width - 1; x++) {
      s += Math.abs(heights[x] - heights[x + 1])
    }
    return s
  }

  private completeLines(board: Board): number {
    let complete = 0
    for (let y = 0; y < board.height; y++) {
      let full = true
      for (let x = 0; x < board.width; x++) {
        if (!board.cells.has(`${x},${y}`)) { full = false; break }
      }
      if (full) complete += 1
    }
    return complete
  }

  private holesAndDepth(board: Board): { holes: number; rowsWithHoles: number; holeDepth: number } {
    let holes = 0
    let rowsWithHoles = 0
    let holeDepth = 0

    for (let x = 0; x < board.width; x++) {
      let filledCountAbove = 0
      const rowHasHole: Set<number> = new Set()
      for (let y = 0; y < board.height; y++) {
        const filled = board.cells.has(`${x},${y}`)
        if (filled) {
          filledCountAbove += 1
        } else {
          if (filledCountAbove > 0) {
            holes += 1
            rowHasHole.add(y)
            holeDepth += filledCountAbove // deeper holes penalized more
          }
        }
      }
      rowsWithHoles += rowHasHole.size
    }

    return { holes, rowsWithHoles, holeDepth }
  }

  private rowTransitions(board: Board): number {
    let transitions = 0
    for (let y = 0; y < board.height; y++) {
      let prev = 1 // wall considered filled
      for (let x = 0; x < board.width; x++) {
        const cur = board.cells.has(`${x},${y}`) ? 1 : 0
        if (cur !== prev) transitions += 1
        prev = cur
      }
      if (prev !== 1) transitions += 1 // right wall
    }
    return transitions
  }

  private colTransitions(board: Board): number {
    let transitions = 0
    for (let x = 0; x < board.width; x++) {
      let prev = 1 // top wall considered filled
      for (let y = 0; y < board.height; y++) {
        const cur = board.cells.has(`${x},${y}`) ? 1 : 0
        if (cur !== prev) transitions += 1
        prev = cur
      }
      if (prev !== 1) transitions += 1 // bottom wall
    }
    return transitions
  }

  private cumulativeWells(heights: number[], board: Board): number {
    let total = 0
    for (let x = 0; x < board.width; x++) {
      const left = x === 0 ? Number.MAX_SAFE_INTEGER : heights[x - 1]
      const right = x === board.width - 1 ? Number.MAX_SAFE_INTEGER : heights[x + 1]
      const h = heights[x]
      const minNeighbor = Math.min(left, right)
      const d = Math.max(0, minNeighbor - h)
      // cumulative (1 + 2 + ... + d) = d*(d+1)/2
      total += (d * (d + 1)) / 2
    }
    return total
  }

  private evaluate(board: Board, landingHeightAvg = 0): number {
    const heights = this.columnHeights(board)
    const totalHeight = heights.reduce((a, b) => a + b, 0)
    const bumpiness = this.bumpiness(heights, board)
    const completeLines = this.completeLines(board)
    const { holes, rowsWithHoles, holeDepth } = this.holesAndDepth(board)
    const rowTrans = this.rowTransitions(board)
    const colTrans = this.colTransitions(board)
    const wells = this.cumulativeWells(heights, board)
    const maxHeight = Math.max(...heights)

    const score =
      totalHeight * this.aggregateHeightWeight +
      bumpiness * this.bumpinessWeight +
      completeLines * this.completeLinesWeight +
      holes * this.holesWeight +
      wells * this.cumulativeWellsWeight +
      rowTrans * this.rowTransitionsWeight +
      colTrans * this.colTransitionsWeight +
      holeDepth * this.holeDepthWeight +
      rowsWithHoles * this.rowsWithHolesWeight +
      maxHeight * this.maxHeightWeight +
      landingHeightAvg * this.landingHeightWeight

    return score
  }

  findBestMove(board: Board): { position: number; rotation: number } {
    let bestScore = -Infinity
    let bestPos = 0
    let bestRot = 0

    const centerColumn = Math.floor(board.width / 2)

    for (let position = 0; position < board.width; position++) {
      for (let rotation = 0; rotation < 4; rotation++) {
        const sandbox = board.clone()
        // rotate rotation times
        for (let i = 0; i < rotation; i++) {
          sandbox.rotate(Rotation.Clockwise)
        }

        // attempt to move towards target column from center
        const delta = position - centerColumn
        if (delta < 0) {
          for (let i = 0; i < -delta; i++) sandbox.move(Direction.Left)
        } else if (delta > 0) {
          for (let i = 0; i < delta; i++) sandbox.move(Direction.Right)
        }

        // Estimate landing height by ghost-dropping the current falling piece
        let landingAvg = 0
        if (sandbox.falling) {
          const ghost = sandbox.falling.clone()
          // drop ghost without mutating board cells
          while (true) {
            let wouldCollide = false
            for (const k of ghost.cells) {
              const [xs, ys] = (k as string).split(',')
              const x = parseInt(xs, 10)
              const y = parseInt(ys, 10)
              if (y + 1 === sandbox.height || sandbox.cells.has(`${x},${y + 1}`)) {
                wouldCollide = true
                break
              }
            }
            if (wouldCollide) break
            ghost.move(Direction.Down)
          }
          // average landing y (bigger is deeper)
          let sumY = 0
          let count = 0
          for (const k of ghost.cells) {
            sumY += parseInt((k as string).split(',')[1], 10)
            count += 1
          }
          landingAvg = count > 0 ? sumY / count : 0
        }

        // drop to lock piece and evaluate final board
        sandbox.move(Direction.Drop)

        const score = this.evaluate(sandbox, landingAvg)
        if (
          score > bestScore ||
          (score === bestScore && position === centerColumn)
        ) {
          bestScore = score
          bestPos = position
          bestRot = rotation
        }
      }
    }
    return { position: bestPos, rotation: bestRot }
  }

  buildMoveSequence(board: Board, position: number, rotation: number): (Direction | Rotation)[] {
    const seq: (Direction | Rotation)[] = []
    for (let i = 0; i < rotation; i++) seq.push(Rotation.Clockwise)
    const centerColumn = Math.floor(board.width / 2)
    const delta = position - centerColumn
    if (delta < 0) for (let i = 0; i < -delta; i++) seq.push(Direction.Left)
    if (delta > 0) for (let i = 0; i < delta; i++) seq.push(Direction.Right)
    seq.push(Direction.Drop)
    return seq
  }
}
