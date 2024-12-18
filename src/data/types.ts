import {
  AsyncError,
  EnrichedThumbnail,
  Post,
  Listing,
  OEmbed,
  Subreddit,
  User,
  Devvit,
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

export type UXConfig = {
  smallFont: Devvit.Blocks.TextSize;
  largeFont: Devvit.Blocks.TextSize;
  maxWidth: Devvit.Blocks.SizeString;
  smallButtonSize: Devvit.Blocks.ButtonSize;
  largeButtonSize: Devvit.Blocks.ButtonSize;
  lightRedColor: Devvit.Blocks.ColorString;
  darkRedColor: Devvit.Blocks.ColorString;
  lightGreenColor: Devvit.Blocks.ColorString;
  darkGreenColor: Devvit.Blocks.ColorString;
  lightBackgroundColor: Devvit.Blocks.ColorString;
  darkBackgroundColor: Devvit.Blocks.ColorString;
};

export type PostDataObject = Listing<Post> | null;

export type CurrSubData = {
  name: string;
  // numberOfActiveUsers: number;
  postData: PostData[];
  lastCursor: string;
};

export type ScoreHistoryItem = {
  selected: PostData;
  other: PostData;
  scoreChangeValue: number;
  cumScore: number;
};

export type GeneralData = {
  username: string | null;
  userId: T2ID | null;
  subredditName: string;
  subredditId: T5ID;
  currentPostId: string | null;
  currSub: CurrSubData | null;
  prevHistory: PostedScoreObject | null;
  isViewerPoster: boolean;
  // postDataObject: PostDataObject;s
};

export type MemberKeyData = {
  username: string;
  subredditName: string;
  dateKey: string;
};

export type ScoreBoardEntry = {
  member: MemberKeyData;
  score: number;
  rank?: number;
};

export type ScoreBoards = {
  globalScoreboard: ScoreBoardEntry[];
  subredditScoreboard: ScoreBoardEntry[];
  globalRank: ScoreBoardEntry | null;
  subredditRank: ScoreBoardEntry | null;
};

export type PostedScoreObject = {
  scoreHistory: ScoreHistoryItem[];
  totalScore: number;
  numTrades: number;
  generalData: GeneralData;
};

export enum GameOverPageType {
  OVERVIEW = "overview",
  GLOBAL = "global",
  SUBREDDIT = "subreddit",
}

export enum SubDataSource {
  TOP = "top",
  HOT = "hot",
  NEW = "new",
}
