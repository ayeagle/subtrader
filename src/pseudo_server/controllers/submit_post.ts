import { Devvit } from "@devvit/public-api";
import { POSTED_SCORES_KEY, TESTING_SUB_KEY } from "../consts.js";
import {
  MemberKeyData,
  PostedScoreObject,
  ScoreHistoryItem,
} from "../../data/types.js";
import {
  getCurrentDateInPST,
  getJSONPostedScoreObject,
  getUnmarshalledPostedScoreObject,
} from "../utils/post_filtering.js";

export async function genStorePostedScoreHistory(
  context: Devvit.Context,
  data: PostedScoreObject,
  postId: string
): Promise<void> {
  let subredditName = TESTING_SUB_KEY ?? data.generalData.subredditName;

  const score_board_entry = getJSONPostedScoreObject(data);

  await context.redis.hSet(POSTED_SCORES_KEY, {
    [postId]: score_board_entry,
  });

  const stored_data = await context.redis.hGet(POSTED_SCORES_KEY, postId);
  console.log("STORED DATA");
  console.log(stored_data);
  console.log("stored_data");
  console.log(getUnmarshalledPostedScoreObject(stored_data ?? ""));

  //   const stored_data2 = await context.redis.hGetAll(POSTED_SCORES_KEY);
  //   console.log("STORED DATA2");
  //   console.log(stored_data2);
  //   console.log("stored_data2");
  //   console.log(getUnmarshalledPostedScoreObject(stored_data2[0] ?? ""));

  //   const member_key_raw_data: MemberKeyData = {
  //     username: data.generalData.username ?? "" + Math.floor(Math.random() * 100),
  //     subredditName: subredditName,
  //     dateKey: getCurrentDateInPST(),
  //   };
  //   const member_key = getJSONMemberKeyData(member_key_raw_data);
}

export async function genRetrievePostedScoreHistory(
  context: Devvit.Context,
  postId: string
): Promise<PostedScoreObject | null> {
  let subredditName = TESTING_SUB_KEY ?? context.subredditName;

  console.log("attempting to retrieve post history");

  const stored_data = await context.redis.hGet(POSTED_SCORES_KEY, postId);
  if (!stored_data) {
    console.log("stored data is null");
    return null;
  }

  // console.log("STORED DATA");
  // console.log(stored_data);
  // console.log("stored_data");
  // console.log(getUnmarshalledPostedScoreObject(stored_data ?? ""));

  return getUnmarshalledPostedScoreObject(
    stored_data ?? ""
  ) as PostedScoreObject;

  //   const stored_data2 = await context.redis.hGetAll(POSTED_SCORES_KEY);
  //   console.log("STORED DATA2");
  //   console.log(stored_data2);
  //   console.log("stored_data2");
  //   console.log(getUnmarshalledPostedScoreObject(stored_data2[0] ?? ""));

  //   const member_key_raw_data: MemberKeyData = {
  //     username: data.generalData.username ?? "" + Math.floor(Math.random() * 100),
  //     subredditName: subredditName,
  //     dateKey: getCurrentDateInPST(),
  //   };
  //   const member_key = getJSONMemberKeyData(member_key_raw_data);
}
