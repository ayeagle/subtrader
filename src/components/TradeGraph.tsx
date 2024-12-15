import { Devvit } from "@devvit/public-api";
import { ScoreHistoryItem, UXConfig } from "../data/types.js";
type TradeGraphProps = {
  UXConfig: UXConfig;
  scoreHistory: ScoreHistoryItem[];
};

export default function TradeGraph(props: TradeGraphProps) {
  const { scoreHistory, UXConfig } = props;

  const startingPoint = 1000; // Explicit starting point
  const max = Math.max(...scoreHistory.map((b) => b.cumScore), startingPoint);
  const min = Math.min(...scoreHistory.map((b) => b.cumScore), startingPoint);

  const totalRange = max - min;

  return (
    <hstack
      height="30%"
      width={`${Math.min(scoreHistory.length * 20, 80)}%`}
      alignment="center middle"
    >
      {scoreHistory.map((item, index) => {
        const prevScore =
          index > 0 ? scoreHistory[index - 1].cumScore : startingPoint;
        const change = item.cumScore - prevScore;

        const topBlankHeight =
          change > 0
            ? ((max - item.cumScore) / totalRange) * 100
            : ((max - prevScore) / totalRange) * 100;

        const barHeight = Math.max((Math.abs(change) / totalRange) * 100, 5);

        const bottomBlankHeight =
          change > 0
            ? ((prevScore - min) / totalRange) * 100
            : ((item.cumScore - min) / totalRange) * 100;

        return (
          <vstack
            width={`${Math.floor(100 / scoreHistory.length)}%`}
            maxWidth="30px"
            height="100%"
            padding="xsmall"
          >
            {/* Top blank space */}
            <vstack
              backgroundColor=""
              height={`${topBlankHeight}%`}
              width="100%"
            ></vstack>

            {/* Gain or loss bar */}
            <vstack
              backgroundColor={
                change > 0 ? UXConfig.darkGreenColor : UXConfig.darkRedColor
              }
              height={`${barHeight}%`}
              width="100%"
            >
              <text>
                {/* {item.cumScore === max ||
                item.cumScore === min ||
                index === scoreHistory.length - 1
                  ? item.cumScore
                  : ""} */}
              </text>
            </vstack>

            {/* Bottom blank space */}
            <vstack
              backgroundColor=""
              height={`${bottomBlankHeight}%`}
              width="100%"
            ></vstack>
          </vstack>
        );
      })}
    </hstack>
  );
}
