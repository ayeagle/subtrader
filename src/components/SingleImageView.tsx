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
  return (
    <vstack
      height="100%"
      width="100%"
      gap="small"
      alignment="center middle"
      darkBorderColor="#1d2729"
      lightBorderColor="#1d2729"
      cornerRadius="medium"
      border="thin"
      maxWidth="100%"
      //   maxHeight="80%"
    >
      <button
        appearance="primary"
        onPress={handleBackClick}
        width="40%"
        size="small"
      >
        Go Back
      </button>
      <image
        url={postData.image.image.url}
        imageWidth={Math.min(postData.image.image.width, 650)}
        imageHeight={Math.min(postData.image.image.height, 650)}
        // maxWidth="90%"
        // maxHeight="80%"
        resizeMode="fill"
      />
    </vstack>
  );
}
