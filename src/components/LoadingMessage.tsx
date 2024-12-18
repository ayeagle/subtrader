import { Devvit, useInterval, useState } from "@devvit/public-api";
import { UXConfig } from "../data/types.js";

type LoadingMessageProps = {
  UXConfig: UXConfig;
  message: string;
};

export default function LoadingMessage(props: LoadingMessageProps) {
  const { UXConfig, message } = props;
  console.log("Loading message mounted!");

  // Define loading text sequence
  //   const loadingTexts = [
  //     "🌊\u00A0\u00A0\u00A0\u00A0",
  //     "\u00A0🌊\u00A0\u00A0\u00A0",
  //     "\u00A0\u00A0🌊\u00A0\u00A0",
  //     "\u00A0\u00A0\u00A0🌊\u00A0",
  //   ];
  const loadingTexts = [".", "..", "...", ""];
  const loadingEmojis = ["😐", "😐", "😐", "😑"];
  // State to track the current loading text
  const [loadingIndex, setLoadingIndex] = useState<number>(0);
  const [randIndex, setRandIndex] = useState<number>(0);

  // Update the loading text every second

  const { start, stop } = useInterval(() => {
    setLoadingIndex((prevIndex) => Math.min(prevIndex + 1, 100));
    setRandIndex(Math.floor(Math.random() * loadingEmojis.length));
  }, 500);

  // Start the interval when the component mounts
  start();

  return (
    <vstack height="100%" width="100%" gap="medium" alignment="center middle">
      {/* <icon
          name="error-fill"
          lightColor={UXConfig.lightRedColor}
          darkColor={UXConfig.darkRedColor}
        ></icon> */}
      <hstack>
        <text
          size={UXConfig.largeFont}
          style="heading"
          wrap={true}
          alignment="center middle"
          width="80%"
        >
          {message}
        </text>
        <text
          size={UXConfig.largeFont}
          style="heading"
          wrap={true}
          alignment="center middle"
          width="20%"
        >
          {loadingTexts[loadingIndex % loadingTexts.length]}
        </text>
      </hstack>
      <text
        size={"xxlarge"}
        style="heading"
        wrap={true}
        alignment="center middle"
        width="80%"
      >
        {loadingEmojis[randIndex]}
      </text>
    </vstack>
  );
}
