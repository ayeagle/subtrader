import {
  Devvit,
  EnrichedThumbnail,
  GetHotPostsOptions,
  Post,
} from "@devvit/public-api";
import {
  MemberKeyData,
  PostData,
  ScoreBoardEntry,
  ScoreBoards,
  GameOverPageType,
} from "../../data/types.js";
import { getPostDataFromPostAndThumbnail } from "../data_cleaning/post_cleaning.js";
import {
  filterAndSortPosts,
  getCurrentDateInPST,
  getIsPostEligible,
  getJSONMemberKeyData,
  getJSONSubredditDateKey,
  getUnencodedMemberKeyData,
} from "../utils/post_filtering.js";
import { GLOBAL_LEADERBOARD, TESTING_SUB_KEY } from "../consts.js";

// export async function genAddScoreboardListing(
//   context: Devvit.Context,
//   subredditName: string,
//   username: string,
//   score: number
// ): Promise<ScoreBoardEntry[]> {
//   subredditName = TESTING_SUB_KEY ?? subredditName;
//   // console.log("genAddScoreboardListing triggered");

//   //   const subreddit_date_lookup_key = getJSONSubredditDateKey(subredditName);

//   const member_key_raw_data: MemberKeyData = {
//     username: username + Math.floor(Math.random() * 100),
//     subredditName: subredditName,
//     dateKey: getCurrentDateInPST(),
//   };
//   const member_key = getJSONMemberKeyData(member_key_raw_data);

//   //   // console.log("GLOBAL_LEADERBOARD", GLOBAL_LEADERBOARD);
//   //   // console.log("subreddit_date_lookup_key", subreddit_date_lookup_key);
//   //   // console.log("subredditName", subredditName);
//   //   // console.log("member_key", member_key);
//   //   // console.log("score", score);

//   //   // console.log("ENCODING STUFF");
//   //   // console.log("ENCODING STUFF");
//   //   // console.log("ENCODING STUFF");
//   //   // console.log(member_key);
//   //   // console.log(getUnencodedMemberKeyData(member_key));

//   //   // console.log(
//   //     "Types:",
//   //     await Promise.all([
//   //       context.redis.type(GLOBAL_LEADERBOARD),
//   //       context.redis.type(subreddit_date_lookup_key),
//   //       context.redis.type(subredditName),
//   //       context.redis.type(member_key),
//   //     ])
//   //   );
//   // const removed1 = await context.redis.zRemRangeByRank(
//   //   GLOBAL_LEADERBOARD,
//   //   0,
//   //   1000000
//   // );
//   // const removed2 = await context.redis.zRemRangeByRank(
//   //   subredditName,
//   //   0,
//   //   1000000
//   // );

//   // // console.log("Remvoved from global: ", removed1)
//   // // console.log("Remvoved from sub: ", removed2)

//   const newname = member_key;
//   // console.log(
//     "Global Cardinality: " + (await context.redis.zCard(GLOBAL_LEADERBOARD))
//   );
//   // console.log("Sub Cardinality: " + (await context.redis.zCard(subredditName)));

//   const [global, sub] = await Promise.all([
//     await context.redis.zAdd(GLOBAL_LEADERBOARD, {
//       member: newname,
//       score: score,
//     }),
//     await context.redis.zAdd(subredditName, {
//       member: newname,
//       score: score,
//     }),
//     //   await context.redis.zAdd(subreddit_date_lookup_key, {
//     //     member: member_key2,
//     //     score: score,
//     //   }),
//   ]);

//   // console.log(
//     "AFTER Global Cardinality: " +
//       (await context.redis.zCard(GLOBAL_LEADERBOARD))
//   );
//   // console.log(
//     "AFTER Sub Cardinality: " + (await context.redis.zCard(subredditName))
//   );

//   // console.log("GLOBAL ADDED: ", global);
//   // console.log("SUB ADDED: ", sub);

