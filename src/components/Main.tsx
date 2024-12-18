import {
  AsyncError,
  BlockElement,
  CommentSubmissionOptions,
  Devvit,
  EnrichedThumbnail,
  GetHotPostsOptions,
  useAsync,
  useInterval,
  useState,
  DevvitDebug,
  Listing,
  Post,
  useForm,
  Subreddit,
} from "@devvit/public-api";
import { T2ID, T3ID, T5ID } from "@devvit/shared-types/tid.js";

import {
  CurrSubData,
  GeneralData,
  PostData,
  PostDataObject,
  PostedScoreObject,
  ScoreBoardEntry,
  ScoreHistoryItem,
  SubDataSource,
  UXConfig,
} from "../data/types.js";
import OrientationFormatter from "../components/OrientationFormatter.js";
import SingleImageView from "../components/SingleImageView.js";

import GameOver from "../components/GameOver.js";
import Intro from "../components/Intro.js";
import {
  genFilteredAdditionalTopPostsData,
  genFilteredTopPostsData,
} from "../pseudo_server/utils/post_fetch.js";
import { genAddSubTraderPost } from "../pseudo_server/controllers/posts.js";
import { getScoreModifier } from "../data/score_calculator.js";
import { genRetrievePostedScoreHistory } from "../pseudo_server/controllers/submit_post.js";
import ErrorMessage from "../components/ErrorMessage.js";
import LoadingMessage from "../components/LoadingMessage.js";
import PostContainer from "./PostContainer.js";

type MainProps = {
  context: Devvit.Context;
  UXConfig: UXConfig;
};

