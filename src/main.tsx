// Learn more at developers.reddit.com/docs
import {
  AsyncError,
  BlockElement,
  CommentSubmissionOptions,
  Devvit,
  EnrichedThumbnail,
  GetHotPostsOptions,
  useAsync,
  useInterval,
  useState,
  DevvitDebug,
  Listing,
  Post,
} from "@devvit/public-api";
import PostContainer from "./components/PostContainer.js";

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
import OrientationFormatter from "./components/OrientationFormatter.js";
import SingleImageView from "./components/SingleImageView.js";

import GameOver from "./components/GameOver.js";
import Intro from "./components/Intro.js";
import {
  genFilteredAdditionalTopPostsData,
  genFilteredTopPostsData,
} from "./pseudo_server/utils/post_fetch.js";
import { genAddSubTraderPost } from "./pseudo_server/controllers/posts.js";
import { getScoreModifier } from "./data/score_calculator.js";
import { genRetrievePostedScoreHistory } from "./pseudo_server/controllers/submit_post.js";
// import {
//   genGlobalScoreboard,
// } from "../server/controllers/scoreboard.js";

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

// Add a post type definition
// let counterer = 0;
// let function_loops = 0;

Devvit.addCustomPostType({
  name: "Experience Post",
  height: "tall",
  render: (context) => {
    const [step, setStep] = useState(-1);
    const [scoreHistory, setScoreHistory] = useState<ScoreHistoryItem[]>([]);
    const [score, setScore] = useState<number>(1000);
    const [lastScoreChange, setLastScoreChange] = useState<number>(0);
    const [postsBought, setPostsBought] = useState<PostData[]>([]);
    const [scoreDelta, setScoreDelta] = useState<number>(0);
    const [ZoomPost, setZoomPost] = useState<PostData | null>(null);
    const [postBuy, setPostBuy] = useState<boolean>(false);
    const [cashedOut, setCashedOut] = useState<boolean>(false);

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
    };

    const {
      data: generalDataPayload,
      error: generaLDataError,
      loading: generalDataLoading,
    } = useAsync<GeneralData>(
      async (): Promise<GeneralData> => {
        if (cashedOut && generalDataPayload) {
          return generalDataPayload;
        }

        if (!generalDataPayload) {
          console.log("Data fetch was triggered!!!!!");
          const [user, subreddit] = await Promise.all([
            context.reddit.getCurrentUser(),
            context.reddit.getCurrentSubreddit(),
          ]);

          let subData: CurrSubData;
          const result = await genFilteredTopPostsData(
            context,
            subreddit.name,
            "",
            SubDataSource.TOP
          );

          let prev_history: PostedScoreObject | null = null;
          if (context.postId) {
            prev_history = await genRetrievePostedScoreHistory(
              context,
              context.postId
            );
          }

          console.log("This is the result right before");
          // console.log(result);
          if (result == null) {
            throw new Error("issue fetching data");
          }

          let postDataObject;

          subData = result;

          return {
            userId: user?.id ?? null,
            username: user?.username ?? null,
            subredditId: subreddit.id,
            subredditName: subreddit.name,
            currentPostId: context.postId ?? null,
            currSub: subData,
            prevHistory: prev_history,
          };
        } else {
          console.log("additional data fetch happening maybe");
          if (
            (generalDataPayload.currSub?.postData.length ?? 0) - step * 2 <=
            4
          ) {
            console.log("IS IT HAPPENING");
            let postDataObject;

            let subData: CurrSubData;
            const result = await genFilteredAdditionalTopPostsData(
              context,
              generalDataPayload.subredditName,
              generalDataPayload.currSub?.lastCursor ?? "",
              SubDataSource.TOP
            );

            console.log("This is the result right before");
            // console.log(result);
            if (result == null) {
              throw new Error("issue fetching data");
            }
            // let postDataObject: PostDataObject =
            //   generalDataPayload.postDataObject;

            let prev_history: PostedScoreObject | null = null;
            if (context.postId) {
              prev_history = await genRetrievePostedScoreHistory(
                context,
                context.postId
              );
            }

            subData = result;
            return {
              userId: generalDataPayload.userId,
              username: generalDataPayload.username,
              subredditId: generalDataPayload.subredditId,
              subredditName: generalDataPayload.subredditName,
              currentPostId: context.postId ?? null,
              currSub: subData,
              prevHistory: prev_history,
            };
          }
        }
        return generalDataPayload;
      },
      { depends: step }
    );

    if (generalDataPayload?.prevHistory) {
      return (
        <GameOver
          UXConfig={UXConfig}
          context={context}
          currentScore={generalDataPayload.prevHistory.totalScore}
          step={generalDataPayload.prevHistory.numTrades}
          cashedOut={true}
          generalDataPayload={generalDataPayload}
          current_score={generalDataPayload.prevHistory.totalScore}
          scoreHistory={generalDataPayload.prevHistory.scoreHistory}

          // scoreBoard={scoreBoard}
        />
      );
    }

    const subData = generalDataPayload?.currSub;
    // console.log("POST OBJECT IN MAIN");
    // console.log(postDataObject);

    // const {
    //   data: subData,
    //   error,
    //   loading,
    // } = genFilteredTopPostsData(context, generalData?.subredditName);

    if (step === -1) {
      return <Intro UXConfig={UXConfig} step={step} setStep={setStep} />;
    }

    if (generaLDataError) {
      return (
        <vstack
          height="100%"
          width="100%"
          gap="medium"
          alignment="center middle"
        >
          <text size="small">Something went wrong... we're working on it.</text>
        </vstack>
      );
    }

    if (generalDataLoading) {
      return (
        <vstack
          height="100%"
          width="100%"
          gap="medium"
          alignment="center middle"
        >
          <text size="small">Booting up terminal...</text>
        </vstack>
      );
    }

    if (!subData) {
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

    if (subData?.postData.length < 10) {
      // console.log("we don't have enough posts fuuuuck");
    }

    const score_component = (
      // score_loading === true ? (
      //   <text alignment="start top" style="heading">
      //     Balance: Calulating...
      //   </text>
      // ) : (
      <text alignment="start top" style="heading">
        Balance: {score}
      </text>
    );
    // );

    const last_score_component = (
      // last_score_loading === true ? (
      //   <text alignment="start top" style="heading">
      //     P/L: Calculating...
      //   </text>
      // ) : (
      <text
        alignment="start top"
        // width="30%"
        style="heading"
        // grow={true}
        color={(lastScoreChange ?? 0) > 0 ? "green" : "red"}
      >
        P/L: {lastScoreChange ?? 0}
      </text>
    );
    // );

    const post1 = step !== -1 && subData.postData[step * 2];
    const post2 = step !== -1 && subData.postData[step * 2 + 1];

    // const {
    //   data: scoreBoard,
    //   error: scoreBoardError,
    //   loading: scoreBoardLoading,
    // } = useAsync<ScoreBoardEntry[]>(
    //   async () => {
    //     // console.log("fetching scoreboard");
    //     return await genGlobalScoreboard(context);
    //   },
    //   { depends: cashedOut }
    // );

    const handleProceed = (): void => {
      // if (step > 6) {
      //   setStep(0);
      // }

      setStep(step + 1);
      setPostBuy(false);
    };

    console.log("score");
    console.log(score);

    const handleCashout = (): void => {
      // console.log("cashout triggered");
      setStep(step + 1);
      setPostBuy(false);

      // console.log(cashedOut);
      // console.log(generalDataPayload.username);
      // // console.log(current_score);

      // if (generalDataPayload.username && current_score) {
      // const global_scores = genAddScoreboardLising(
      //   context,
      //   generalDataPayload.subredditName,
      //   generalDataPayload.username,
      //   current_score
      // );
      setCashedOut(true);
      // }
      if (generalDataPayload) {
        genAddSubTraderPost(context, generalDataPayload, scoreHistory);
      }
    };

    // console.log("Should we cash out rn?");
    // console.log(cashedOut);
    if (cashedOut || score <= 0) {
      return (
        <GameOver
          UXConfig={UXConfig}
          context={context}
          currentScore={score ?? 0}
          step={step}
          cashedOut={cashedOut}
          generalDataPayload={generalDataPayload}
          current_score={score}
          scoreHistory={scoreHistory}

          // scoreBoard={scoreBoard}
        />
      );
    }

    if (post1 && post2) {
      return (
        <>
          <vstack
            height="100%"
            width="100%"
            gap="small"
            alignment="center top"
            padding="medium"
          >
            <vstack
              height="100%"
              width="100%"
              gap="small"
              alignment="center middle"
            >
              {/* <image
          url="logo.png"
          description="logo"
          imageHeight={256}
          imageWidth={256}
          height="48px"
          width="48px"
        /> */}
              {ZoomPost != null ? (
                <SingleImageView
                  context={context}
                  postData={ZoomPost}
                  setZoomPost={setZoomPost}
                />
              ) : (
                // context.dimensions?.width ?? 0 > 500 ? (
                //   <hstack
                //     height="80%"
                //     width="100%"
                //     gap="medium"
                //     alignment="center middle"
                //     padding="small"
                //   >
                //     <PostContainer
                //       postData={post2}
                //       context={context}
                //       step={step}
                //       setStep={setStep}
                //       postsBought={postsBought}
                //       setPostsBought={setPostsBought}
                //       otherPostScore={post1.score}
                //       score={score}
                //       displayScore={displayScore}
                //       setScore={setScore}
                //       scoreDelta={scoreDelta}
                //       setScoreDelta={setScoreDelta}
                //       setZoomPost={setZoomPost}
                //       orientation={"vertical"}
                //     />
                //     <PostContainer
                //       postData={post1}
                //       context={context}
                //       step={step}
                //       setStep={setStep}
                //       postsBought={postsBought}
                //       setPostsBought={setPostsBought}
                //       otherPostScore={post2.score}
                //       score={score}
                //       displayScore={displayScore}
                //       setScore={setScore}
                //       scoreDelta={scoreDelta}
                //       setScoreDelta={setScoreDelta}
                //       setZoomPost={setZoomPost}
                //       orientation={"vertical"}
                //     />
                //   </hstack>
                // ) :
                <>
                  <hstack
                    width="95%"
                    gap="small"
                    height="15%"
                    alignment="start top"
                    //   maxHeight="80%"
                  >
                    <vstack
                      // height="100%"
                      width="60%"
                      gap="small"
                      alignment="start top"

                      // padding="medium"
                    >
                      <text alignment="start top" style="heading">
                        Balance: {score}
                      </text>{" "}
                      {postBuy === true && (
                        <text
                          alignment="start top"
                          // width="30%"
                          style="heading"
                          // grow={true}
                          darkColor={
                            (lastScoreChange ?? 0) > 0
                              ? UXConfig.darkGreenColor
                              : UXConfig.darkRedColor
                          }
                          lightColor={
                            (lastScoreChange ?? 0) > 0
                              ? UXConfig.lightGreenColor
                              : UXConfig.lightRedColor
                          }
                        >
                          P/L: {lastScoreChange ?? 0}
                        </text>
                      )}
                    </vstack>
                    <hstack
                      alignment="center middle"
                      width="40%"
                      //   maxHeight="80%"
                    >
                      {postBuy === true && (
                        <hstack
                          alignment="center middle"
                          width="100%"
                          gap="small"
                          //   maxHeight="80%"
                        >
                          <button
                            appearance="primary"
                            onPress={handleProceed}
                            width="50%"
                            maxWidth="200px"
                            size={UXConfig.smallButtonSize}
                          >
                            Next
                          </button>
                          <button
                            appearance="secondary"
                            onPress={handleCashout}
                            width="50%"
                            maxWidth="200px"
                            size={UXConfig.smallButtonSize}
                          >
                            Cashout
                          </button>
                        </hstack>
                      )}
                    </hstack>
                  </hstack>
                  <vstack
                    height="78%"
                    width="100%"
                    gap="medium"
                    alignment="center middle"
                    padding="small"
                  >
                    <PostContainer
                      UXConfig={UXConfig}
                      postData={post2}
                      otherPostData={post1}
                      context={context}
                      scoreHistory={scoreHistory}
                      setScoreHistory={setScoreHistory}
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
                      setZoomPost={setZoomPost}
                      orientation={"horizontal"}
                      postBuy={postBuy}
                      setPostBuy={setPostBuy}
                      lastScoreChange={lastScoreChange}
                      setLastScoreChange={setLastScoreChange}
                    />
                    <PostContainer
                      UXConfig={UXConfig}
                      postData={post1}
                      otherPostData={post2}
                      context={context}
                      scoreHistory={scoreHistory}
                      setScoreHistory={setScoreHistory}
                      step={step}
                      setStep={setStep}
                      postsBought={postsBought}
                      setPostsBought={setPostsBought}
                      otherPostScore={post2.score}
                      score={score}
                      displayScore={displayScore}
                      setScore={setScore}
                      scoreDelta={scoreDelta}
                      setScoreDelta={setScoreDelta}
                      setZoomPost={setZoomPost}
                      orientation={"horizontal"}
                      postBuy={postBuy}
                      setPostBuy={setPostBuy}
                      lastScoreChange={lastScoreChange}
                      setLastScoreChange={setLastScoreChange}
                    />
                  </vstack>

                  {/* <hstack
              width="80%"
              gap="small"
              alignment="center middle"
              //   maxHeight="80%"
            > */}
                  {/* {postBuy === true && (
                  <hstack
                    width="50%"
                    gap="small"
                    alignment="center middle"
                    //   maxHeight="80%"
                  >
                    <button
                      appearance="primary"
                      onPress={handleProceed}
                      width="40%"
                      size="small"
                    >
                      Next
                    </button>
                  </hstack>
                )} */}
                  {/* </hstack> */}
                </>
              )}
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
          </vstack>
        </>
      );
    }

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <text size="small">Something went wrong... we're working on it.</text>
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