//   const top10GlobalScores = await context.redis.zRange(
//     GLOBAL_LEADERBOARD, // Key in Redis
//     0, // Start index (top score)
//     5000, // End index (10th score)
//     {
//       by: "score", // Sort by score
//       reverse: true, // Descending order
//     }
//   );

//   const unencoded_top_scores = top10GlobalScores.map((item) => {
//     return {
//       member: getUnencodedMemberKeyData(item.member),
//       score: item.score,
//     } as ScoreBoardEntry;
//   });

//   // console.log("top10GlobalScores");
//   // console.log(unencoded_top_scores);

//   return unencoded_top_scores;
//   // return;
// }

// export async function genGlobalScoreboard(
//   context: Devvit.Context
//   //   subredditName: string,
//   //   username: string,
//   //   score: number
// ): Promise<ScoreBoardEntry[]> {
//   //   subredditName = TESTING_SUB_KEY ?? subredditName;
//   // console.log("attempting to get scoreboard");
//   const top10GlobalScores = await context.redis.zRange(
//     GLOBAL_LEADERBOARD, // Key in Redis
//     0, // Start index (top score)
//     9, // End index (10th score)
//     {
//       by: "score", // Sort by score
//       reverse: true, // Descending order
//     }
//   );

//   const unencoded_top_scores = top10GlobalScores.map((item) => {
//     return {
//       member: getUnencodedMemberKeyData(item.member),
//       score: item.score,
//     } as ScoreBoardEntry;
//   });

//   // console.log("top10GlobalScores");
//   // console.log(unencoded_top_scores);

//   return unencoded_top_scores;
// }

// const top10GlobalScores = await context.redis.zRange(
//     GLOBAL_LEADERBOARD, // Key in Redis
//     0, // Start index (top score)
//     9, // End index (10th score)
//     {
//       by: "score", // Sort by score
//       reverse: true, // Descending order
//     }
//   );

//   // console.log("Top 10 global Scores:", top10GlobalScores);

//   const top10Scores = await context.redis.zRange(
//     subredditName, // Key in Redis
//     0, // Start index (top score)
//     9, // End index (10th score)
//     {
//       by: "score", // Sort by score
//       reverse: false, // Descending order
//     }
//   );

//   // console.log("Top 10 Scores:", top10Scores);

//   const scores1 = await context.redis.zRange(subredditName as string, 0, 30, {
//     by: "score",
//   });
//   // console.log("scores1: ", scores1);

//   //   const scores2 = await context.redis.zRange(
//   //     subreddit_date_lookup_key as string,
//   //     0,
//   //     30,
//   //     { by: "score" }
//   //   );
//   //   // console.log("scores2: ", scores2);

//   //   const scores3 = await context.redis.zRange(subredditName as string, 0, 30, {
//   //     by: "score",
//   //   });
//   //   // console.log("scores3: ", scores3);

//   // gets the associated score
//   const scores4 = await context.redis.zScore(subredditName, member_key);
//   // console.log("scores4: ", scores4);

//   //   const scores5 = await context.redis.zScore(
//   //     subreddit_date_lookup_key,
//   //     member_key
//   //   );
//   //   // console.log("scores5: ", scores5);

//   //   const scores6 = await context.redis.zScore(subredditName, member_key);
//   //   // console.log("scores6: ", scores6);

//   // gets the rank
//   const rank1 = await context.redis.zRank(subredditName, member_key);
//   // console.log("rank1: ", rank1);

//   const rank2 = await context.redis.zRank(
//     subreddit_date_lookup_key,
//     member_key
//   );
//   // console.log("rank2: ", rank2);

//   const rank3 = await context.redis.zRank(subredditName, member_key);
//   // console.log("rank3: ", rank3);

