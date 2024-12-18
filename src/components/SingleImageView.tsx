import { Devvit, Dispatch, SetStateAction } from "@devvit/public-api";
import { PostData } from "../data/types.js";

type SingleImageViewProps = {
  context: Devvit.Context;
  postData: PostData;
  setZoomPost: Dispatch<SetStateAction<PostData | null>>;
};

export default function SingleImageView(props: SingleImageViewProps) {
  const { postData, setZoomPost } = props;

  const handleBackClick = () => {
    setZoomPost(null);
  };
  // console.log("single image post triggered");

  const dimW = props.context.dimensions?.width ?? -1;
  const dimH = (props.context.dimensions?.height ?? -1) * 0.9;

  const hRatio = dimH / postData.image.image.height;
  const wRatio = dimW / postData.image.image.width;

  let height,
    width = 0;

  console.log("hRatio");
  console.log(hRatio);
  console.log("wRatio");
  console.log(wRatio);

  if (hRatio < wRatio) {
    console.log("hratio is bigger");
    height = dimH;
    width = postData.image.image.width * hRatio;
  } else {
    console.log("wratio is bigger");

    height = postData.image.image.height * wRatio;
    width = dimW;
  }

  console.log("height");
  console.log(height);
  console.log("width");
  console.log(width);

  return (
    <vstack
      height="100%"
      width="100%"
      gap="small"
      alignment="center middle"
      darkBorderColor="#1d2729"
      lightBorderColor="#1d2729"
      cornerRadius="medium"
      // border="thin"
      maxWidth="100%"
      //   maxHeight="80%"
    >
      <button
        appearance="primary"
        onPress={handleBackClick}
        width="25%"
        size="small"
        height="5%"
      >
        Go Back
      </button>
      <vstack
        alignment="center middle"
        cornerRadius="medium"
      >
        <image
          url={postData.image.image.url}
          imageWidth={width * 0.9}
          imageHeight={height * 0.9}
          // height=
          // maxWidth="90%"
          // maxHeight="80%"
          resizeMode="fill"
        />{" "}
      </vstack>
    </vstack>
  );
}
