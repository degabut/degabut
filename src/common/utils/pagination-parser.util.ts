export class PaginatedQueryParser<T, Y> {
  constructor(private parser: (data: T) => Y) {}

  encode(data: T[], limit: number): string | null {
    if (data.length < limit) return null;
    const lastData = data.at(data.length - 1);
    if (!lastData) return null;
    return Buffer.from(JSON.stringify(this.parser(lastData))).toString("base64");
  }

  decode(token?: string): Y | undefined {
    if (!token) return undefined;
    return JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
  }
}
