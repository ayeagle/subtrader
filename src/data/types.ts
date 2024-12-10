import {
  AsyncError,
  EnrichedThumbnail,
  OEmbed,
  Subreddit,
  User,
} from "@devvit/public-api";
import { T2ID, T3ID, T5ID } from "@devvit/shared-types/tid.js";

export type PostData = {
  id: T3ID;
  title: string;
  score: number;
  image: EnrichedThumbnail;
  //   OEmbed: OEmbed | undefined;
  //   body: string | undefined;
  //   permalink: string | undefined;
  //   bodyHtml: string | undefined;
  //   thumbnailUrl: string | undefined;
};
export type CurrSubData = {
  name: string;
  // numberOfActiveUsers: number;
  posts: PostData[];
};

export type ScoreHistoryItem = {
  selected: PostData;
  other: PostData;
};

export type GeneralData = {
  username: string | null;
  userId: T2ID | null;
  subredditName: string;
  subredditId: T5ID;
  currentPostId: string | null;
  currSub: CurrSubData | null;
};

export type MemberKeyData = {
  username: string;
  subredditName: string;
  dateKey: string;
};

export type ScoreBoardEntry = {
  member: MemberKeyData;
  score: number;
};
