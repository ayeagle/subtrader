import { BlockElement, Devvit } from "@devvit/public-api";

type OrientationFormatterProps = {
  context: Devvit.Context;
  children: JSX.Children;
};

export default function OrientationFormatter(props: OrientationFormatterProps) {
  const screen_width = props.context.dimensions?.width ?? 0;

  if (screen_width > 300) {
    // console.log("Using horizontal stack");
    return (
      <hstack
        height="80%"
        width="100%"
        gap="medium"
        alignment="center middle"
        padding="small"
      >
        {props.children}
      </hstack>
    );
  } else {
    // console.log("Using vertical stack");
    return (
      <vstack
        height="80%"
        width="100%"
        gap="medium"
        alignment="center middle"
        padding="small"
      >
        {props.children}
      </vstack>
    );
  }
}
