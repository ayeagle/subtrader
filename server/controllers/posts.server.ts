import {
  Devvit,
  EnrichedThumbnail,
  GetHotPostsOptions,
  Post,
} from "@devvit/public-api";
import { PostData } from "../../src/data/types.js";
import { getPostDataFromPostAndThumbnail } from "../data_cleaning/post_cleaning.server.js";
import {
  filterAndSortPosts,
  getIsPostEligible,
  getJSONPostIds,
  getJSONSubredditDateKey,
  getUnmarshalledPostIDs,
} from "../utils/post_filtering.server.js";
import { POST_IDS_KEY, TESTING_SUB_KEY } from "../consts.server.js";

export async function genPostsForSubreddit(
  context: Devvit.Context,
  subredditName: string
): Promise<PostData[]> {
  subredditName = TESTING_SUB_KEY ?? subredditName;

  const lookup_key = getJSONSubredditDateKey(subredditName);

  console.log("current lookup key: ", lookup_key);

  const postsIds = await context.redis.hGet(lookup_key, POST_IDS_KEY);
  console.log("associated posts: ", postsIds);

  if (!postsIds) {
    console.log("Looking up new data");
    const new_posts = await genTopPostsForSubreddit(context, subredditName);
    // console.log("these are the new posts");
    // console.log(new_posts);
    await genUpdateWithNewPostsData(context, subredditName, new_posts);
    return new_posts;
  } else {
    console.log("Looking up old data");

    return await genGatherPostsForSubreddit(context, postsIds);
  }
}

async function genAdditionalPostsForSubreddit(
  context: Devvit.Context,
  subredditName: string,
  postData: PostData[]
): Promise<PostData[]> {
  const lookup_key = getJSONSubredditDateKey(subredditName);
  const postsIds = (await context.redis.hGet(lookup_key, POST_IDS_KEY)) ?? "";
  const post_ids_set = new Set(getUnmarshalledPostIDs(postsIds));

  const new_posts = await genTopPostsForSubreddit(context, subredditName);

  const deduped_posts = new_posts.filter((post) => !post_ids_set.has(post.id));
  const full_post_ids_list = [
    ...post_ids_set,
    ...deduped_posts.map((post) => post.id),
  ];
  await genUpdateWithNewPostsData(
    context,
    subredditName,
    undefined,
    full_post_ids_list
  );
  return new_posts;
}

async function genGatherPostsForSubreddit(
  context: Devvit.Context,
  postIds: string
): Promise<PostData[]> {
  const split_post_ids: string[] = getUnmarshalledPostIDs(postIds);

  const postsWithThumbnails = await Promise.all(
    split_post_ids.map(async (postId) => {
      // Fetch post
      const post = await context.reddit.getPostById(postId);
      let thumbnail = undefined;
      try {
        thumbnail = await post.getEnrichedThumbnail();
      } catch (error) {
        thumbnail = undefined;
      }
      return getPostDataFromPostAndThumbnail(post, thumbnail);
    })
  );
  return postsWithThumbnails.filter((item): item is PostData => item !== null);
}

async function genTopPostsForSubreddit(
  context: Devvit.Context,
  subredditName: string
): Promise<PostData[]> {
  let cascading_error = null;

  const subreddit = await context.reddit.getCurrentSubreddit();
  const options: GetHotPostsOptions = {
    subredditName: TESTING_SUB_KEY ?? subredditName,
    limit: 100,
    pageSize: 100,
  };
  const posts = await context.reddit.getTopPosts(options);
  const allPosts = await posts.all();

  // Filter posts that have images
  const postsWithImages: PostData[] = await Promise.all(
    allPosts.map(async (post) => {
      const thumbnail = await post.getEnrichedThumbnail();
      if (getIsPostEligible(post, thumbnail)) {
        return getPostDataFromPostAndThumbnail(post, thumbnail);
      } else {
        // console.log("thumbnail and others null");
        return null;
      }
    })
  ).then((results) =>
    results.filter((item): item is PostData => item !== null)
  );

  const filteredPosts = filterAndSortPosts(postsWithImages);
  return filteredPosts;
}

async function genUpdateWithNewPostsData(
  context: Devvit.Context,
  subredditName: string,
  postData?: PostData[],
  postIds?: string[]
) {
  const lookup_key = getJSONSubredditDateKey(subredditName);
  console.log("Attempting write for new posts");

  let post_ids_string: string = "";
  if (postData) {
    post_ids_string = getJSONPostIds(postData.map((post) => post.id));
  } else if (postIds) {
    post_ids_string = getJSONPostIds(postIds);
  } else {
    return;
  }
  console.log(post_ids_string);
  try {
    await context.redis.hSet(lookup_key, {
      [POST_IDS_KEY]: post_ids_string,
    });
  } catch (error) {
    console.log("HSET FAILED");
    console.log("HSET FAILED");
    console.log("HSET FAILED");
    console.log(error);
  }
}
