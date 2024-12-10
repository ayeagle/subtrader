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
import { BASE_SCORE } from "../main.js";

type IntroProps = {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
};

export default function Intro(props: IntroProps) {
  const handlePostResults = () => {
    props.setStep(props.step + 1);
  };

  return (
    <hstack
      height="100%"
      width="100%"
      gap="small"
      alignment="center middle"
      //   darkBorderColor="#1d2729"
      //   lightBorderColor="#1d2729"
      //   cornerRadius="medium"
      //   border="thin"
      //   maxHeight="50%"
      //   maxHeight="80%"
    >
      <vstack
        height="80%"
        width="70%"
        gap="medium"
        alignment="center middle"
        padding="medium"
      >
        <text
          alignment="center middle"
          width="100%"
          style="heading"
          wrap={true}
        >
          Welcome to Subtrader!
        </text>
        <vstack>
          <text alignment="start middle" width="100%" style="body" wrap={true}>
            Prove your worth as top reddit post trader. Increase your account's
            value by guessing which post is more popular in your community.
          </text>{" "}
          <spacer />
          <text alignment="start middle" width="100%" style="body" wrap={true}>
            1. The closer two posts are in popularity, the higher the reward 🚀 for
            being right.
          </text>
          <spacer />
          <text alignment="start middle" width="100%" style="body" wrap={true}>
            2. The further two posts are in popularity, the greater the loss 🔻 for
            being wrong.
          </text>{" "}
          <spacer />
          <text alignment="start middle" width="100%" style="body" wrap={true}>
            3. Play for at least 5 trades, then cash out when you want and brag
            about your earnings.
          </text>{" "}
          <spacer />
          <text alignment="start middle" width="100%" style="body" wrap={true}>
            Posts are updated each day -- Good luck!
          </text>
        </vstack>
        <button onPress={handlePostResults}>Start trading</button>
      </vstack>
    </hstack>
  );
}
