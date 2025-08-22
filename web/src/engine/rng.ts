import seedrandom from 'seedrandom'

export class SeededRandom {
  private rng: seedrandom.PRNG

  constructor(seed: number | string) {
    this.rng = seedrandom(String(seed))
  }

  next(): number {
    return this.rng()
  }

  nextInt(minInclusive: number, maxInclusive: number): number {
    const r = this.rng()
    return Math.floor(r * (maxInclusive - minInclusive + 1)) + minInclusive
  }
}
