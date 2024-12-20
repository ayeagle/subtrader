import {
  AsyncError,
  CommentSubmissionOptions,
  Devvit,
  Dispatch,
  EnrichedThumbnail,
  GetHotPostsOptions,
  SetStateAction,
  useAsync,
  useState,
} from "@devvit/public-api";
import { PostData, ScoreHistoryItem, UXConfig } from "../data/types.js";
import { add_new_and_calculate_score } from "../data/score_calculator.js";
import { BASE_SCORE } from "../main.js";

type PostContainerProps = {
  UXConfig: UXConfig;
  postData: PostData;
  otherPostData: PostData;
  scoreHistory: ScoreHistoryItem[];
  setScoreHistory: Dispatch<SetStateAction<ScoreHistoryItem[]>>;
  context: Devvit.Context;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  postsBought: PostData[];
  setPostsBought: Dispatch<SetStateAction<PostData[]>>;
  otherPostScore: number;
  score: number;
  setScore: Dispatch<SetStateAction<number>>;
  scoreDelta: number;
  setScoreDelta: Dispatch<SetStateAction<number>>;
  setZoomPost: Dispatch<SetStateAction<PostData | null>>;
  orientation: string;
  postBuy: boolean;
  setPostBuy: Dispatch<SetStateAction<boolean>>;
  lastScoreChange: number;
  setLastScoreChange: Dispatch<SetStateAction<number>>;
};

export default function PostContainer(props: PostContainerProps) {
  const {
    UXConfig,
    postData,
    otherPostData,
    context,
    scoreHistory,
    setScoreHistory,
    step,
    setStep,
    postsBought,
    setPostsBought,
    otherPostScore,
    score,
    setScore,
    setScoreDelta,
    orientation,
    postBuy,
    setPostBuy,
    lastScoreChange,
    setLastScoreChange,
  } = props;

  const handlePostBuy = (): void => {
    setPostsBought([...postsBought, postData]);
    setScoreDelta(score + (postData.score - otherPostScore));
    setPostBuy(true);

    // console.log("OLD SCORE HISTORY");
    // console.log(props.scoreHistory);
    // console.log(scoreHistory);

    const new_score_entry = add_new_and_calculate_score(
      postData,
      otherPostData,
      scoreHistory
    );

    console.log("new_score_entry");
    console.log(new_score_entry);
    console.log("new score to be shown");
    console.log(new_score_entry.cumScore);

    // console.log("new_score_history");
    // console.log(new_score_entry);

    setScore(new_score_entry.cumScore);
    setScoreHistory((prevHistory) => [...prevHistory, new_score_entry]);
    setLastScoreChange(new_score_entry.scoreChangeValue);

    // updateScore(postData.score - otherPostScore, setScore, getScore);
  };
  const handleImageClick = (): void => {
    props.setZoomPost(postData);
  };

  const selected_post_id =
    scoreHistory.length === 0
      ? ""
      : scoreHistory[scoreHistory.length - 1].selected.id;

  return (
    <hstack
      height="100%"
      width="100%"
      gap="small"
      alignment="center middle"
      darkBorderColor="#1d2729"
      lightBorderColor="#1d2729"
      cornerRadius="medium"
      border="thin"
      maxHeight="50%"
      //   maxHeight="80%"
      darkBackgroundColor={
        !postBuy || postData.id !== selected_post_id
          ? ""
          : postData.score >= otherPostData.score
          ? UXConfig.darkGreenColor
          : UXConfig.darkRedColor
      }
      lightBackgroundColor={
        !postBuy || postData.id !== selected_post_id
          ? ""
          : postData.score >= otherPostData.score
          ? UXConfig.lightGreenColor
          : UXConfig.lightRedColor
      }
    >
      <image
        url={postData.image.image.url}
        imageWidth={Math.min(postData.image.image.width, 300)}
        imageHeight={Math.min(postData.image.image.height, 300)}
        width="60%"
        resizeMode="cover"
        onPress={handleImageClick}
      />
      <vstack
        height="80%"
        width="40%"
        gap="medium"
        alignment="center middle"
        padding="small"
      >
        {postBuy === true ? (
          <>
            <text
              alignment="center middle"
              width="100%"
              wrap={true}
              style="heading"
              size={UXConfig.smallFont}
            >
              {postData.title}
            </text>
            <text
              alignment="center middle"
              width="100%"
              wrap={true}
              style="heading"
              // color={postData.score > otherPostData.score ? "green" : "red"}
            >
              {postData.score}
            </text>
          </>
        ) : (
          <>
            <text
              alignment="center middle"
              width="100%"
              wrap={true}
              style="heading"
              size={UXConfig.smallFont}
            >
              {postData.title}
            </text>
            <button
              appearance="primary"
              onPress={handlePostBuy}
              width="40%"
              size="small"
            >
              Buy
            </button>
          </>
        )}
      </vstack>
    </hstack>
  );
  //   }
}

