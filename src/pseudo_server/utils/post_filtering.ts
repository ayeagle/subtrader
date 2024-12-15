import { EnrichedThumbnail, Post } from "@devvit/public-api";
import {
  MemberKeyData,
  PostData,
  PostedScoreObject,
  ScoreHistoryItem,
} from "../../data/types.js";
import { FETCH_LOGS } from "./post_fetch.js";

const MAX_POST_LENGTH = 50;

export function getIsPostEligible(
  post: Post,
  thumbnail: EnrichedThumbnail | undefined
): boolean {
  if (post.title.length > MAX_POST_LENGTH) {
    FETCH_LOGS.title_too_long++;
    return false;
  }

  if (post.secureMedia?.redditVideo) {
    // Video content unsupported
    FETCH_LOGS.video++;

    return false;
  }

  if (!thumbnail || !post.title || !post.score) {
    // Missing key data
    FETCH_LOGS.no_score_thumbnail_title++;
    return false;
  }

  if (post.score < 10) {
    // Missing key data
    FETCH_LOGS.score_too_low++;
    return false;
  }

  const height =
    (thumbnail?.image.height === 0 ? 1 : thumbnail?.image.height) ?? 1;
  const width =
    (thumbnail?.image.width === 0 ? 1 : thumbnail?.image.width) ?? 1;
  const ratio = height / width;
  if (ratio < 0.7 || ratio > 1.3) {
    FETCH_LOGS.ratio_wrong++;

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

export function getJSONScoreHistory(scoreHistory: ScoreHistoryItem[]): string {
  return JSON.stringify(scoreHistory);
}

// export function getSubTraderPostLookupKey(subredditName: string): string {
//   const data = {
//     date: getCurrentDateInPST(),
//     subredditName: subredditName,
//     username: username,
//     subreddit:
//   };
//   return JSON.stringify(data);
// }

export function getJSONPostIds(postIds: string[]): string {
  // console.log("JSON POST IDS")
  // console.log(postIds)
  // console.log(JSON.stringify(postIds))
  return JSON.stringify(postIds);
}

export function getUnmarshalledPostIDs(data: string): string[] {
  // console.log("JSON UNMARSHALLED POST IDS")
  // console.log(data)
  // console.log(JSON.parse(data))
  return JSON.parse(data);
}

export function getJSONMemberKeyData(data: MemberKeyData): string {
  return JSON.stringify(data);
}

export function getUnencodedMemberKeyData(data: string): MemberKeyData {
  return JSON.parse(data);
}

export function getJSONPostedScoreObject(data: PostedScoreObject): string {
  return JSON.stringify(data);
}

export function getUnmarshalledPostedScoreObject(
  data: string
): PostedScoreObject {
  // console.log("JSON UNMARSHALLED POST IDS")
  // console.log(data)
  // console.log(JSON.parse(data))
  return JSON.parse(data);
}
