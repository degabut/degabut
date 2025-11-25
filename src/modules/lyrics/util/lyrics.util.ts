export class LyricsUtil {
  private static possibleIdTags = [
    "ti",
    "ar",
    "al",
    "au",
    "lr",
    "length",
    "by",
    "offset",
    "re",
    "tool",
    "ve",
    "#",
  ];

  public static parseLrc(lrcText: string) {
    const lines = lrcText.split("\n");
    const result: { startTimeMs: number; words: string }[] = [];
    const idTags = new Map<string, string>();

    // Parse time in [mm:ss.xx] or <mm:ss.xx> format to milliseconds
    function parseTime(timeStr: string) {
      const match = timeStr.match(/(\d+):(\d+\.\d+)/);
      if (!match) return null;
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      return Math.round((minutes * 60 + seconds) * 1000);
    }

    // Process each line
    lines.forEach((line) => {
      line = line.trim();

      // Match ID tags [type:value]
      const idTagMatch = line.match(/^\[(\w+):(.*)]$/);
      if (idTagMatch && this.possibleIdTags.includes(idTagMatch[1])) {
        idTags.set(idTagMatch[1], idTagMatch[2]);
        return;
      }

      // Match time tags with lyrics
      const timeTagRegex = /\[(\d+:\d+\.\d+)]/g;

      const timeTags: number[] = [];
      let match;
      while ((match = timeTagRegex.exec(line)) !== null) {
        timeTags.push(<number>parseTime(match[1]));
      }

      if (timeTags.length === 0) return; // Skip lines without time tags

      const lyricPart = line.replace(timeTagRegex, "").trim();

      // Extract enhanced lyrics (if available)
      result.push({
        startTimeMs: Math.max(...timeTags),
        words: lyricPart,
      });
    });

    return result;
  }
}