//   if (scoreDelta !== 0) {
//     updateScoreWithTimeout(score, postData.score - otherPostScore, setScore);
//     // const timeout = setTimeout((delta: number) => {
//     //   let scoreIncrement = 0;
//     //   if (delta > 100) {
//     //     scoreIncrement = 39;
//     //   } else if (delta > 40) {
//     //     scoreIncrement = 7;
//     //   } else if (delta > 5) {
//     //     scoreIncrement = 3;
//     //   } else {
//     //     scoreIncrement = 1;
//     //   }
//     //   setScore(score + scoreIncrement);
//     // });
//   }

//   while (scoreDelta != 0) {
//     let scoreIncrement = 1;
//     if (scoreDelta > 100) {
//       scoreIncrement = 39;
//     } else if (scoreDelta > 40) {
//       scoreIncrement = 7;
//     } else if (scoreDelta > 5) {
//       scoreIncrement = 3;
//     } else {
//       scoreIncrement = 1;
//     }
//     setScore(scoreIncrement);
//     updateScore(scoreDelta - scoreIncrement, setScore);
//     // setScoreDelta(scoreDelta - scoreIncrement);
//     setTimeout(() => {}, 100);
//   }

//   if (orientation === "horizontal") {
// return (
//   <vstack
//     height="100%"
//     width="100%"
//     gap="small"
//     alignment="center middle"
//     darkBorderColor="#1d2729"
//     lightBorderColor="#1d2729"
//     cornerRadius="medium"
//     border="thin"
//     maxWidth="50%"
//     //   maxHeight="80%"
//   >
//     <text
//       alignment="center middle"
//       width="100%"
//       wrap={true}
//       style="heading"
//     >
//       {postData.title}
//     </text>
//     <image
//       url={postData.image.image.url}
//       imageWidth={Math.min(postData.image.image.width, 500)}
//       imageHeight={Math.min(postData.image.image.height, 300)}
//       resizeMode="cover"
//       onPress={handleImageClick}
//     />
//     <button
//       appearance="primary"
//       onPress={handlePostBuy}
//       width="40%"
//       size="small"
//     >
//       Buy
//     </button>
//   </vstack>
// );
//   }
//   else {

// function updateScoreWithTimeout(
//   initialScore: number,
//   scoreDelta: number,
//   setScore: Dispatch<SetStateAction<number>>
// ) {
//   let currentScore = initialScore;
//   let remainingDelta = scoreDelta;
//   const symbol = scoreDelta / scoreDelta;

//   function tick() {
//     //   while (remainingDelta !== 0) {
//     // console.log("TICKING!");
//     // console.log(currentScore);
//     // console.log(remainingDelta);
//     if (remainingDelta === 0) return; // Exit if no delta remains

//     let scoreIncrement = 0;
//     let timeoutincr = 0;
//     if (remainingDelta > 100) {
//       scoreIncrement = 39 * symbol;
//       timeoutincr = 1;
//     } else if (remainingDelta > 40) {
//       scoreIncrement = 7 * symbol;
//       timeoutincr = 5;
//     } else if (remainingDelta > 5) {
//       scoreIncrement = 3 * symbol;
//       timeoutincr = 20;
//     } else {
//       scoreIncrement = 1 * symbol;
//       timeoutincr = 100;
//     }

//     // Update local values
//     currentScore += scoreIncrement;
//     remainingDelta -= scoreIncrement;

//     // Dispatch the update to React state
//     setScore(currentScore);

//     // Set the next timeout
//     setTimeout(tick, timeoutincr);
//   }

//   // Start the loop
//   tick();
// }

// async function updateScore(
//   targetScoreDelta: number,
//   setScore: Dispatch<SetStateAction<number>>,
//   getCurrentScore: () => number // Pass a function to get the current score
// ) {
//   let currentScoreDelta = targetScoreDelta;

//   while (currentScoreDelta !== 0) {
//     // console.log("LOOP IS RUNNING");
//     let scoreIncrement = 1;

//     if (currentScoreDelta > 100) {
//       scoreIncrement = 39;
//     } else if (currentScoreDelta > 40) {
//       scoreIncrement = 7;
//     } else if (currentScoreDelta > 5) {
//       scoreIncrement = 3;
//     } else {
//       scoreIncrement = 1;
//     }
//     // console.log(`score delta ${currentScoreDelta}`);
//     // console.log(`score increment ${scoreIncrement}`);
//     // console.log(`current score ${getCurrentScore()}`);
//     // Apply the increment
//     setScore((prevScore) => prevScore + scoreIncrement);

//     // Sleep for 100ms
//     await new Promise((resolve) => setTimeout(resolve, 100));

//     // Recalculate current delta
//     currentScoreDelta = targetScoreDelta - getCurrentScore();
//   }
// }
