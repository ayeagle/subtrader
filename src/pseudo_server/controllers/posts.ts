import {
  Devvit,
  EnrichedThumbnail,
  GetHotPostsOptions,
  GetPostsOptions,
  GetPostsOptionsWithTimeframe,
  Listing,
  Post,
} from "@devvit/public-api";
import {
  PostData,
  ScoreHistoryItem,
  GeneralData,
  PostDataObject,
  SubDataSource,
  CurrSubData,
} from "../../data/types.js";
import { getPostDataFromPostAndThumbnail } from "../data_cleaning/post_cleaning.js";
import {
  filterAndSortPosts,
  getCurrentDateInPST,
  getIsPostEligible,
  getJSONPostIds,
  getJSONScoreHistory,
  getJSONSubredditDateKey,
  getUnmarshalledPostIDs,
} from "../utils/post_filtering.js";
import { POST_IDS_KEY, TESTING_SUB_KEY } from "../consts.js";
import { FETCH_LOGS } from "../utils/post_fetch.js";

// let postDataObject: PostDataObject = null;

export async function genPostsForSubreddit(
  context: Devvit.Context,
  subredditName: string,
  lastCursor: string,
  source: SubDataSource
): Promise<CurrSubData> {
  subredditName = TESTING_SUB_KEY ?? subredditName;

  const lookup_key = getJSONSubredditDateKey(subredditName);

  // console.log("current lookup key: ", lookup_key);

  const postsIds = await context.redis.hGet(lookup_key, POST_IDS_KEY);
  let sub_data: CurrSubData;

  if (!postsIds || postsIds.length === 0) {
    console.log("No ids stored, fallback");

    sub_data = await genTopPostsForSubreddit(
      context,
      subredditName,
      lastCursor,
      source
    );
    console.log(sub_data.postData.map((post) => post.id));
    await genUpdateWithNewPostsData(context, subredditName, sub_data.postData);
  } else {
    console.log("Gathering stored posts");
    console.log(postsIds);

    const gathered_posts = await genGatherPostsForSubreddit(context, postsIds);
    console.log("gathered posts");
    console.log(gathered_posts);
    console.log(gathered_posts[gathered_posts.length - 1].id);
    sub_data = {
      name: subredditName,
      postData: gathered_posts,
      lastCursor: gathered_posts[gathered_posts.length - 1].id,
    };
  }
  return sub_data;
}

export async function genAdditionalPostsForSubreddit(
  context: Devvit.Context,
  subredditName: string,
  lastCursor: string,
  source: SubDataSource
): Promise<CurrSubData> {
  console.log("addt post 1");
  subredditName = TESTING_SUB_KEY ?? subredditName;

  const lookup_key = getJSONSubredditDateKey(subredditName);

  // console.log("Post ids SET");
  // console.log(post_ids_set.size);
  const new_curr_sub_data = await genTopPostsForSubreddit(
    context,
    subredditName,
    lastCursor,
    source

    // postDataObject
  );
  console.log("addt post 3");

  let full_post_ids_list: string[] = [];
  let deduped_posts: PostData[] = [];

  const postsIds = (await context.redis.hGet(lookup_key, POST_IDS_KEY)) ?? "";
  // console.log("Get additional posts lookup and postids");
  // console.log(lookup_key);
  // console.log(postsIds.length);

  if (postsIds) {
    console.log("addt post 2");
    console.log("post ids or whatever");
    console.log(postsIds);

    const post_ids_set = new Set(getUnmarshalledPostIDs(postsIds));

    deduped_posts = new_curr_sub_data.postData.filter(
      (post) => !post_ids_set.has(post.id)
    );
    full_post_ids_list = [
      ...post_ids_set,
      ...deduped_posts.map((post) => post.id),
    ];
  }
  console.log("addt post 4");

  console.log("full additional post ids list");
  console.log(full_post_ids_list.length);

  await genUpdateWithNewPostsData(
    context,
    subredditName,
    undefined,
    full_post_ids_list
  );
  console.log("addt post 5");

  return {
    ...new_curr_sub_data,
    postData: deduped_posts,
  };
}

async function genGatherPostsForSubreddit(
  context: Devvit.Context,
  postIds: string
): Promise<PostData[]> {
  const split_post_ids: string[] = getUnmarshalledPostIDs(postIds);
  FETCH_LOGS.existing += split_post_ids.length;

  const postsWithThumbnails = await Promise.all(
    split_post_ids.map(async (postId) => {
      // Fetch post
      const post = await context.reddit.getPostById(postId);
      let thumbnail = undefined;
      try {
        thumbnail = await post.getEnrichedThumbnail();
      } catch (error) {
        FETCH_LOGS.discarded++;
        FETCH_LOGS.thumbnail_missing++;
        thumbnail = undefined;
      }
      return getPostDataFromPostAndThumbnail(post, thumbnail);
    })
  );
  return postsWithThumbnails.filter((item): item is PostData => item !== null);
}

