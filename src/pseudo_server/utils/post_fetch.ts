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
import { filterAndSortPosts, getIsPostEligible } from "./post_filtering.js";
import {
  CurrSubData,
  PostData,
  PostDataObject,
  SubDataSource,
} from "../../data/types.js";
import {
  genAdditionalPostsForSubreddit,
  genPostsForSubreddit,
} from "../controllers/posts.js";

export const FETCH_LOGS = {
  existing: 0,
  fetched: 0,
  discarded: 0,
  score_too_low: 0,
  thumbnail_missing: 0,
  ineligible: 0,
  title_too_long: 0,
  no_score_thumbnail_title: 0,
  video: 0,
  ratio_wrong: 0,
  eligible: 0,
};

export async function genFilteredTopPostsData(
  context: Devvit.Context,
  subredditName: string,
  lastCursor: string,
  source: SubDataSource
): Promise<CurrSubData | null> {
  let cascading_error = null;

  const filtered_sub_data = await genPostsForSubreddit(
    context,
    subredditName,
    lastCursor,
    source
    // postDataObject
  );

  if (
    filtered_sub_data.postData == null ||
    filtered_sub_data.postData?.length === 0
  ) {
    console.log("EARLY RETURN NULL");
    printFetchLogs();
    // console.log("filtered posts is null");
    return null;
  }

  const post_data = filtered_sub_data.postData.filter(Boolean) as PostData[];
  const last_cursor = post_data[post_data.length - 1].id;

  // if (post_data.length < 100) {
  //   console.log("Initiating new additional posts fetch");
  //   return await genFilteredAdditionalTopPostsData(
  //     context,
  //     subredditName,
  //     last_cursor
  //   );
  // }

  const subData: CurrSubData = {
    name: subredditName,
    postData: post_data,
    lastCursor: last_cursor,
  };
  FETCH_LOGS.eligible += subData.postData.length;
  printFetchLogs();

  return subData;
}

export async function genFilteredAdditionalTopPostsData(
  context: Devvit.Context,
  subredditName: string,
  lastCursor: string,
  source: SubDataSource
): Promise<CurrSubData | null> {
  let cascading_error = null;

  // console.log("Post data objkect");
  // console.log(postDataObject);

  const filtered_sub_data = await genAdditionalPostsForSubreddit(
    context,
    subredditName,
    lastCursor,
    source
    // postDataObject
  );

  if (
    filtered_sub_data.postData == null ||
    filtered_sub_data.postData?.length === 0
  ) {
    console.log("EARLY RETURN NULL");
    console.log("filter_posts");
    console.log(filtered_sub_data);
    printFetchLogs();
    // console.log("filtered posts is null");
    return await genFilteredAdditionalTopPostsData(
      context,
      subredditName,
      "",
      SubDataSource.HOT
    );
    return null;
  }
  const post_data = filtered_sub_data.postData.filter(Boolean) as PostData[];
  const last_cursor = post_data[post_data.length - 1].id;

  if (post_data.length < 100) {
    console.log("Initiating new additional posts fetch");
    return await genFilteredAdditionalTopPostsData(
      context,
      subredditName,
      last_cursor,
      SubDataSource.HOT
    );
  }

  const subData: CurrSubData = {
    name: subredditName,
    postData: post_data,
    lastCursor: last_cursor,
  };

  FETCH_LOGS.eligible += subData.postData.length;
  printFetchLogs();
  return subData;
}

function printFetchLogs() {
  console.log("********** FETCH LOGS **********");
  console.log("Existing : ", FETCH_LOGS.existing);
  console.log("Fetched : ", FETCH_LOGS.fetched);
  console.log("Discarded : ", FETCH_LOGS.discarded);
  console.log("********************************");
  console.log("thumbnail_missing : ", FETCH_LOGS.thumbnail_missing);
  console.log(
    "no_score_thumbnail_title : ",
    FETCH_LOGS.no_score_thumbnail_title
  );
  console.log("ineligible : ", FETCH_LOGS.ineligible);
  console.log("video : ", FETCH_LOGS.video);
  console.log("score_low : ", FETCH_LOGS.score_too_low);
  console.log("ratio_wrong : ", FETCH_LOGS.ratio_wrong);
  console.log("title_too_long : ", FETCH_LOGS.title_too_long);
  console.log("********************************");
  console.log("ELIGIBLE : ", FETCH_LOGS.eligible);
  console.log("********************************");
}
