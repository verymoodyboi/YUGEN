export class ExponentialBackoff {
  private attempt = 0;

  constructor(private baseMs: number = 500, private maxMs: number = 30000) {}

  next(): number {
    this.attempt++;
    const delay = Math.min(this.baseMs * Math.pow(2, this.attempt - 1), this.maxMs);
    return delay;
  }

  reset() {
    this.attempt = 0;
  }
}
