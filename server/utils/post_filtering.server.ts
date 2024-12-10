import { EnrichedThumbnail, Post } from "@devvit/public-api";
import { MemberKeyData, PostData } from "../../src/data/types.js";
import { STORAGE_DELIMITER } from "../consts.server.js";

const MAX_POST_LENGTH = 50;

export function getIsPostEligible(
  post: Post,
  thumbnail: EnrichedThumbnail | undefined
): boolean {
  if (post.title.length > MAX_POST_LENGTH) {
    return false;
  }

  if (post.secureMedia?.redditVideo) {
    // Video content unsupported
    return false;
  }

  if (!thumbnail || !post.title || !post.score) {
    // Missing key data
    return false;
  }
  const height =
    (thumbnail?.image.height === 0 ? 1 : thumbnail?.image.height) ?? 1;
  const width =
    (thumbnail?.image.width === 0 ? 1 : thumbnail?.image.width) ?? 1;
  const ratio = height / width;
  if (ratio < 0.7 || ratio > 1.3) {
    // Weird ratios unsupported
    return false;
  }

  return true;
}

export function filterAndSortPosts(posts: PostData[] | null): PostData[] {
  return posts?.filter(Boolean) as PostData[];
  // ?.sort((a, b) => (Math.random() > 0.5 ? 1 : -1))
}

export function getCurrentDateInPST() {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });

  const pstDate = new Date(now);

  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, "0");
  const day = String(pstDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getJSONSubredditDateKey(subredditName: string): string {
  const data = {
    date: getCurrentDateInPST(),
    subredditName: subredditName,
  };
  return JSON.stringify(data);
}

export function getJSONPostIds(postIds: string[]): string {
  return JSON.stringify(postIds);
}

export function getUnmarshalledPostIDs(data: string): string[] {
  return JSON.parse(data);
}

export function getJSONMemberKeyData(data: MemberKeyData): string {
  return JSON.stringify(data);
}

export function getUnencodedMemberKeyData(data: string): MemberKeyData {
  return JSON.parse(data);
}
