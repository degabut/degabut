export class ArrayUtil {
  static pickRankedRandom<T>(arr: T[]): T | undefined {
    const n = (Math.pow(arr.length, 2) + arr.length) / 2;

    const chances = arr.map((_, i) => (i + 1) / n).reverse();
    const oneBasedChances = chances.map((c, i, arr) => {
      const totalPrev = arr.slice(0, i).reduce((p, c) => p + c, 0);
      return c + totalPrev;
    });

    const random = Math.random();
    const index = oneBasedChances.findIndex((c) => c > random);

    return arr[index >= 0 ? index : 0];
  }

  static pickRandom<T>(arr: T[] | Set<T>): T | undefined {
    if (arr instanceof Set) arr = Array.from(arr);
    if (!arr.length) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static randomIndex<T>(array: T[]): number {
    if (!array.length) return -1;
    return Math.floor(Math.random() * array.length);
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