async function genTopPostsForSubreddit(
  context: Devvit.Context,
  subredditName: string,
  lastCursor: string,
  source: SubDataSource
): Promise<CurrSubData> {
  let curr_sub_data: CurrSubData;

  // let existingPostData = postDataObject;
  // let allposts: Post[];

  // Fetch posts based on the current state
  // if (existingPostData && existingPostData.children.length > 0) {
  //   console.log("Using existing post data");
  //   allposts = await fetchPosts(existingPostData, 250);
  // } else {
  //   console.log("Fetching new posts");

  let post_listing_object: Listing<Post>;
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!");

  console.log("SOURCE BEING USED FOR FETCHING");
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log(source);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log(subredditName);
  console.log(lastCursor);

  const existingPostData = await getPostDataObject(
    context,
    subredditName,
    lastCursor,
    source
  );
  console.log("before posts");

  const posts = await fetchPosts(existingPostData, 100);

  FETCH_LOGS.fetched += posts.length;
  // }
  console.log("after posts");

  // Filter posts with images
  const postsWithImages = await filterPostsWithImages(posts);
  console.log("after images");

  // Sort and return
  const filteredPosts = filterAndSortPosts(postsWithImages);

  console.log("Post fetching complete:", filteredPosts.length);
  console.log("last cursor");
  console.log(lastCursor);
  console.log("posts");
  console.log(posts.length);
  console.log("filteredPosts");
  console.log(filteredPosts.length);
  console.log("posts[posts.length - 1].id");
  console.log(posts[posts.length - 1]?.id);

  return {
    name: subredditName,
    postData: filteredPosts,
    lastCursor: posts[posts.length - 1]?.id ?? "",
  };
}

// Filter posts with images
async function filterPostIdsWithImages(
  context: Devvit.Context,
  allposts: string[]
): Promise<PostData[]> {
  return (
    await Promise.all(
      allposts.map(async (postId) => {
        // Fetch post
        const post = await context.reddit.getPostById(postId);
        let thumbnail = undefined;
        try {
          thumbnail = await post.getEnrichedThumbnail();
        } catch (error) {
          FETCH_LOGS.discarded++;
          FETCH_LOGS.thumbnail_missing++;
          thumbnail = undefined;
        }
        return getPostDataFromPostAndThumbnail(post, thumbnail);
      })
    )
  ).filter((item): item is PostData => item !== null);
}

// Filter posts with images
async function filterPostsWithImages(allposts: Post[]): Promise<PostData[]> {
  return (
    await Promise.all(
      allposts.map(async (post) => {
        const thumbnail = await post.getEnrichedThumbnail();
        // try {
          if (getIsPostEligible(post, thumbnail)) {
            return getPostDataFromPostAndThumbnail(post, thumbnail);
          } else {
            FETCH_LOGS.discarded++;
            return null;
          }
        // } catch {
        //   return null;
        // }
      })
    )
  ).filter((item): item is PostData => item !== null);
}

function getPostFetchConfig(
  subredditName: string,
  lastCursor: string
): GetPostsOptions {
  let options: GetPostsOptionsWithTimeframe;
  console.log("THE LAST CURSOR: ", lastCursor);
  if (!lastCursor || lastCursor === "") {
    options = {
      subredditName: TESTING_SUB_KEY ?? subredditName,
      limit: 250,
      pageSize: 100,
      timeframe: 'week'
      
    };
  } else {
    options = {
      subredditName: TESTING_SUB_KEY ?? subredditName,
      limit: 250,
      pageSize: 100,
      after: lastCursor,
      timeframe: 'week'
    };
  }
  return options;
}

// Helper function to fetch posts
async function fetchPosts(
  postData: PostDataObject,
  count: number
): Promise<Post[]> {
  if (postData) {
    console.log(postData.hasMore);
    const data = await postData.get(count);
    console.log(data.length);
    console.log(data.map((post) => post.id));
    return await postData.get(count);
  } else {
    return [];
  }
}

async function getPostDataObject(
  context: Devvit.Context,
  subredditName: string,
  lastCursor: string,
  source: SubDataSource
) {
  const options = getPostFetchConfig(subredditName, lastCursor);
  console.log(options);

  switch (source) {
    case SubDataSource.TOP:
      return await context.reddit.getTopPosts(options);
    case SubDataSource.HOT:
      return await context.reddit.getHotPosts(options);
    case SubDataSource.NEW:
      return await context.reddit.getNewPosts(options);
    default:
      return await context.reddit.getTopPosts(options);
  }
}

async function genUpdateWithNewPostsData(
  context: Devvit.Context,
  subredditName: string,
  postData?: PostData[],
  postIds?: string[]
) {
  if (postData?.length === 0 || postIds?.length === 0) {
    return;
  }

  const lookup_key = getJSONSubredditDateKey(subredditName);
  // console.log("Attempting write for new posts");

  let post_ids_string: string = "";
  if (postData) {
    post_ids_string = getJSONPostIds(postData.map((post) => post.id));
  } else if (postIds) {
    post_ids_string = getJSONPostIds(postIds);
  } else {
    return;
  }
  // console.log(post_ids_string);
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

export async function genAddSubTraderPost(
  context: Devvit.Context,
  generalData: GeneralData,
  scoreHistory: ScoreHistoryItem[]
) {
  if (generalData.currentPostId) {
    await context.redis.hSet(generalData.currentPostId, {
      scoreHistory: getJSONScoreHistory(scoreHistory),
      date: getCurrentDateInPST(),
      username: generalData.username ?? "",
      subreddit: generalData.subredditName,
    });
  }
}