//   await Promise.all([
//     context.redis.zRank(GLOBAL_LEADERBOARD, {
//       member: member_key,
//     }),
//     context.redis.zAdd(subreddit_date_lookup_key, {
//       member: member_key,
//       score: score,
//     }),
//     context.redis.zAdd(subredditName, {
//       member: member_key,
//       score: score,
//     }),
//   ]);

//   const lookup_key = getJSONSubredditDateKey(subredditName);

//   // console.log("current lookup key: ", lookup_key);

//   const postsIds = await context.redis.hGet(lookup_key, POST_IDS_KEY);
//   // console.log("associated posts: ", postsIds);

// if (!postsIds) {
//   // console.log("Looking up new data");
//   const new_posts = await genTopPostsForSubreddit(context);
//   // // console.log("these are the new posts");
//   // // console.log(new_posts);
//   await genUpdateWithNewPostsData(context, subredditName, new_posts);
//   return new_posts;
// } else {
//   // console.log("Looking up old data");

//   return await genGatherPostsForSubreddit(context, postsIds);
// }

// export async function genAddScoreboardListingV2(
//   context: Devvit.Context,
//   subredditName: string,
//   username: string,
//   score: number
// ): Promise<ScoreBoardEntry[][]> {
//   subredditName = TESTING_SUB_KEY ?? subredditName;
//   // console.log("genAddScoreboardListing triggered");

//   //   const subreddit_date_lookup_key = getJSONSubredditDateKey(subredditName);

//   const member_key_raw_data: MemberKeyData = {
//     username: username + Math.floor(Math.random() * 100),
//     subredditName: subredditName,
//     dateKey: getCurrentDateInPST(),
//   };
//   const member_key = getJSONMemberKeyData(member_key_raw_data);

//   const newname = member_key;
//   // console.log(
//     "Global Cardinality: " + (await context.redis.zCard(GLOBAL_LEADERBOARD))
//   );
//   // console.log("Sub Cardinality: " + (await context.redis.zCard(subredditName)));

//   const [global, sub] = await Promise.all([
//     await context.redis.zAdd(GLOBAL_LEADERBOARD, {
//       member: newname,
//       score: score,
//     }),
//     await context.redis.zAdd(subredditName, {
//       member: newname,
//       score: score,
//     }),
//   ]);

//   // console.log(
//     "AFTER Global Cardinality: " +
//       (await context.redis.zCard(GLOBAL_LEADERBOARD))
//   );
//   // console.log(
//     "AFTER Sub Cardinality: " + (await context.redis.zCard(subredditName))
//   );

//   // console.log("GLOBAL ADDED: ", global);
//   // console.log("SUB ADDED: ", sub);

//   const [top10GlobalScores, top10SubScores] = await Promise.all([
//     await context.redis.zRange(
//       GLOBAL_LEADERBOARD, // Key in Redis
//       0, // Start index (top score)
//       5000, // End index (10th score)
//       {
//         by: "score", // Sort by score
//         reverse: true, // Descending order
//       }
//     ),
//     await context.redis.zRange(
//       subredditName, // Key in Redis
//       0, // Start index (top score)
//       5000, // End index (10th score)
//       {
//         by: "score", // Sort by score
//         reverse: true, // Descending order
//       }
//     ),
//   ]);

//   const unencoded_top_global_scores = top10GlobalScores.map((item) => {
//     return {
//       member: getUnencodedMemberKeyData(item.member),
//       score: item.score,
//     } as ScoreBoardEntry;
//   });
//   const unencoded_top_sub_scores = top10GlobalScores.map((item) => {
//     return {
//       member: getUnencodedMemberKeyData(item.member),
//       score: item.score,
//     } as ScoreBoardEntry;
//   });

//   // console.log("top10GlobalScores");
//   // console.log(unencoded_top_global_scores);
//   // console.log("top10TopScores");
//   // console.log(unencoded_top_sub_scores);
//   return [unencoded_top_global_scores, unencoded_top_sub_scores];
//   // return;
// }

