export class TimeUtil {
  static getSecondDifference(date1: Date, date2: Date): number {
    return Math.abs(date1.getTime() - date2.getTime()) / 1000;
  }

  static secondToTime(seconds: number): string {
    return new Date(seconds * 1000).toISOString().substring(11, 19).replace("-", ":");
  }
}
