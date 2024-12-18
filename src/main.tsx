// Learn more at developers.reddit.com/docs
import { Devvit } from "@devvit/public-api";
import Main from "./components/Main.js";
import {
  CurrSubData,
  GeneralData,
  PostData,
  PostDataObject,
  PostedScoreObject,
  ScoreBoardEntry,
  ScoreHistoryItem,
  SubDataSource,
  UXConfig,
} from "./data/types.js";
Devvit.debug = {
  emitState: true,
  emitSnapshots: true,
};

("use strict");

Devvit.configure({
  redditAPI: true,
  kvStore: true,
});

export const BASE_SCORE: number = 1000;

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: "Add new SubTrader Post",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    await reddit.submitPost({
      title: "Play SubTrader!",
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

// Add a post type definition
// let counterer = 0;
// let function_loops = 0;

Devvit.addCustomPostType({
  name: "Experience Post",
  height: "tall",
  render: (context) => {
    const UXConfig: UXConfig = {
      smallFont:
        (context.dimensions?.width ?? 0) < 400
          ? "xsmall"
          : (context.dimensions?.width ?? 0) < 600
          ? "medium"
          : "large",
      largeFont:
        (context.dimensions?.width ?? 0) < 400
          ? "medium"
          : (context.dimensions?.width ?? 0) < 600
          ? "large"
          : "xlarge",
      maxWidth:
        (context.dimensions?.width ?? 0) < 400
          ? "100%"
          : (context.dimensions?.width ?? 0) < 600
          ? "100%"
          : "80%",
      smallButtonSize:
        (context.dimensions?.width ?? 0) < 400
          ? "small"
          : (context.dimensions?.width ?? 0) < 600
          ? "small"
          : "medium",
      largeButtonSize:
        (context.dimensions?.width ?? 0) < 400
          ? "medium"
          : (context.dimensions?.width ?? 0) < 600
          ? "medium"
          : "large",
      lightGreenColor: "LightGreen",
      darkGreenColor: "SeaGreen",
      lightRedColor: "Salmon",
      darkRedColor: "Maroon",
      darkBackgroundColor: "DarkSlateGrey",
      lightBackgroundColor: "AliceBlue",
    };
    return (
      <vstack
        darkBackgroundColor={UXConfig.darkBackgroundColor}
        lightBackgroundColor={UXConfig.lightBackgroundColor}
        height="100%"
        width="100%"
      >
        <Main context={context} UXConfig={UXConfig} />;
      </vstack>
    );
  },
});

export default Devvit;

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// if (loading) {
//   return (
//     <vstack
//       height="100%"
//       width="100%"
//       gap="medium"
//       alignment="center middle"
//     >
//       <text size="small">Booting trading terminal...</text>
//     </vstack>
//   );
// }

// if (error) {
//   console.error("Failed to fetch subreddit data:", error);
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

// const {
//   data: current_score,
//   error: score_error,
//   loading: score_loading,
// } = useAsync<number>(
//   async () => {
//     const result = scoreHistory.reduce((acc, item) => {
//       const modifier = getScoreModifier(
//         item.selected.score,
//         item.other.score
//       );

//       const score_ratio = item.selected.score / item.other.score;
//       return acc * score_ratio * modifier;
//     }, BASE_SCORE);

//     return Math.floor(result);
//   },
//   { depends: scoreHistory }
// );

// const current_score = scoreHistory.reduce(
//   (acc, item) => acc + item.scoreChangeValue,
//   BASE_SCORE
// );

// const last_score_update = scoreHistory.pop()?.scoreChangeValue;

// const {
//   data: last_score_update,
//   error: last_score_error,
//   loading: last_score_loading,
// } = useAsync<number>(
//   async () => {
//     const score_history_copy = [...scoreHistory];

//     const last_score_update = score_history_copy.pop();

//     if (!last_score_update) {
//       return 0;
//     }

//     const result = score_history_copy.reduce((acc, item) => {
//       const modifier = getScoreModifier(
//         item.selected.score,
//         item.other.score
//       );

//       const score_ratio = item.selected.score / item.other.score;
//       return acc * score_ratio * modifier;
//     }, BASE_SCORE);

//     const modifier = getScoreModifier(
//       last_score_update.selected.score,
//       last_score_update.other.score
//     );

//     const ratio =
//       last_score_update.selected.score / last_score_update.other.score;

//     const last_score_change = modifier * ratio * result - result;

//     // // console.log("MATHS");
//     // // console.log(result);
//     // // console.log(modifier);
//     // // console.log(ratio);
//     // // console.log(last_score_change);

//     return Math.floor(last_score_change);
//   },
//   { depends: scoreHistory }
// );

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
// // console.log(rand_posts);

// const [globalScore, setGlobalScores] = useState<ScoreBoardEntry[] | null>(
//   null
// );

// while (scoreDelta !== 0) {
//   let local_score = score;
//   let local_score_delta = scoreDelta;

// useAsync<number>(async () => {
//   if(scoreDelta === 0){
//     return 1
//   }
//   // const timeout1 = setTimeout(() => {
//   //   setScore(score + 100);
//   // }, 100);
//   // await timeout1;
//   // const timeout2 = setTimeout(() => {
//   //   setScore(score + 100);
//   // }, 100);
//   // await timeout2;
//   // const timeout3 = setTimeout(() => {
//   //   setScore(score + 400);
//   // }, 100);
//   // await timeout3;
//   // const timeout4 = setTimeout(() => {
//   //   setScore(score + 1000);
//   // }, 100);
//   // await timeout4;
//   // const timeout5 = setTimeout(() => {
//   //   setScore(score + 300);
//   // }, 100);
//   // await timeout5;
//   // const timeout6 = setTimeout(() => {
//   //   setScore(score + 100);
//   // }, 100);
//   // await timeout6;

//   const increments = [100, 100, 400, 1000, 300, 100]; // Define the increments

//   for (const increment of increments) {
//     setScore(score + increment); // Update the score state
//     await sleep(100); // Wait for 100ms before the next increment
//   }

//   return 1;
// });
// }

// // console.log(post2.image.image.url);

// // console.log("Score delta", scoreDelta);

// var i = 1; //  set your counter to 1

// function myLoop(start: number, delta: number, timeout: number) {
//   if (delta === 0) {
//     // console.log("Loop finished");
//     return; // Exit the loop when delta reaches 0
//   }
//   // console.log("Loop started");
//   // console.log("Remaining delta: ", delta);

//   let local_score = start;
//   let local_score_delta = delta;

//   setTimeout(() => {
//     // console.log("Timeout started");
//     function_loops++;
//     const symbol = Math.sign(local_score_delta);

//     let scoreIncrement = 0;
//     let timeoutincr = 0;
//     const normalized = Math.abs(local_score_delta);
//     if (normalized > 5000) {
//       scoreIncrement = 1949 * symbol;
//       timeoutincr = 1;
//     } else if (normalized > 1000) {
//       scoreIncrement = 389 * symbol;
//       timeoutincr = 1;
//     } else if (normalized > 200) {
//       scoreIncrement = 171 * symbol;
//       timeoutincr = 5;
//     } else if (normalized > 40) {
//       scoreIncrement = 7 * symbol;
//       timeoutincr = 5;
//     } else if (normalized > 5) {
//       scoreIncrement = 3 * symbol;
//       timeoutincr = 20;
//     } else {
//       scoreIncrement = 1 * symbol;
//       timeoutincr = 100;
//     }
//     local_score += scoreIncrement;
//     local_score_delta -= scoreIncrement;

//     // Dispatch the update to React state
//     setScoreDelta(local_score_delta);
//     setScore(local_score);
//     displayScore = local_score;

//     if (local_score_delta !== 0) {
//       //  if the counter < 10, call the loop function
//       myLoop(local_score, local_score_delta, timeoutincr); //  ..  again which will trigger another
//     } //  ..  setTimeout()
//   }, timeout);

//   function_loops = 0;
// }

// if (scoreDelta !== 0 && function_loops === 0) {
//   myLoop(score, scoreDelta, 1);
// }

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
// // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

// // console.log("Total valid posts: ", subData.posts.length);
// // // console.log(post2.OEmbed.html);
// // // console.log(post2.image.image.url);
// // // // console.log(post2.body)
// // // console.log(post2.permalink);
// // // // console.log(post2.bodyHtml)
// // console.log(context.dimensions?.width);
// // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

// return <blocks>{post2.OEmbed.html}</blocks>;
