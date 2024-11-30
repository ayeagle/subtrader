import {
  AsyncError,
  Devvit,
  Dispatch,
  EnrichedThumbnail,
  GetHotPostsOptions,
  SetStateAction,
  useAsync,
  useState,
} from "@devvit/public-api";
import { PostData } from "../main.js";

type PostContainerProps = {
  postData: PostData;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  postsBought: PostData[];
  setPostsBought: Dispatch<SetStateAction<PostData[]>>;
  otherPostScore: number;
  displayScore: number;
  score: number;
  setScore: Dispatch<SetStateAction<number>>;
  scoreDelta: number;
  setScoreDelta: Dispatch<SetStateAction<number>>;
};

export default function PostContainer(props: PostContainerProps) {
  const {
    postData,
    step,
    setStep,
    postsBought,
    setPostsBought,
    otherPostScore,
    score,
    setScore,
    setScoreDelta
  } = props;


  const handlePostBuy = (): void => {
    // setStep(step + 1);
    setPostsBought([...postsBought, postData]);
    setScoreDelta(score + (postData.score - otherPostScore));
    // updateScore(postData.score - otherPostScore, setScore, getScore);
  };

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
  return (
    <vstack
      height="100%"
      width="100%"
      gap="medium"
      alignment="center middle"
      darkBorderColor="#1d2729"
      lightBorderColor="#1d2729"
      cornerRadius="medium"
      border="thin"
      maxWidth="50%"
    >
      <text wrap={true}>{postData.title}</text>
      <image
        url={postData.image.image.url}
        imageWidth={300}
        imageHeight={200}
        resizeMode="fit"
      />
      <button appearance="primary" onPress={handlePostBuy}>
        Buy
      </button>
    </vstack>
  );
}

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
//     console.log("TICKING!");
//     console.log(currentScore);
//     console.log(remainingDelta);
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
//     console.log("LOOP IS RUNNING");
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
//     console.log(`score delta ${currentScoreDelta}`);
//     console.log(`score increment ${scoreIncrement}`);
//     console.log(`current score ${getCurrentScore()}`);
//     // Apply the increment
//     setScore((prevScore) => prevScore + scoreIncrement);

//     // Sleep for 100ms
//     await new Promise((resolve) => setTimeout(resolve, 100));

//     // Recalculate current delta
//     currentScoreDelta = targetScoreDelta - getCurrentScore();
//   }
// }
