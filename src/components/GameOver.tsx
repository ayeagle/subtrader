import {
  AsyncError,
  CommentSubmissionOptions,
  Devvit,
  Dispatch,
  EnrichedThumbnail,
  FormOnSubmitEvent,
  GetHotPostsOptions,
  Post,
  RedditAPIClient,
  SetStateAction,
  SubmitPostOptions,
  useAsync,
  useForm,
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
import {
  genAndPostScoreboardData,
  genScoreboardData,
} from "../pseudo_server/controllers/scoreboard.js";
import ScoreBoardRow from "./ScoreBoardRow.js";
import ScoreBoardColumn from "./ScoreBoardColumn.js";
import TradeGraph from "./TradeGraph.js";
import { genStorePostedScoreHistory } from "../pseudo_server/controllers/submit_post.js";
import { EventHandler } from "@devvit/public-api/devvit/internals/blocks/handler/types.js";
import ErrorMessage from "./ErrorMessage.js";
import LoadingMessage from "./LoadingMessage.js";
// import {
//   genAddScoreboardListing,
//   genGlobalScoreboard,
// } from "../../server/controllers/scoreboard.js";

const MAX_SCOREBOARD_TEXT_LENGTH_BEFORE_TRUNCATION = 50;

type GameOverProps = {
  scoreHistory: ScoreHistoryItem[];
  setScoreHistory: Dispatch<SetStateAction<ScoreHistoryItem[]>>;
  UXConfig: UXConfig;
  context: Devvit.Context;
  currentScore: number;
  setScore: Dispatch<SetStateAction<number>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  generalDataPayload: GeneralData;
  current_score: number | null;
  cashedOut: boolean;
  isPlayingNewGame: boolean;
  setIsPlayingNewGame: Dispatch<SetStateAction<boolean>>;
  setCashedOut: Dispatch<SetStateAction<boolean>>;
  subChosenName: string;
  currEndGameAlreadyPost: boolean;
  optionalGameOverText?: string;
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
    setScore,
    setCashedOut,
    setScoreHistory,
    setStep,
    setIsPlayingNewGame,
    optionalGameOverText,
  } = props;

  // context.ui.showForm;

  // const handlePostResults = (event: FormOnSubmitEvent<FormSubmitEvent>, context: Devvit.Context) => {
  //   setPostSubmitted(true);
  //   setPostTitle(event.values.name);
  // };

  const [postTitle, setPostTitle] = useState<string>("");
  const submit_post_form = useForm(
    {
      fields: [
        {
          type: "string",
          name: "subtrader_post_title",
          label: "Title your SubTrader post!",
          required: true,
          helpText:
            "Your SubTrader trade history will be posted to this subreddit with your title.",
        },
      ],
    },
    (values) => {
      setPostTitle(values["subtrader_post_title"] ?? "");
      setPostSubmitted(true);
    }
  );

  const {
    data: posted,
    error: postedError,
    loading: postedLoading,
  } = useAsync<string>(
    async (): Promise<string> => {
      console.log("THE POSTING WAS TRIGGERED");
      console.log(postSubmitted);
      if (postSubmitted) {
        // TODO NEED TO CHANGE THIS TO NOT USE THE ACTUAL SUBREDDIT

        try {
          const new_post = await props.context.reddit.submitPost({
            title: postTitle,
            subredditName: context.subredditName ?? "SubTrader",
            // The preview appears while the post loads
            preview: (
              <vstack height="100%" width="100%" alignment="middle center">
                <text
                  size={UXConfig.largeFont}
                  style="heading"
                  wrap={true}
                  alignment="center middle"
                  width="80%"
                >
                  Loading trading history...
                </text>
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
        } catch {
          setPostSubmitted(false);
          props.context.ui.showToast({ text: "Uh oh something went wrong!" });
        }
      }
      return "";
    },
    { depends: postSubmitted }
  );

  console.log("POSTED ERROR");
  console.log(postedError);

  // const handlePostResults = () => {
  //   setPostSubmitted(true);
  // };

  const handleResetDataForNewGame = () => {
    setIsPlayingNewGame(true);
    setPostSubmitted(false);
    setScore(BASE_SCORE);
    setStep(-1);
    setScoreHistory([]);
    setCashedOut(false);
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
  const [maxGlobalTextLen, setGlobalMaxTextLen] = useState<number>(-1);
  const [maxSubTextLen, setSubMaxTextLen] = useState<number>(-1);

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
    console.log("Fetching scoreboard...");
    console.log(generalDataPayload);
    if (
      !props.currEndGameAlreadyPost &&
      generalDataPayload.username &&
      current_score
    ) {
      // console.log("attempting genAddScoreboardListing");
      const data = await genAndPostScoreboardData(
        props.context,
        generalDataPayload.subredditName,
        generalDataPayload.username,
        current_score
      );
      // console.log("DATA GENERATED IN COMPONENT");
      // console.log(data);

      return data;
    } else {
      const data = await genScoreboardData(
        props.context,
        generalDataPayload.prevHistory?.generalData.subredditName ?? "",
        generalDataPayload.prevHistory?.generalData.username ?? ""
      );
      return data;
    }
    return null;
  }); // No "depends" means it runs on mount

  // if (
  //   (postedError || !scoreBoard) &&
  //   (currentScoreBoardType === GameOverPageType.GLOBAL ||
  //     currentScoreBoardType === GameOverPageType.SUBREDDIT)
  // ) {
  //   return (
  //     <ErrorMessage
  //       UXConfig={UXConfig}
  //       message="Issue loading scoreboard..."
  //     />
  //   );
  // }

  if (scoreBoard && maxGlobalTextLen === -1 && maxSubTextLen === -1) {
    console.log("Scoreboard calulating triggered");
    setGlobalMaxTextLen(
      scoreBoard.globalScoreboard.reduce((a, b) => {
        return Math.max(
          a,
          b.member.username.length +
            b.member.subredditName.length +
            b.member.dateKey.length +
            b.score.toLocaleString().length
        );
      }, 0)
    );
    setSubMaxTextLen(
      scoreBoard.subredditScoreboard.reduce((a, b) => {
        return Math.max(
          a,
          b.member.username.length +
            b.member.subredditName.length +
            b.member.dateKey.length +
            b.score.toLocaleString().length
        );
      }, 0)
    );
  }

  const maxScore = scoreHistory.reduce((a, b) => {
    return Math.max(a, b.cumScore);
  }, BASE_SCORE);
  const minScore = scoreHistory.reduce((a, b) => {
    return Math.min(a, b.cumScore);
  }, BASE_SCORE);

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
        Nice trading {generalDataPayload.username}, you made a profit!
      </text>
    ) : props.currentScore > 0 ? (
      <text
        alignment="start middle"
        width="100%"
        style="heading"
        wrap={true}
        size={UXConfig.largeFont}
      >
        Uh oh... {generalDataPayload.username} that was the college fund...
      </text>
    ) : (
      <text
        alignment="start middle"
        width="100%"
        style="heading"
        wrap={true}
        size={UXConfig.largeFont}
      >
        What have you done {generalDataPayload.username}... how will we afford
        rent!?
      </text>
    );

  console.log("Max globe length");
  console.log(maxGlobalTextLen);
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
    return <LoadingMessage UXConfig={UXConfig} message="Loading Scoreboards" />;

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

  // switch (currentScoreBoardType) {
  //   case GameOverPageType.OVERVIEW: {
  //   }
  // }

  // console.log("IS VIEWER POSTER");
  // console.log(generalDataPayload);
  // console.log(generalDataPayload?.isViewerPoster);

  const should_show_date_column =
    (maxGlobalTextLen < MAX_SCOREBOARD_TEXT_LENGTH_BEFORE_TRUNCATION &&
      currentScoreBoardType === GameOverPageType.GLOBAL) ||
    (maxSubTextLen < MAX_SCOREBOARD_TEXT_LENGTH_BEFORE_TRUNCATION &&
      currentScoreBoardType === GameOverPageType.SUBREDDIT);

  const curr_personal_ranking_data =
    currentScoreBoardType === GameOverPageType.GLOBAL
      ? scoreBoard.globalRank
      : scoreBoard.subredditRank;

  console.log("This is the current step");
  console.log(props.step);
  console.log("personal ranking");
  console.log(curr_personal_ranking_data);
  console.log("props.generalDataPayload passed to gameover");
  console.log(props.generalDataPayload);

  const subreddit_name_to_use = props.isPlayingNewGame
    ? props.generalDataPayload.subredditName
    : props.generalDataPayload.prevHistory?.generalData.subredditName;

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
        <hstack gap="medium">
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
            Global Scores
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
            Sub Scores
          </button>
        </hstack>
        <vstack
          height="70%"
          width="100%"
          gap="none"
          alignment="center top"
          padding="small"
        >
          {currentScoreBoardType === GameOverPageType.OVERVIEW ? (
            <>
              <hstack alignment="center middle">{outcome}</hstack>
              {optionalGameOverText && (
                <text style="body" size={UXConfig.smallFont}>
                  {optionalGameOverText}
                </text>
              )}
              <spacer />
              <TradeGraph scoreHistory={scoreHistory} UXConfig={UXConfig} />
              <spacer />{" "}
              <text style="body" size={UXConfig.largeFont} grow={true}>
                {subreddit_name_to_use ? "r/" + subreddit_name_to_use : ""}
              </text>
              <hstack alignment="center middle" grow={true} minWidth={"50%"}>
                <vstack alignment="start middle" grow={true}>
                  <text style="body" size={UXConfig.smallFont} grow={true}>
                    Number of trades:
                  </text>
                  <text style="body" size={UXConfig.smallFont} grow={true}>
                    Max Balance:
                  </text>
                  <text style="body" size={UXConfig.smallFont} grow={true}>
                    Min Balance:
                  </text>
                  <vstack borderColor="grey" border="thin" width="100%" />
                  <text size={UXConfig.largeFont} style="heading" grow={true}>
                    Ending Balance:
                  </text>
                </vstack>
                <vstack alignment="end middle" grow={true}>
                  <text style="heading" size={UXConfig.smallFont}>
                    {props.scoreHistory.length}
                  </text>
                  <text style="body" size={UXConfig.smallFont}>
                    {maxScore}
                  </text>
                  <text style="body" size={UXConfig.smallFont}>
                    {minScore}
                  </text>
                  <vstack borderColor="grey" border="thin" width="100%" />
                  <text style="heading" size={UXConfig.largeFont}>
                    {props.currentScore}
                  </text>
                </vstack>
              </hstack>
              <spacer />
              {postedLoading ? (
                <LoadingMessage
                  UXConfig={UXConfig}
                  message="Waiting for post..."
                />
              ) : props.isPlayingNewGame === false ? (
                <button onPress={handleResetDataForNewGame}>
                  Play your own game!
                </button>
              ) : postSubmitted ? (
                <button onPress={goToPost}>Go to post!</button>
              ) : !props.currEndGameAlreadyPost ? (
                <button
                  onPress={() => {
                    context.ui.showForm(submit_post_form);
                  }}
                >
                  Post results!
                </button>
              ) : (
                <></>
              )}
              {/* <button onPress={handleResetDataForNewGame}>
                Remove this button
              </button> */}
            </>
          ) : (
            <hstack
              gap="none"
              // borderColor="grey"
              width={UXConfig.maxWidth}
              // border="thin"
              cornerRadius="medium"
              padding="medium"
              // lightBackgroundColor="AliceBlue"
              // darkBackgroundColor="DarkSlateBlue"
              alignment="center top"
            >
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="Rank"
                // col_width={"5%"}
                grow={true}
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
                {(curr_personal_ranking_data?.rank ?? 100) > 9 && (
                  <>
                    <ScoreBoardRow UXConfig={UXConfig} item={`...`} idx={0} />
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={`${(curr_personal_ranking_data?.rank ?? 0) + 1}`}
                      idx={1}
                    />
                  </>
                )}
              </ScoreBoardColumn>
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="User"
                // col_width={"30%"}
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
                {(curr_personal_ranking_data?.rank ?? 100) > 9 && (
                  <>
                    <ScoreBoardRow UXConfig={UXConfig} item={`...`} idx={0} />
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={curr_personal_ranking_data?.member.username ?? ""}
                      idx={1}
                    />{" "}
                  </>
                )}
              </ScoreBoardColumn>
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="Subreddit"
                // col_width={"30%"}
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
                })}{" "}
                {(curr_personal_ranking_data?.rank ?? 100) > 9 && (
                  <>
                    {" "}
                    <ScoreBoardRow UXConfig={UXConfig} item={`...`} idx={0} />
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={`${curr_personal_ranking_data?.member.subredditName}`}
                      idx={1}
                    />{" "}
                  </>
                )}
              </ScoreBoardColumn>
              {should_show_date_column && (
                <ScoreBoardColumn
                  UXConfig={UXConfig}
                  col_name="Date"
                  // col_width={"15%"}
                  grow={true}
                >
                  {current_scoreboard.map(
                    (item: ScoreBoardEntry, i: number) => {
                      return (
                        <ScoreBoardRow
                          UXConfig={UXConfig}
                          item={item.member.dateKey}
                          idx={i}
                        />
                      );
                    }
                  )}{" "}
                  {(curr_personal_ranking_data?.rank ?? 100) > 9 && (
                    <>
                      <ScoreBoardRow UXConfig={UXConfig} item={`...`} idx={0} />
                      <ScoreBoardRow
                        UXConfig={UXConfig}
                        item={`${curr_personal_ranking_data?.member.dateKey}`}
                        idx={1}
                      />{" "}
                    </>
                  )}
                </ScoreBoardColumn>
              )}
              <ScoreBoardColumn
                UXConfig={UXConfig}
                col_name="Scores"
                // col_width={"20%"}
                grow={true}
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
                {(curr_personal_ranking_data?.rank ?? 100) > 9 && (
                  <>
                    {" "}
                    <ScoreBoardRow UXConfig={UXConfig} item={`...`} idx={0} />
                    <ScoreBoardRow
                      UXConfig={UXConfig}
                      item={`${curr_personal_ranking_data?.score}`}
                      idx={1}
                    />{" "}
                  </>
                )}
              </ScoreBoardColumn>
            </hstack>
          )}
        </vstack>
      </vstack>
    </hstack>
  );
}
