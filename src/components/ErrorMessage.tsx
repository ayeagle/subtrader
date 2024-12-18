import {
  Devvit,
  Dispatch,
  SetStateAction,
  UseStateHook,
} from "@devvit/public-api";
import { GeneralData, UXConfig } from "../data/types.js";

type ErrorMessageProps = {
  UXConfig: UXConfig;
  message: string;
  setResets: Dispatch<SetStateAction<boolean>>;
};

export default function ErrorMessage(props: ErrorMessageProps) {
  const { UXConfig, message } = props;

  return (
    <vstack height="100%" width="100%" gap="medium" alignment="center middle">
      <icon
        name="error-fill"
        lightColor={UXConfig.lightRedColor}
        darkColor={UXConfig.darkRedColor}
      ></icon>
      <text
        size={UXConfig.largeFont}
        style="heading"
        wrap={true}
        alignment="center middle"
        width="80%"
      >
        {message}
      </text>
      {/* <button onPress={() => props.setResets(true)}>Reload</button> */}
    </vstack>
  );
}