export async function genScoreboardData(
  context: Devvit.Context,
  subredditName: string,
  username: string
): Promise<ScoreBoards> {
  subredditName = TESTING_SUB_KEY ?? subredditName;

  const [global_scores, sub_scores] = await Promise.all([
    await genGetGlobalTopScoreboard(context),
    await genGetSubredditTopScoreboard(context, subredditName),
  ]);

  const [sub_rank, global_rank] = await Promise.all([
    await genSubredditRank(context, subredditName, username),
    await genGlobalRank(context, subredditName, username),
  ]);

  const scoreboards: ScoreBoards = {
    globalScoreboard: global_scores,
    subredditScoreboard: sub_scores,
    globalRank: global_rank,
    subredditRank: sub_rank,
  };

  console.log("HOLY SHITPASTE");
  console.log("HOLY SHITPASTE");
  console.log("HOLY SHITPASTE");
  console.log("HOLY SHITPASTE");
  console.log("HOLY SHITPASTE");
  console.log("HOLY SHITPASTE");
  console.log("66666666666666666666666666666666666666666666");
  console.log(scoreboards);

  return scoreboards;
}

export async function genAndPostScoreboardData(
  context: Devvit.Context,
  subredditName: string,
  username: string,
  score: number
): Promise<ScoreBoards> {
  await genUpdateScoreboards(context, subredditName, username, score);

  return await genScoreboardData(context, subredditName, username);
}

export async function genUpdateScoreboards(
  context: Devvit.Context,
  subredditName: string,
  username: string,
  score: number
): Promise<void> {
  subredditName = TESTING_SUB_KEY ?? subredditName;
  // console.log("genAddScoreboardListing triggered using subreddit name");
  // console.log(subredditName);

  const member_key_raw_data: MemberKeyData = {
    username: username, //+ Math.floor(Math.random() * 2),
    subredditName: subredditName,
    dateKey: getCurrentDateInPST(),
  };
  const member_key = getJSONMemberKeyData(member_key_raw_data);

  const newname = member_key;
  // console.log(
  //   "Global Cardinality: " + (await context.redis.zCard(GLOBAL_LEADERBOARD))
  // );
  // console.log("Sub Cardinality: " + (await context.redis.zCard(subredditName)));

  const [global, sub] = await Promise.all([
    await context.redis.zAdd(GLOBAL_LEADERBOARD, {
      member: newname,
      score: score,
    }),
    await context.redis.zAdd(subredditName, {
      member: newname,
      score: score,
    }),
    //   await context.redis.zAdd(subreddit_date_lookup_key, {
    //     member: member_key2,
    //     score: score,
    //   }),
  ]);
}

export async function genGetGlobalTopScoreboard(
  context: Devvit.Context
): Promise<ScoreBoardEntry[]> {
  console.log("Redis zrank get global scoreboard");
  console.log(GLOBAL_LEADERBOARD);

  const top10GlobalScores = await context.redis.zRange(
    GLOBAL_LEADERBOARD,
    0,
    9,
    {
      by: "rank",
      reverse: true,
    }
  );

  // console.log(
  //   "Global Cardinality: " + (await context.redis.zCard(GLOBAL_LEADERBOARD))
  // );

  // console.log("global tops");
  // console.log(top10GlobalScores);

  return getUnencodeMemberData(top10GlobalScores);
}

export async function genGetSubredditTopScoreboard(
  context: Devvit.Context,
  subredditName: string
): Promise<ScoreBoardEntry[]> {
  console.log("Redis zrank get sub scoreboard");
  console.log(subredditName);
  const top10SubredditScores = await context.redis.zRange(
    subredditName, // Key in Redis
    0,
    9,
    {
      by: "rank",
      reverse: true,
    }
  );

  // console.log("sub tops");
  // console.log(top10SubredditScores);

  return getUnencodeMemberData(top10SubredditScores);
}

