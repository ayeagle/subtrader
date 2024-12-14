import { BlockElement, Devvit } from "@devvit/public-api";
import { ScoreBoardEntry, ScoreBoards, UXConfig } from "../data/types.js";

type ScoreBoardColumnProps = {
  UXConfig: UXConfig;
  col_name: string;
  col_width: Devvit.Blocks.SizeString;
  grow: boolean;
  children: Devvit.Fragment;
};

export default function ScoreBoardColumn(props: ScoreBoardColumnProps) {
  const { UXConfig, col_name, col_width, grow, children } = props;
  return (
    <vstack
      // border="thin"
      gap="none"
      // borderColor="grey"
      width={col_width}
      padding="none"
      grow={grow}
    >
      <hstack
        lightBackgroundColor="AliceBlue"
        darkBackgroundColor="DarkSlateBlue"
        // border="thin"
        gap="none"
        // borderColor="grey"
        width="100%"
        padding="none"
        alignment="center middle"
      >
        <text
          alignment="center middle"
          style="heading"
          size={UXConfig.smallFont}
          weight="bold"
        >
          {col_name}
        </text>
      </hstack>
      {children}
    </vstack>
  );
}
