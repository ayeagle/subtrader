import {
  AsyncError,
  CommentSubmissionOptions,
  Devvit,
  Dispatch,
  EnrichedThumbnail,
  GetHotPostsOptions,
  Post,
  RedditAPIClient,
  SetStateAction,
  useAsync,
  useState,
} from "@devvit/public-api";
import { BASE_SCORE } from "../main.js";
import {
  GeneralData,
  ScoreBoardEntry,
  ScoreBoards,
  GameOverPageType,
  UXConfig,
  ScoreHistoryItem,
  PostedScoreObject,
} from "../data/types.js";
import { genPostScoreboardUpdates } from "../pseudo_server/controllers/scoreboard.js";
import ScoreBoardRow from "./ScoreBoardRow.js";
import ScoreBoardColumn from "./ScoreBoardColumn.js";
import TradeGraph from "./TradeGraph.js";
import { genStorePostedScoreHistory } from "../pseudo_server/controllers/submit_post.js";
// import {
//   genAddScoreboardListing,
//   genGlobalScoreboard,
// } from "../../server/controllers/scoreboard.js";

type GameOverProps = {
  scoreHistory: ScoreHistoryItem[];
  UXConfig: UXConfig;
  context: Devvit.Context;
  currentScore: number;
  step: number;
  generalDataPayload: GeneralData;
  current_score: number | null;
  cashedOut: boolean;
  //   scoreBoard: ScoreBoardEntry[] | null;
};

