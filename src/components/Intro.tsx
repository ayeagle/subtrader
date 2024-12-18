import {
  AsyncError,
  CommentSubmissionOptions,
  Devvit,
  Dispatch,
  EnrichedThumbnail,
  GetHotPostsOptions,
  SetStateAction,
  useAsync,
  useForm,
  useState,
} from "@devvit/public-api";
import { BASE_SCORE } from "../main.js";
import { GeneralData, UXConfig } from "../data/types.js";
import { genCheckIfPlayedToday } from "../pseudo_server/controllers/scoreboard.js";

type IntroProps = {
  context: Devvit.Context;
  UXConfig: UXConfig;
  generalDataPayload: GeneralData | null;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  subChosenName: string;
  setSubChosenName: Dispatch<SetStateAction<string>>;
  subChosenId: string;
  setSubChosenId: Dispatch<SetStateAction<string>>;
  setIsPlayingNewGame: Dispatch<SetStateAction<boolean>>;
};

export default function Intro(props: IntroProps) {
  const submit_post_form = useForm(
    {
      fields: [
        {
          type: "string",
          name: "subreddit_chosen",
          label: "eg funny",
          required: true,
          helpText: "Choose the subreddit you'd like to trade posts from.",
        },
      ],
    },
    (values) => {
      props.setSubChosenName(cleanSubredditName(values["subreddit_chosen"]));
    }
  );

  const invalid_sub_input = useForm(
    {
      fields: [
        {
          type: "string",
          name: "subreddit_chosen",
          label: "eg funny",
          required: true,
          helpText: "Try re-entering the subreddit name or choosing a new one.",
        },
      ],
    },
    (values) => {
      props.setSubChosenName(cleanSubredditName(values["subreddit_chosen"]));
    }
  );

  const already_played_sub_input = useForm(
    {
      fields: [
        {
          type: "string",
          name: "subreddit_chosen",
          label: "eg funny",
          required: true,
          helpText:
            "You've already played for this subreddit today! Try another.",
        },
      ],
    },
    (values) => {
      props.setSubChosenName(cleanSubredditName(values["subreddit_chosen"]));
    }
  );

  const cleanSubredditName = (str?: string): string => {
    return (str ?? "").replace("r/", "");
  };

  const {
    data: sub,
    error: error,
    loading: loading,
  } = useAsync<[string, string] | null>(
    async (): Promise<[string, string] | null> => {
      console.log("subChosen");
      console.log(props.subChosenName);

      if (props.subChosenName !== "") {
        try {
          const sub = await props.context.reddit.getSubredditInfoByName(
            props.subChosenName
          );
          if (sub.name && sub.id) {
            props.setSubChosenName(sub.name);
            props.setSubChosenId(sub.id);
            // props.setIsPlayingNewGame(true)

            const has_already_played_today = await genCheckIfPlayedToday(
              props.context,
              sub.name,
              props.generalDataPayload?.username ?? ""
            );
            // const stuff = props.context.userId
            // const get_user = props.context.reddit.getUserById(props.context.userId ?? )

            console.log("HAVE THEY ALREADY PLAYED")
            console.log(has_already_played_today)
            console.log(props.generalDataPayload?.username)

            if (!has_already_played_today) {
              return [sub.name, sub.id];
            } else {
              props.context.ui.showForm(already_played_sub_input);
            }
          } else {
            props.context.ui.showForm(invalid_sub_input);
          }
        } catch {
          props.context.ui.showForm(invalid_sub_input);
        }
      }
      return null;
    },
    { depends: [props.subChosenName] }
  );

  return (
    <hstack
      height="100%"
      width="80 %"
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
        width={props.UXConfig.maxWidth}
        gap="medium"
        alignment="center middle"
        padding="medium"
      >
        <text
          alignment="center middle"
          width="100%"
          style="heading"
          size={props.UXConfig.largeFont}
          wrap={true}
        >
          Welcome to Subtrader!
        </text>
        {/* <image
          url="trade_graph.png"
          imageHeight="100px"
          imageWidth="200px"
        /> */}
        <vstack>
          <text
            alignment="start middle"
            width="100%"
            style="body"
            wrap={true}
            size={props.UXConfig.smallFont}
          >
            Prove your worth as top reddit post trader. Increase your account's
            value by guessing which post is more popular in your community.
          </text>{" "}
          <spacer />
          <text
            alignment="start middle"
            width="100%"
            style="body"
            wrap={true}
            size={props.UXConfig.smallFont}
          >
            1. The closer two posts are in popularity, the higher the reward 🚀
            for being right.
          </text>
          <spacer />
          <text
            alignment="start middle"
            width="100%"
            style="body"
            wrap={true}
            size={props.UXConfig.smallFont}
          >
            2. The further two posts are in popularity, the greater the loss 🔻
            for being wrong.
          </text>{" "}
          <spacer />
          <text
            alignment="start middle"
            width="100%"
            style="body"
            wrap={true}
            size={props.UXConfig.smallFont}
          >
            3. Play for at least 5 trades, then cash out when you want and brag
            about your earnings.
          </text>{" "}
          <spacer />
          <text
            alignment="center middle"
            width="100%"
            style="body"
            wrap={true}
            size={props.UXConfig.smallFont}
          >
            Posts are updated each day -- Good luck!
          </text>
        </vstack>
        {!sub ? (
          <button
            onPress={() => {
              props.context.ui.showForm(submit_post_form);
            }}
            size={props.UXConfig.largeButtonSize}
            appearance="primary"
          >
            Choose subreddit
          </button>
        ) : (
          <button
            onPress={() => {
              props.setSubChosenName(sub[0]);
              props.setSubChosenId(sub[1]);
              props.setStep(props.step + 1);
            }}
            size={props.UXConfig.largeButtonSize}
            appearance="primary"
          >
            Start trading
          </button>
        )}
      </vstack>
    </hstack>
  );
}
