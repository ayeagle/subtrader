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
import { GeneralData, ScoreBoardEntry } from "../data/types.js";
import {
  genAddScoreboardListing,
  genGlobalScoreboard,
} from "../../server/controllers/scoreboard.server.js";

type GameOverProps = {
  context: Devvit.Context;
  currentScore: number;
  step: number;
  generalDataPayload: GeneralData;
  current_score: number | null;
  cashedOut: boolean;
  //   scoreBoard: ScoreBoardEntry[] | null;
};

export default function GameOver(props: GameOverProps) {
  const handlePostResults = () => {};

  const { generalDataPayload, current_score, cashedOut } = props;

  //   const [scoreBoard, setScoreBoard] = useState<ScoreBoardEntry[] | null>(null);
  // //   const [error, setError] = useState<Error | null>(null);
  //   const [loading, setLoading] = useState(true);

  //   (async () => {
  //     try {
  //       console.log("Fetching scoreboard...");
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
  //     console.log("Fetching scoreboard...");
  //     try {
  //       const data = await genGlobalScoreboard(props.context);
  //       console.log("Data received for scoreboard:", data);
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
  //   console.log("Fetching scoreboard...");

  //   return await genGlobalScoreboard(props.context);
  // }); // No "depends" means it runs on mount

  const {
    data: scoreBoard,
    error: scoreBoardError,
    loading: scoreBoardLoading,
  } = useAsync<ScoreBoardEntry[]>(async () => {
    console.log("Fetching scoreboard...");
    if (generalDataPayload.username && current_score) {
      console.log("attempting genAddScoreboardListing");
      const data = await genAddScoreboardListing(
        props.context,
        generalDataPayload.subredditName,
        generalDataPayload.username,
        current_score
      );
      console.log("DATA GENERATED IN COMPONENT");
      console.log(data);
      return data.slice(0,10);
    }
    return [];
  }); // No "depends" means it runs on mount

  console.log("Scoreboard data");
  console.log(scoreBoard);
  console.log(scoreBoardError);

  const outcome =
    props.currentScore > BASE_SCORE ? (
      <text alignment="start middle" width="100%" style="heading" wrap={true}>
        Nice trading snoo, you made a profit!
      </text>
    ) : (
      <text alignment="start middle" width="100%" style="heading" wrap={true}>
        Uh oh... there goes the retirement fund...
      </text>
    );

  //   const [scoreBoard, setScoreBoard] = useState<ScoreBoardEntry[] | null>(null);
  //   const [loading, setLoading] = useState(true);
  //   //   const [error, setError] = useState<Error | null>(null);
  //   const [trigger, setTrigger] = useState(0); // Trigger state for re-renders

  //   // Function to fetch data
  //   const fetchScoreboard = async () => {
  //     try {
  //       console.log("Fetching scoreboard...");
  //       const data = await genGlobalScoreboard(props.context);

  //       if (data && data.length > 0) {
  //         console.log("Data received for scoreboard:", data);
  //         setScoreBoard(data);
  //       } else {
  //         console.log("No data found for scoreboard.");
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
  if (!scoreBoard || scoreBoard.length === 0)
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
        height="90%"
        width="100%"
        gap="medium"
        alignment="center middle"
        padding="small"
      >
        {outcome}
        <spacer />
        <vstack
          height="100%"
          width="100%"
          gap="none"
          alignment="center middle"
          padding="small"
        >
          {/* {scoreBoard} */}
          {scoreBoard && (
            // scoreBoard.map((item: ScoreBoardEntry, i: number) => {
            //   console.log("The map was triggered");
            //   return (
            <hstack
              gap="none"
              borderColor="grey"
              width="80%"
              border="thin"
              cornerRadius="medium"
              padding="medium"
              lightBackgroundColor="AliceBlue"
              darkBackgroundColor="DarkSlateBlue"
            >
              <vstack
                // border="thin"
                gap="none"
                // borderColor="grey"
                width="10%"
                padding="none"
                // grow={true}
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
                    size="large"
                    weight="bold"
                  >
                    Rank
                  </text>
                </hstack>
                {scoreBoard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <hstack
                      backgroundColor={i % 2 === 0 ? "Teal" : "SteelBlue"}
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
                        size="large"
                        weight="bold"
                      >
                        {i + 1}
                      </text>
                    </hstack>
                  );
                })}
              </vstack>
              <vstack
                // border="thin"
                gap="none"
                // borderColor="grey"
                width="40%"
                padding="none"
                grow={true}
                alignment="center middle"
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
                    size="large"
                    weight="bold"
                  >
                    User
                  </text>
                </hstack>
                {scoreBoard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <hstack
                      backgroundColor={i % 2 === 0 ? "Teal" : "SteelBlue"}
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
                        size="large"
                        weight="bold"
                      >
                        {item.member.username}
                      </text>
                    </hstack>
                  );
                })}
              </vstack>
              <vstack
                // border="thin"
                gap="none"
                // borderColor="grey"
                width="30%"
                padding="none"
                grow={true}
                alignment="center middle"
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
                    size="large"
                    weight="bold"
                  >
                    Subreddit
                  </text>
                </hstack>
                {scoreBoard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <hstack
                      backgroundColor={i % 2 === 0 ? "Teal" : "SteelBlue"}
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
                        size="large"
                        weight="bold"
                      >
                        {item.member.subredditName}
                      </text>
                    </hstack>
                  );
                })}
              </vstack>
              <vstack
                // border="thin"
                gap="none"
                // borderColor="grey"
                width="20%"
                padding="none"
                alignment="center middle"

                // grow={true}
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
                    size="large"
                    weight="bold"
                  >
                    Date
                  </text>
                </hstack>
                {scoreBoard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <hstack
                      backgroundColor={i % 2 === 0 ? "Teal" : "SteelBlue"}
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
                        size="large"
                        weight="bold"
                      >
                        {item.member.dateKey}
                      </text>{" "}
                    </hstack>
                  );
                })}
              </vstack>
              <vstack
                // border="thin"
                gap="none"
                // borderColor="grey"
                width="20%"
                padding="none"
                alignment="center middle"

                // grow={true}
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
                    size="large"
                    weight="bold"
                  >
                    Score
                  </text>
                </hstack>
                {scoreBoard.map((item: ScoreBoardEntry, i: number) => {
                  return (
                    <hstack
                      backgroundColor={i % 2 === 0 ? "Teal" : "SteelBlue"}
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
                        size="large"
                        weight="bold"
                      >
                        {item.score}
                      </text>{" "}
                    </hstack>
                  );
                })}
              </vstack>
            </hstack>
          )}
        </vstack>
        <hstack alignment="start middle">
          <vstack>
            <text
              alignment="start middle"
              width="100%"
              style="heading"
              grow={true}
            >
              Ending Balance:
            </text>{" "}
            <text alignment="start middle" width="100%" style="heading">
              Number of trades:
            </text>
          </vstack>
          <vstack>
            <text alignment="end middle" width="100%" style="heading">
              {props.currentScore}
            </text>
            <text alignment="end middle" width="100%" style="heading">
              {props.step}
            </text>
          </vstack>
        </hstack>

        <button onPress={handlePostResults}>Post results!</button>
      </vstack>
    </hstack>
  );
}