export default function GameOver(props: GameOverProps) {
  const [postSubmitted, setPostSubmitted] = useState<boolean>(false);
  const {
    scoreHistory,
    UXConfig,
    context,
    generalDataPayload,
    current_score,
    cashedOut,
  } = props;

  const {
    data: posted,
    error: postedError,
    loading: postedLoading,
  } = useAsync<string>(
    async (): Promise<string> => {
      console.log("THE POSTING WAS TRIGGERED");
      console.log(postSubmitted);
      if (postSubmitted) {
        const new_post = await props.context.reddit.submitPost({
          title: "My devvit post",
          subredditName: props.generalDataPayload.subredditName,
          // The preview appears while the post loads
          preview: (
            <vstack height="100%" width="100%" alignment="middle center">
              <text size="large">Loading trading history...</text>
            </vstack>
          ),
        });

        const post_options: PostedScoreObject = {
          scoreHistory: props.scoreHistory,
          totalScore: props.currentScore,
          numTrades: scoreHistory.length,
          generalData: props.generalDataPayload,
        };

        await genStorePostedScoreHistory(
          props.context,
          post_options,
          new_post.id
        );

        props.context.ui.showToast({ text: "Created post!" });
        return new_post.id;
      }
      return "";
    },
    { depends: postSubmitted }
  );

  const handlePostResults = () => {
    setPostSubmitted(true);
  };

  const goToPost = () => {
    const url =
      "https://www.reddit.com/r/" +
      context.subredditName +
      "/comments/" +
      posted +
      "/";
    context.ui.navigateTo(url);
  };

  const [currentScoreBoardType, setCurrentScoreBoardType] =
    useState<GameOverPageType>(GameOverPageType.OVERVIEW);

  //   const [scoreBoard, setScoreBoard] = useState<ScoreBoardEntry[] | null>(null);
  // //   const [error, setError] = useState<Error | null>(null);
  //   const [loading, setLoading] = useState(true);

  //   (async () => {
  //     try {
  //       // console.log("Fetching scoreboard...");
  //       const data = await genGlobalScoreboard(props.context);
  //       setScoreBoard(data);
  //     } catch (err) {
  //     //   setError(err as Error);
  //       console.error("Error fetching scoreboard:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   })();
  //   const {
  //     data: scoreBoard,
  //     error: scoreBoardError,
  //     loading: scoreBoardLoading,
  //   } = useAsync<ScoreBoardEntry[]>(async () => {
  //     // console.log("Fetching scoreboard...");
  //     try {
  //       const data = await genGlobalScoreboard(props.context);
  //       // console.log("Data received for scoreboard:", data);
  //       return data; // Return the data directly
  //     } catch (error) {
  //       console.error("Error fetching scoreboard:", error);
  //       throw error; // Let useAsync manage the error
  //     }
  //   });

  // const {
  //   data: scoreBoard,
  //   error: scoreBoardError,
  //   loading: scoreBoardLoading,
  // } = useAsync<ScoreBoardEntry[]>(async () => {
  //   // console.log("Fetching scoreboard...");

  //   return await genGlobalScoreboard(props.context);
  // }); // No "depends" means it runs on mount

  const {
    data: scoreBoard,
    error: scoreBoardError,
    loading: scoreBoardLoading,
  } = useAsync<ScoreBoards | null>(async () => {
    // console.log("Fetching scoreboard...");
    if (generalDataPayload.username && current_score) {
      // console.log("attempting genAddScoreboardListing");
      const data = await genPostScoreboardUpdates(
        props.context,
        generalDataPayload.subredditName,
        generalDataPayload.username,
        current_score
      );
      // console.log("DATA GENERATED IN COMPONENT");
      // console.log(data);
      return data;
    }
    return null;
  }); // No "depends" means it runs on mount

  // console.log("Scoreboard data");
  // console.log(scoreBoard);
  // console.log(scoreBoardError);

  const outcome =
    props.currentScore > BASE_SCORE ? (
      <text
        alignment="start middle"
        width="100%"
        style="heading"
        wrap={true}
        size={UXConfig.largeFont}
      >
        Nice trading snoo, you made a profit!
      </text>
    ) : props.currentScore > 0 ? (
      <text
        alignment="start middle"
        width="100%"
        style="heading"
        wrap={true}
        size={UXConfig.largeFont}
      >
        Uh oh... there goes the retirement fund...
      </text>
    ) : (
      <text
        alignment="start middle"
        width="100%"
        style="heading"
        wrap={true}
        size={UXConfig.largeFont}
      >
        What have you done... how will we afford rent!?
      </text>
    );

  //   const [scoreBoard, setScoreBoard] = useState<ScoreBoardEntry[] | null>(null);
  //   const [loading, setLoading] = useState(true);
  //   //   const [error, setError] = useState<Error | null>(null);
  //   const [trigger, setTrigger] = useState(0); // Trigger state for re-renders

  //   // Function to fetch data
  //   const fetchScoreboard = async () => {
  //     try {
  //       // console.log("Fetching scoreboard...");
  //       const data = await genGlobalScoreboard(props.context);

  //       if (data && data.length > 0) {
  //         // console.log("Data received for scoreboard:", data);
  //         setScoreBoard(data);
  //       } else {
  //         // console.log("No data found for scoreboard.");
  //         setScoreBoard([]);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching scoreboard:", err);
  //       //   setError(err as Error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // Conditional rendering
  //   if (loading) return <div>Loading...</div>;
  //   if (error) return <div>Error: {error.message}</div>;
  // console.log("Right before early return");
  // console.log(scoreBoard);
  // console.log(currentScoreBoardType);
  if (!scoreBoard)
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
        <text>Loading scoreboard...</text>
      </hstack>
    );

  const current_scoreboard =
    currentScoreBoardType === GameOverPageType.GLOBAL
      ? scoreBoard.globalScoreboard
      : scoreBoard.subredditScoreboard;

  // console.log("CURRENT SCOREBOARD TYPE");
  // console.log(currentScoreBoardType);

  // console.log("context.dimensions?.scale");
  // console.log(context.dimensions?.scale);
  // console.log("context.dimensions?.width");
  // console.log(context.dimensions?.width);

  const font_size =
    (context.dimensions?.width ?? 0) < 400
      ? "small"
      : (context.dimensions?.width ?? 0) < 600
      ? "medium"
      : "large";

  switch (currentScoreBoardType) {
    case GameOverPageType.OVERVIEW: {
    }
  }

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
        height="100%"
        width="100%"
        gap="medium"
        alignment="center middle"
        padding="small"
      >
        <hstack>
          <button
            onPress={() => setCurrentScoreBoardType(GameOverPageType.OVERVIEW)}
            appearance={
              currentScoreBoardType === GameOverPageType.OVERVIEW
                ? "primary"
                : "secondary"
            }
            size={UXConfig.smallButtonSize}
          >
            Overview
          </button>
          <button
            onPress={() => setCurrentScoreBoardType(GameOverPageType.GLOBAL)}
            appearance={
              currentScoreBoardType === GameOverPageType.GLOBAL
                ? "primary"
                : "secondary"
            }
            size={UXConfig.smallButtonSize}
          >
            Global
          </button>
          <button
            onPress={() => setCurrentScoreBoardType(GameOverPageType.SUBREDDIT)}
            appearance={
              currentScoreBoardType === GameOverPageType.SUBREDDIT
                ? "primary"
                : "secondary"
            }
            size={UXConfig.smallButtonSize}
          >
            Sub
          </button>
        </hstack>
        <vstack
          height="70%"
          width="100%"
          gap="none"
          alignment="center middle"
          padding="small"
        >
          {currentScoreBoardType === GameOverPageType.OVERVIEW ? (
            <>
              <hstack alignment="center middle">{outcome}</hstack>
              <spacer />
              <TradeGraph scoreHistory={scoreHistory} UXConfig={UXConfig} />
              <spacer />
              <hstack alignment="start middle">
                <vstack>
                  <text
                    alignment="start middle"
                    width="100%"
                    size={UXConfig.largeFont}
                    style="heading"
                    grow={true}
                  >
                    Ending Balance:
                  </text>{" "}
                  <text
                    alignment="start middle"
                    width="100%"
                    style="heading"
                    size={UXConfig.largeFont}
                  >
                    Number of trades:
                  </text>
                </vstack>
                <vstack>
                  <text alignment="end middle" width="100%" style="heading">
                    {props.currentScore}
                  </text>
                  <text alignment="end middle" width="100%" style="heading">
                    {props.scoreHistory.length}
                  </text>
                </vstack>
              </hstack>

              {postSubmitted ? (
                <button onPress={goToPost}>Go to post!</button>
              ) : (
                <button onPress={handlePostResults}>Post results!</button>
              )}
            </>
          ) : (
            <hstack
              gap="none"
              borderColor="grey"
              width={UXConfig.maxWidth}
              border="thin"
              cornerRadius="medium"
              padding="medium"
              lightBackgroundColor="AliceBlue"
              darkBackgroundColor="DarkSlateBlue"
            >
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="Rank"
                col_width={"10%"}
                grow={false}
              >
                {current_scoreboard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={`${i + 1}`}
                      idx={i}
                    />
                  );
                })}
              </ScoreBoardColumn>
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="User"
                col_width={"40%"}
                grow={true}
              >
                {current_scoreboard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={item.member.username}
                      idx={i}
                    />
                  );
                })}
              </ScoreBoardColumn>
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="Subreddit"
                col_width={"30%"}
                grow={true}
              >
                {current_scoreboard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={item.member.subredditName}
                      idx={i}
                    />
                  );
                })}
              </ScoreBoardColumn>
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="Date"
                col_width={"10%"}
                grow={false}
              >
                {current_scoreboard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={item.member.dateKey}
                      idx={i}
                    />
                  );
                })}
              </ScoreBoardColumn>
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="Scores"
                col_width={"10%"}
                grow={false}
              >
                {current_scoreboard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={`${item.score}`}
                      idx={i}
                    />
                  );
                })}
              </ScoreBoardColumn>
            </hstack>
          )}
        </vstack>
      </vstack>
    </hstack>
  );
}
