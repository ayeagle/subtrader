import { Devvit } from "@devvit/public-api";
import { ScoreBoardEntry, ScoreBoards, UXConfig } from "../data/types.js";

type ScoreBoardColumnProps = {
  UXConfig: UXConfig;
  item: string;
  idx: number;
};

export default function ScoreBoardRow(props: ScoreBoardColumnProps) {
  const { UXConfig, item, idx } = props;
  return (
    <hstack
      backgroundColor={idx % 2 === 0 ? "Teal" : "SteelBlue"}
      // border="thin"
      gap="none"
      // borderColor="grey"
      width="100%"
      padding="none"
      alignment="center middle"
    >
      <text
        alignment="center middle"
        style="body"
        size={UXConfig.smallFont}
        weight="bold"
      >
        {item}
      </text>
    </hstack>
  );
}
