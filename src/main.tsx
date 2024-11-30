// Learn more at developers.reddit.com/docs
import {
  AsyncError,
  Devvit,
  EnrichedThumbnail,
  GetHotPostsOptions,
  useAsync,
  useState,
} from "@devvit/public-api";
import PostContainer from "./components/PostContainer.js";

Devvit.configure({
  redditAPI: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: "Add my post",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    await reddit.submitPost({
      title: "My devvit post",
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: "Created post!" });
  },
});
let displayScore = 0;

// type SubData = {
//   title: string;
//   score: number;
//   url: string;
// };
// type SubDataPaylaod = {
//   data: SubData[];
//   error: AsyncError | null;
//   loading: boolean;
// };
export type PostData = {
  title: string;
  score: number;
  image: EnrichedThumbnail;
};
export type SubredditData = {
  name: string;
  numberOfActiveUsers: number;
  posts: PostData[];
};
// Add a post type definition
let counterer = 0;
let function_loops = 0;

Devvit.addCustomPostType({
  name: "Experience Post",
  height: "tall",
  render: (context) => {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState<number>(0);
    const [postsBought, setPostsBought] = useState<PostData[]>([]);
    const {
      data: subredditData,
      error,
      loading,
    } = useAsync<SubredditData>(async () => {
      const subreddit = await context.reddit.getCurrentSubreddit();
      counterer++;
      console.log(`WE ARE BEING TRIGGERED ${counterer}`);
      const options: GetHotPostsOptions = {
        subredditName: "funny",
        limit: 20,
        pageSize: 10,
      };
      const posts = await context.reddit.getHotPosts(options);
      const allPosts = await posts.all();

      // Filter posts that have images
      const postsWithImages: PostData[] = await Promise.all(
        allPosts.map(async (post) => {
          const thumbnail = await post.getEnrichedThumbnail();

          post.secureMedia;

          if (thumbnail && post.title && post.score) {
            return {
              title: post.title,
              score: post.score,
              image: thumbnail,
            };
          } else {
            return null;
          }
        })
      ).then((results) =>
        results.filter((item): item is PostData => item !== null)
      );

      postsWithImages.sort((a, b) => (Math.random() > 0.5 ? 1 : -1));

      return {
        name: subreddit.name,
        numberOfActiveUsers: subreddit.numberOfActiveUsers,
        posts: postsWithImages.filter(Boolean) as PostData[],
      };
    });

    // console.log("WWWWEWEEEENUENUNUSUSUUUSUSAKJHKSDAJHJHDASJHD")
    if (!subredditData) {
      return (
        <vstack
          height="100%"
          width="100%"
          gap="medium"
          alignment="center middle"
        >
          <text size="small">Womp womp</text>
        </vstack>
      );
    }

    if (subredditData?.posts.length < 10) {
      console.log("we don't have enough posts fuuuuck");
    }

    if (loading) {
      return (
        <vstack
          height="100%"
          width="100%"
          gap="medium"
          alignment="center middle"
        >
          <text size="small">Loading subreddit data...</text>
        </vstack>
      );
    }

    if (error) {
      console.error("Failed to fetch subreddit data:", error);
      return (
        <vstack
          height="100%"
          width="100%"
          gap="medium"
          alignment="center middle"
        >
          <text size="small">Error loading subreddit data.</text>
        </vstack>
      );
    }

    // const user_score = postsBought.reduce((acc, index) => acc + index.score, 0);

    // https://external-preview.redd.it/yaDrjavt9JIusgoOjG8smSlVoZ2NuXwomaEjJAmrTkU.jpg?width=320&auto=webp&s=67c85c693561f3c59046cea513ddf0cab8f352e6
    // if (subredditData[0]. === undefined) {
    //   return (
    //     <vstack
    //       height="100%"
    //       width="100%"
    //       gap="medium"
    //       alignment="center middle"
    //     >
    //       <text size="small">Error loading subreddit data.</text>
    //     </vstack>
    //   );
    // }

    // const url = new URL(subredditData.imageUrl)
    // console.log(rand_posts);
    const [scoreDelta, setScoreDelta] = useState<number>(0);

    // while (scoreDelta !== 0) {
    //   let local_score = score;
    //   let local_score_delta = scoreDelta;

    //   useAsync<number>(async () => {
    //     await setTimeout(() => {
    //       local_score += 100;
    //       local_score_delta -= 100;
    //     }, 100);

    //     setScoreDelta()

    //     return 1;
    //   });
    // }

    const post1 = subredditData.posts[step * 2];
    const post2 = subredditData.posts[step * 2 + 1];

    console.log("Score delta", scoreDelta);

    var i = 1; //  set your counter to 1

    function myLoop(start: number, delta: number, timeout: number) {
      if (delta === 0) {
        console.log("Loop finished");
        return; // Exit the loop when delta reaches 0
      }
      console.log("Loop started");
      console.log("Remaining delta: ", delta);

      let local_score = start;
      let local_score_delta = delta;

      setTimeout(() => {
        console.log("Timeout started");
        function_loops++;
        const symbol = Math.sign(local_score_delta);

        let scoreIncrement = 0;
        let timeoutincr = 0;
        const normalized = Math.abs(local_score_delta);
        if (normalized > 5000) {
          scoreIncrement = 1949 * symbol;
          timeoutincr = 1;
        } else if (normalized > 1000) {
          scoreIncrement = 389 * symbol;
          timeoutincr = 1;
        } else if (normalized > 200) {
          scoreIncrement = 171 * symbol;
          timeoutincr = 5;
        } else if (normalized > 40) {
          scoreIncrement = 7 * symbol;
          timeoutincr = 5;
        } else if (normalized > 5) {
          scoreIncrement = 3 * symbol;
          timeoutincr = 20;
        } else {
          scoreIncrement = 1 * symbol;
          timeoutincr = 100;
        }
        local_score += scoreIncrement;
        local_score_delta -= scoreIncrement;

        // Dispatch the update to React state
        setScoreDelta(local_score_delta);
        setScore(local_score);
        displayScore = local_score;

        if (local_score_delta !== 0) {
          //  if the counter < 10, call the loop function
          myLoop(local_score, local_score_delta, timeoutincr); //  ..  again which will trigger another
        } //  ..  setTimeout()
      }, timeout);

      function_loops = 0;
    }

    if (scoreDelta !== 0 && function_loops === 0) {
      myLoop(score, scoreDelta, 1);
    }

    // let local_score = score;
    // let local_score_delta = scoreDelta;
    // while (local_score_delta !== 0) {
    //   const symbol = local_score_delta / local_score_delta;

    //   let scoreIncrement = 0;
    //   let timeoutincr = 0;
    //   const normalized = Math.abs(local_score_delta);
    //   if (normalized > 100) {
    //     scoreIncrement = 39 * symbol;
    //     timeoutincr = 1;
    //   } else if (normalized > 40) {
    //     scoreIncrement = 7 * symbol;
    //     timeoutincr = 5;
    //   } else if (normalized > 5) {
    //     scoreIncrement = 3 * symbol;
    //     timeoutincr = 20;
    //   } else {
    //     scoreIncrement = 1 * symbol;
    //     timeoutincr = 100;
    //   }
    //   local_score += scoreIncrement;
    //   local_score_delta -= scoreIncrement;

    //   // Dispatch the update to React state
    //   setScoreDelta(local_score_delta);
    //   setScore(local_score);
    //   displayScore = local_score;
    // }

    // while (displayScore % 10 !== 0) {
    //   setTimeout(() => {
    //     displayScore++;
    //   }, 100);
    // }
    // displayScore++;

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        {/* <image
          url="logo.png"
          description="logo"
          imageHeight={256}
          imageWidth={256}
          height="48px"
          width="48px"
        /> */}
        <hstack
          height="80%"
          width="100%"
          gap="medium"
          alignment="center middle"
          padding="small"
        >
          <PostContainer
            postData={post1}
            step={step}
            setStep={setStep}
            postsBought={postsBought}
            setPostsBought={setPostsBought}
            otherPostScore={post2.score}
            displayScore={displayScore}
            score={score}
            setScore={setScore}
            scoreDelta={scoreDelta}
            setScoreDelta={setScoreDelta}
          />
          <PostContainer
            postData={post2}
            step={step}
            setStep={setStep}
            postsBought={postsBought}
            setPostsBought={setPostsBought}
            otherPostScore={post1.score}
            score={score}
            displayScore={displayScore}
            setScore={setScore}
            scoreDelta={scoreDelta}
            setScoreDelta={setScoreDelta}
          />
        </hstack>
        <text>Score: {displayScore}</text>
        {/* {subredditData?.imageUrl ? ( */}

        {/* ) : (
          <></>
        )} */}
        {/* <text size="large">{`Click counter: ${counter}`}</text>
        {subredditData ? (
          <text size="small">{`Active users: ${subredditData.numberOfActiveUsers}`}</text>
        ) : (
          <text size="small">Loading subreddit data...</text>
        )}
        <button
          appearance="primary"
          onPress={() => setCounter((counter) => counter + 1)}
        >
          {"this is a question"}
          {counter}
        </button> */}
      </vstack>
    );
  },
});

export default Devvit;