export default function Main(props: MainProps) {
  const { context, UXConfig } = props;
  const [step, setStep] = useState(-1);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryItem[]>([]);
  const [score, setScore] = useState<number>(1000);
  const [lastScoreChange, setLastScoreChange] = useState<number>(0);
  const [postsBought, setPostsBought] = useState<PostData[]>([]);
  const [scoreDelta, setScoreDelta] = useState<number>(0);
  const [ZoomPost, setZoomPost] = useState<PostData | null>(null);
  const [postBuy, setPostBuy] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [isPlayingNewGame, setIsPlayingNewGame] = useState<boolean>(false);
  const [subChosenName, setSubChosenName] = useState<string>("");
  const [subChosenId, setSubChosenId] = useState<string>("");
  const [resets, setResets] = useState<boolean>(false);

  const {
    data: generalDataPayload,
    error: generaLDataError,
    loading: generalDataLoading,
  } = useAsync<GeneralData>(
    async (): Promise<GeneralData> => {
      if (cashedOut && generalDataPayload) {
        return generalDataPayload;
      }

      let generalDataTemplate: GeneralData = generalDataPayload ?? {
        userId: "" as T2ID,
        username: "",
        subredditId: "" as T5ID,
        subredditName: "",
        currentPostId: "",
        currSub: null,
        prevHistory: null,
        isViewerPoster: false,
      };

    //   if (resets) {
    //     setStep(-1);
    //     setSubChosenId("");
    //     setSubChosenName("");
    //     setResets(false)
    //   }

      if (!generalDataPayload) {
        let prev_history: PostedScoreObject | null = null;

        if (context.postId) {
          console.log("PREVIOUS POST ID EXISTS");
          prev_history = await genRetrievePostedScoreHistory(
            context,
            context.postId
          );
        } else {
          console.log("PREVIOUS POST ID DOES NOT EXIST OR WHATEVER");
        }

        generalDataTemplate = {
          ...generalDataTemplate,
          prevHistory: prev_history,
        };
      }

      if (
        !generalDataPayload ||
        !generalDataPayload.userId ||
        !generalDataPayload.username
      ) {
        const user = await context.reddit.getCurrentUser();

        generalDataTemplate = {
          ...generalDataTemplate,
          userId: user?.id ?? null,
          username: user?.username ?? null,
        };
      }

      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log("SUB CHOSEN ID");
      console.log(subChosenId);
      console.log(subChosenName);
      console.log(generalDataPayload?.currSub?.postData.length ?? 0);
      if (
        subChosenId &&
        (generalDataPayload?.currSub?.postData.length ?? 0) < 10
      ) {
        const curr_post = await context.reddit.getPostById(
          context.postId ?? ""
        );

        const [subData, author] = await Promise.all([
          await genFilteredTopPostsData(
            context,
            subChosenName,
            "",
            SubDataSource.TOP
          ),
          await curr_post.getAuthor(),
        ]);

        console.log("******************** This is the result right before");
        console.log(subData);
        // if (subData == null) {
        //   throw new Error("issue fetching data");
        // }

        const is_poster = author?.id === context.userId;
        // console.log("author");
        // console.log(author?.id);
        // console.log(author?.username);
        // console.log("user");
        // console.log(user?.id);
        // console.log(user?.username);

        generalDataTemplate = {
          ...generalDataTemplate,
          subredditId: subChosenId as T5ID,
          subredditName: subChosenName as T3ID,
          currentPostId: context.postId ?? null,
          currSub: subData,
          isViewerPoster: is_poster,
        };

        return generalDataTemplate;
      }

      if (!generalDataPayload) {
        console.log("Data fetch was triggered!!!!!");

        let prev_history: PostedScoreObject | null = null;

        if (context.postId) {
          console.log("PREVIOUS POST ID EXISTS");
          prev_history = await genRetrievePostedScoreHistory(
            context,
            context.postId
          );
        } else {
          console.log("PREVIOUS POST ID DOES NOT EXIST OR WHATEVER");
        }
        generalDataTemplate = {
          ...generalDataTemplate,
          prevHistory: prev_history,
        };
      } else if (subChosenId) {
        console.log("additional data fetch happening maybe");
        if (
          (generalDataPayload.currSub?.postData.length ?? 0) - step * 2 <=
          4
        ) {
          console.log("IS IT HAPPENING");
          let postDataObject;

          const subData = await genFilteredAdditionalTopPostsData(
            context,
            subChosenName,
            generalDataPayload.currSub?.lastCursor ?? "",
            SubDataSource.TOP
          );

          generalDataTemplate = {
            ...generalDataTemplate,
            currentPostId: context.postId ?? null,
            currSub: subData,
          };
        }
      }

      if (isPlayingNewGame && !subChosenId) {
        console.log("looks like we're wiping out the prev history...");
        generalDataTemplate = {
          ...generalDataTemplate,
          prevHistory: null,
        };
      }
      return generalDataTemplate;
    },
    { depends: [step, isPlayingNewGame, subChosenId, resets] }
  );

  if (generalDataLoading) {
    return <LoadingMessage UXConfig={UXConfig} message="Booting terminal" />;
  }

  // console.log("evaliating for showing prev history");
  // console.log(generalDataPayload?.prevHistory);
  // console.log(!isPlayingNewGame);

  if (generalDataPayload?.prevHistory && !isPlayingNewGame) {
    console.log("Gameover triggered by prev history");
    console.log(generalDataPayload);
    return (
      <GameOver
        UXConfig={UXConfig}
        context={context}
        currentScore={generalDataPayload.prevHistory.totalScore}
        step={generalDataPayload.prevHistory.numTrades}
        cashedOut={true}
        generalDataPayload={generalDataPayload}
        current_score={generalDataPayload.prevHistory.totalScore}
        scoreHistory={generalDataPayload.prevHistory.scoreHistory}
        setStep={setStep}
        setScore={setScore}
        setScoreHistory={setScoreHistory}
        isPlayingNewGame={isPlayingNewGame}
        setIsPlayingNewGame={setIsPlayingNewGame}
        setCashedOut={setCashedOut}
        currEndGameAlreadyPost={true}
        subChosenName={subChosenName}

        // scoreBoard={scoreBoard}
      />
    );
  }

  const subData = generalDataPayload?.currSub;
  // console.log("POST OBJECT IN MAIN");
  // console.log(postDataObject);

  // const {
  //   data: subData,
  //   error,
  //   loading,
  // } = genFilteredTopPostsData(context, generalData?.subredditName);

  // console.log("step in main component");
  // console.log(step);
  // console.log(subChosenId);
  if (step === -1) {
    return (
      <Intro
        context={context}
        generalDataPayload={generalDataPayload}
        UXConfig={UXConfig}
        step={step}
        setStep={setStep}
        subChosenName={subChosenName}
        setSubChosenName={setSubChosenName}
        subChosenId={subChosenId}
        setSubChosenId={setSubChosenId}
        setIsPlayingNewGame={setIsPlayingNewGame}
      />
    );
  }

  // if (generaLDataError) {
  //   console.log("generaLDataError!!!!!!!!");
  //   console.log(generaLDataError);
  //   return (
  //     <vstack
  //       height="100%"
  //       width="100%"
  //       gap="medium"
  //       alignment="center middle"
  //     >
  //       <text size="small">Something went wrong... we're working on it.</text>
  //     </vstack>
  //   );
  // }
  // console.log("subdata");
  // console.log(generalDataPayload?.currSub);

  // const submit_post_form = useForm(
  //   {
  //     fields: [
  //       {
  //         type: "string",
  //         name: "subreddit_chosen",
  //         label: "eg funny",
  //         required: true,
  //         helpText: "Choose the subreddit you'd like to trade posts from.",
  //       },
  //     ],
  //   },
  //   (values) => {
  //     setSubChosenName(cleanSubredditName(values["subreddit_chosen"]));
  //   }
  // );

  // const invalid_sub_input = useForm(
  //   {
  //     fields: [
  //       {
  //         type: "string",
  //         name: "subreddit_chosen",
  //         label: "eg funny",
  //         required: true,
  //         helpText:
  //           "Try re-entering the subreddit name or choosing a new one.",
  //       },
  //     ],
  //   },
  //   (values) => {
  //     setSubChosenName(cleanSubredditName(values["subreddit_chosen"]));
  //   }
  // );

  // const cleanSubredditName = (str?: string): string => {
  //   return (str ?? "").replace("r/", "");
  // };

  // const {
  //   data: sub,
  //   error: error,
  //   loading: loading,
  // } = useAsync<[string, string] | null>(
  //   async (): Promise<[string, string] | null> => {
  //     console.log("subChosen");
  //     console.log(subChosenName);

  //     if (subChosenName !== "") {
  //       try {
  //         const sub = await context.reddit.getSubredditInfoByName(
  //           subChosenName
  //         );
  //         if (sub.name && sub.id) {

  //           // props.setIsPlayingNewGame(true)
  //           return [sub.name, sub.id];
  //         } else {
  //           context.ui.showForm(invalid_sub_input);
  //         }
  //       } catch {
  //         context.ui.showForm(invalid_sub_input);
  //       }
  //     }
  //     return null;
  //   },
  //   { depends: [subChosenName] }
  // );

  if (!subData || subData?.postData.length < 4) {
    // setSubChosenId("")
    // setSubChosenName("")
    return (
      <ErrorMessage
        UXConfig={UXConfig}
        message={`We weren't able to find enough eligible posts for SubTrader on r/${generalDataPayload?.subredditName} today, sorry! If on mobile, you may need to exit the app to try again.`}
        setResets={setResets}
      />
    );
  }

  // const score_component = (
  //   // score_loading === true ? (
  //   //   <text alignment="start top" style="heading">
  //   //     Balance: Calulating...
  //   //   </text>
  //   // ) : (
  //   <text alignment="start top" style="heading">
  //     Balance: {score}
  //   </text>
  // );
  // // );

  // const last_score_component = (
  //   // last_score_loading === true ? (
  //   //   <text alignment="start top" style="heading">
  //   //     P/L: Calculating...
  //   //   </text>
  //   // ) : (
  //   <text
  //     alignment="start top"
  //     // width="30%"
  //     style="heading"
  //     // grow={true}
  //     color={(lastScoreChange ?? 0) > 0 ? "green" : "red"}
  //   >
  //     P/L: {lastScoreChange ?? 0}
  //   </text>
  // );

  // const last_score_component_percent = (
  //   // last_score_loading === true ? (
  //   //   <text alignment="start top" style="heading">
  //   //     P/L: Calculating...
  //   //   </text>
  //   // ) : (
  //   <text
  //     alignment="start top"
  //     // width="30%"
  //     style="heading"
  //     // grow={true}
  //     color={(lastScoreChange ?? 0) > 0 ? "green" : "red"}
  //   >
  //     P/L %: {score - (lastScoreChange ?? 0) / score}
  //   </text>
  // );
  // // );

  const post1 = step !== -1 && subData.postData[step * 2];
  const post2 = step !== -1 && subData.postData[step * 2 + 1];

  // const {
  //   data: scoreBoard,
  //   error: scoreBoardError,
  //   loading: scoreBoardLoading,
  // } = useAsync<ScoreBoardEntry[]>(
  //   async () => {
  //     // console.log("fetching scoreboard");
  //     return await genGlobalScoreboard(context);
  //   },
  //   { depends: cashedOut }
  // );

  const handleProceed = (): void => {
    // if (step > 6) {
    //   setStep(0);
    // }

    setStep(step + 1);
    setPostBuy(false);
  };

  console.log("score");
  console.log(score);

  const handleCashout = (): void => {
    // console.log("cashout triggered");
    setStep(step + 1);
    setPostBuy(false);

    // console.log(cashedOut);
    // console.log(generalDataPayload.username);
    // // console.log(current_score);

    // if (generalDataPayload.username && current_score) {
    // const global_scores = genAddScoreboardLising(
    //   context,
    //   generalDataPayload.subredditName,
    //   generalDataPayload.username,
    //   current_score
    // );
    setCashedOut(true);
    // }
    if (generalDataPayload) {
      genAddSubTraderPost(context, generalDataPayload, scoreHistory);
    }
  };

  // console.log("Should we cash out rn?");
  // console.log(cashedOut);
  if (cashedOut || score <= 0) {
    console.log("Gameover triggered by cashed out or score");

    return (
      <GameOver
        UXConfig={UXConfig}
        context={context}
        currentScore={score ?? 0}
        step={step}
        cashedOut={cashedOut}
        generalDataPayload={generalDataPayload}
        current_score={score}
        scoreHistory={scoreHistory}
        setStep={setStep}
        setScore={setScore}
        setScoreHistory={setScoreHistory}
        isPlayingNewGame={isPlayingNewGame}
        setIsPlayingNewGame={setIsPlayingNewGame}
        setCashedOut={setCashedOut}
        subChosenName={subChosenName}
        currEndGameAlreadyPost={false}
        // scoreBoard={scoreBoard}
      />
    );
  }

  if (post1 && post2) {
    return (
      <>
        <vstack
          height="100%"
          width="100%"
          gap="small"
          alignment="center top"
          padding="medium"
        >
          <vstack
            height="100%"
            width="100%"
            gap="small"
            alignment="center middle"
          >
            {/* <image
          url="logo.png"
          description="logo"
          imageHeight={256}
          imageWidth={256}
          height="48px"
          width="48px"
        /> */}
            {ZoomPost != null ? (
              <SingleImageView
                context={context}
                postData={ZoomPost}
                setZoomPost={setZoomPost}
              />
            ) : (
              // context.dimensions?.width ?? 0 > 500 ? (
              //   <hstack
              //     height="80%"
              //     width="100%"
              //     gap="medium"
              //     alignment="center middle"
              //     padding="small"
              //   >
              //     <PostContainer
              //       postData={post2}
              //       context={context}
              //       step={step}
              //       setStep={setStep}
              //       postsBought={postsBought}
              //       setPostsBought={setPostsBought}
              //       otherPostScore={post1.score}
              //       score={score}
              //       displayScore={displayScore}
              //       setScore={setScore}
              //       scoreDelta={scoreDelta}
              //       setScoreDelta={setScoreDelta}
              //       setZoomPost={setZoomPost}
              //       orientation={"vertical"}
              //     />
              //     <PostContainer
              //       postData={post1}
              //       context={context}
              //       step={step}
              //       setStep={setStep}
              //       postsBought={postsBought}
              //       setPostsBought={setPostsBought}
              //       otherPostScore={post2.score}
              //       score={score}
              //       displayScore={displayScore}
              //       setScore={setScore}
              //       scoreDelta={scoreDelta}
              //       setScoreDelta={setScoreDelta}
              //       setZoomPost={setZoomPost}
              //       orientation={"vertical"}
              //     />
              //   </hstack>
              // ) :
              <>
                <hstack
                  width="95%"
                  gap="small"
                  height="15%"
                  alignment="start top"
                  //   maxHeight="80%"
                >
                  <vstack
                    // height="100%"
                    width="60%"
                    // gap="small"
                    alignment="start top"

                    // padding="medium"
                  >
                    <hstack>
                      <vstack grow={true}>
                        <text
                          alignment="start top"
                          style="heading"
                          size={UXConfig.largeFont}
                        >
                          Balance:
                        </text>
                        {postBuy === true && (
                          <>
                            <text
                              alignment="start top"
                              // width="30%"
                              style="heading"
                              size={UXConfig.largeFont}
                              // grow={true}
                            >
                              P/L:
                            </text>
                            <text
                              alignment="start top"
                              // width="30%"
                              style="heading"
                              size={UXConfig.largeFont} // grow={true}
                            >
                              %Δ:
                            </text>
                          </>
                        )}
                      </vstack>
                      <vstack width="20px" />
                      <vstack grow={true}>
                        <text
                          alignment="start top"
                          style="heading"
                          size={UXConfig.largeFont}
                        >
                          {score}
                        </text>
                        {postBuy === true && (
                          <>
                            <text
                              alignment="start top"
                              // width="30%"
                              style="heading"
                              size={UXConfig.largeFont}
                              // grow={true}
                              darkColor={
                                (lastScoreChange ?? 0) > 0
                                  ? UXConfig.darkGreenColor
                                  : UXConfig.darkRedColor
                              }
                              lightColor={
                                (lastScoreChange ?? 0) > 0
                                  ? UXConfig.lightGreenColor
                                  : UXConfig.lightRedColor
                              }
                            >
                              {lastScoreChange > 0 ? "+" : ""}
                              {lastScoreChange ?? 0}
                            </text>
                            <text
                              alignment="start top"
                              // width="30%"
                              style="heading"
                              size={UXConfig.largeFont} // grow={true}
                              darkColor={
                                (lastScoreChange ?? 0) > 0
                                  ? UXConfig.darkGreenColor
                                  : UXConfig.darkRedColor
                              }
                              lightColor={
                                (lastScoreChange ?? 0) > 0
                                  ? UXConfig.lightGreenColor
                                  : UXConfig.lightRedColor
                              }
                            >
                              {lastScoreChange > 0 ? "+" : ""}
                              {Math.floor(
                                (lastScoreChange /
                                  (score - (lastScoreChange ?? 0))) *
                                  100
                              )}
                              %
                            </text>
                          </>
                        )}
                      </vstack>
                    </hstack>
                  </vstack>
                  <hstack
                    alignment="center middle"
                    width="40%"
                    //   maxHeight="80%"
                  >
                    {postBuy === true && (
                      <hstack
                        alignment="center middle"
                        width="100%"
                        gap="small"
                        //   maxHeight="80%"
                      >
                        <button
                          appearance="primary"
                          onPress={handleProceed}
                          width="50%"
                          maxWidth="200px"
                          size={UXConfig.smallButtonSize}
                        >
                          Next
                        </button>
                        {step >= 4 && (
                          <button
                            appearance="success"
                            onPress={handleCashout}
                            width="50%"
                            maxWidth="200px"
                            size={UXConfig.smallButtonSize}
                          >
                            Cashout
                          </button>
                        )}
                      </hstack>
                    )}
                  </hstack>
                </hstack>
                <vstack
                  height="78%"
                  width="100%"
                  gap="medium"
                  alignment="center middle"
                  padding="small"
                >
                  <PostContainer
                    UXConfig={UXConfig}
                    postData={post2}
                    otherPostData={post1}
                    context={context}
                    scoreHistory={scoreHistory}
                    setScoreHistory={setScoreHistory}
                    step={step}
                    setStep={setStep}
                    postsBought={postsBought}
                    setPostsBought={setPostsBought}
                    otherPostScore={post1.score}
                    score={score}
                    setScore={setScore}
                    scoreDelta={scoreDelta}
                    setScoreDelta={setScoreDelta}
                    setZoomPost={setZoomPost}
                    orientation={"horizontal"}
                    postBuy={postBuy}
                    setPostBuy={setPostBuy}
                    lastScoreChange={lastScoreChange}
                    setLastScoreChange={setLastScoreChange}
                  />
                  <PostContainer
                    UXConfig={UXConfig}
                    postData={post1}
                    otherPostData={post2}
                    context={context}
                    scoreHistory={scoreHistory}
                    setScoreHistory={setScoreHistory}
                    step={step}
                    setStep={setStep}
                    postsBought={postsBought}
                    setPostsBought={setPostsBought}
                    otherPostScore={post2.score}
                    score={score}
                    setScore={setScore}
                    scoreDelta={scoreDelta}
                    setScoreDelta={setScoreDelta}
                    setZoomPost={setZoomPost}
                    orientation={"horizontal"}
                    postBuy={postBuy}
                    setPostBuy={setPostBuy}
                    lastScoreChange={lastScoreChange}
                    setLastScoreChange={setLastScoreChange}
                  />
                </vstack>

                {/* <hstack
              width="80%"
              gap="small"
              alignment="center middle"
              //   maxHeight="80%"
            > */}
                {/* {postBuy === true && (
                  <hstack
                    width="50%"
                    gap="small"
                    alignment="center middle"
                    //   maxHeight="80%"
                  >
                    <button
                      appearance="primary"
                      onPress={handleProceed}
                      width="40%"
                      size="small"
                    >
                      Next
                    </button>
                  </hstack>
                )} */}
                {/* </hstack> */}
              </>
            )}
            {/* {subredditData?.imageUrl ? ( */}

            {/* ) : (
          <></>
        )} */}
            {/* <text size="large">{`Click counter: ${counter}`}</text>
        {subredditData ? (
          <text size="small">{`Active users: ${subredditData.numberOfActiveUsers}`}</text>
        ) : (
          <text size="small">Loading subreddit data...</text>
        )}
        <button
          appearance="primary"
          onPress={() => setCounter((counter) => counter + 1)}
        >
          {"this is a question"}
          {counter}
        </button> */}
          </vstack>
        </vstack>
      </>
    );
  }

  if (
    !post1 ||
    !post2 ||
    step * 2 > (generalDataPayload?.currSub?.postData?.length ?? 0)
  ) {
    return (
      <GameOver
        UXConfig={UXConfig}
        context={context}
        currentScore={score ?? 0}
        step={step}
        cashedOut={cashedOut}
        generalDataPayload={generalDataPayload}
        current_score={score}
        scoreHistory={scoreHistory}
        setStep={setStep}
        setScore={setScore}
        setScoreHistory={setScoreHistory}
        isPlayingNewGame={isPlayingNewGame}
        setIsPlayingNewGame={setIsPlayingNewGame}
        setCashedOut={setCashedOut}
        subChosenName={subChosenName}
        optionalGameOverText="Looks like we ran out of posts!"
        currEndGameAlreadyPost={false}

        // scoreBoard={scoreBoard}
      />
    );
  }
  console.log("No condition reached!!!!!!!!");

  return (
    <ErrorMessage
      UXConfig={UXConfig}
      message="Something went wrong... we're working on it."
      setResets={setResets}
    />
  );
}
