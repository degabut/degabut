import { MAX_QUEUE_TRACKS } from "@queue/queue.constants";

export const MAX_VIDEO_AGE = 60 * 60 * 24 * 14; // 14 days
export const MAX_PLAYLIST_VIDEOS_PAGE = Math.ceil(MAX_QUEUE_TRACKS / 100); // 100 youtube video per page

export const YOUTUBEI_PROVIDER = "YOUTUBEI_PROVIDER";
export const YOUTUBEI_MUSIC_PROVIDER = "YOUTUBEI_MUSIC_PROVIDER";