export async function genSubredditRank(
  context: Devvit.Context,
  subredditName: string,
  username: string
): Promise<ScoreBoardEntry | null> {
  const member_key_raw_data: MemberKeyData = {
    username: username, //+ Math.floor(Math.random() * 2),
    subredditName: subredditName,
    dateKey: getCurrentDateInPST(),
  };
  const member_key = getJSONMemberKeyData(member_key_raw_data);

  console.log("Redis zScore zRank scoreboard");
  console.log(subredditName);
  console.log(member_key);

  const [sub_score, sub_rank, total] = await Promise.all([
    context.redis.zScore(subredditName, member_key),
    context.redis.zRank(subredditName, member_key),
    context.redis.zCard(subredditName),
  ]);

  if (!sub_score) {
    return null;
  }

  const rank: ScoreBoardEntry = {
    member: member_key_raw_data,
    score: sub_score,
    rank: total - (sub_rank ?? 0),
  };

  return rank;
}

export async function genCheckIfPlayedToday(
  context: Devvit.Context,
  subredditName: string,
  username: string
): Promise<boolean> {
  const member_key_raw_data: MemberKeyData = {
    username: username, //+ Math.floor(Math.random() * 2),
    subredditName: subredditName,
    dateKey: getCurrentDateInPST(),
  };
  const member_key = getJSONMemberKeyData(member_key_raw_data);

  const [global_score] = await Promise.all([
    context.redis.zScore(GLOBAL_LEADERBOARD, member_key),
  ]);

  if (global_score) {
    return true;
  } else {
    return false;
  }
}

export async function genGlobalRank(
  context: Devvit.Context,
  subredditName: string,
  username: string
): Promise<ScoreBoardEntry | null> {
  const member_key_raw_data: MemberKeyData = {
    username: username, //+ Math.floor(Math.random() * 2),
    subredditName: subredditName,
    dateKey: getCurrentDateInPST(),
  };
  const member_key = getJSONMemberKeyData(member_key_raw_data);

  const [global_score, global_rank, total] = await Promise.all([
    context.redis.zScore(GLOBAL_LEADERBOARD, member_key),
    context.redis.zRank(GLOBAL_LEADERBOARD, member_key),
    context.redis.zCard(GLOBAL_LEADERBOARD),
  ]);

  console.log("global_score");
  console.log(global_score);
  console.log("sub_sglobal_rankcore");
  console.log(global_rank);
  console.log("total");
  console.log(total);
  // TODO SCORES AND RANKS FOR ALL VS PERSONAL BEING PULLED FROM DIFFERENT TABLES I THINK
  // TODO SCORES AND RANKS FOR ALL VS PERSONAL BEING PULLED FROM DIFFERENT TABLES I THINK
  // TODO SCORES AND RANKS FOR ALL VS PERSONAL BEING PULLED FROM DIFFERENT TABLES I THINK
  // TODO SCORES AND RANKS FOR ALL VS PERSONAL BEING PULLED FROM DIFFERENT TABLES I THINK
  // TODO SCORES AND RANKS FOR ALL VS PERSONAL BEING PULLED FROM DIFFERENT TABLES I THINK
  // TODO SCORES AND RANKS FOR ALL VS PERSONAL BEING PULLED FROM DIFFERENT TABLES I THINK
  // TODO SCORES AND RANKS FOR ALL VS PERSONAL BEING PULLED FROM DIFFERENT TABLES I THINK

  if (!global_score) {
    return null;
  }

  const rank: ScoreBoardEntry = {
    member: member_key_raw_data,
    score: global_score,
    rank: total - (global_rank ?? 0),
  };

  console.log("I HAVE DISCOVERED THE RANKS!!!!!!!");

  return rank;
}

function getUnencodeMemberData(
  data: {
    member: string;
    score: number;
  }[]
): ScoreBoardEntry[] {
  return data.map((item) => {
    return {
      member: getUnencodedMemberKeyData(item.member),
      score: item.score,
    };
  });
}
