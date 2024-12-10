import {
  AsyncError,
  Devvit,
  EnrichedThumbnail,
  GetHotPostsOptions,
  Post,
  SubredditData,
  useAsync,
  UseAsyncResult,
  useInterval,
  useState,
} from "@devvit/public-api";
import { CurrSubData, PostData } from "../../src/data/types.js";
import {
  filterAndSortPosts,
  getIsPostEligible,
} from "./post_filtering.server.js";
import { getPostDataFromPostAndThumbnail } from "../data_cleaning/post_cleaning.server.js";
import { genPostsForSubreddit } from "../controllers/posts.server.js";

export async function genFilteredTopPostsData(
  context: Devvit.Context,
  subredditName: string
): Promise<CurrSubData | null> {
  let cascading_error = null;

  const filteredPosts = await genPostsForSubreddit(context, subredditName);

  if (filteredPosts == null || filteredPosts?.length === 0) {
    console.log("filtered posts is null");
    return null;
  }

  const subData: CurrSubData = {
    name: subredditName,
    posts: filteredPosts.filter(Boolean) as PostData[],
  };

  return subData;
}
