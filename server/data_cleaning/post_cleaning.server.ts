import { EnrichedThumbnail, Post } from "@devvit/public-api";
import { PostData } from "../../src/data/types.js";

export function getPostDataFromPostAndThumbnail(
  post: Post,
  thumbnail: EnrichedThumbnail | undefined
): PostData | null {
  if (thumbnail) {
    return {
      id: post.id,
      title: post.title,
      score: post.score,
      image: thumbnail,
      // OEmbed: post.secureMedia?.oembed,
      // body: post.body,
      // permalink: post.permalink,
      // bodyHtml: post.bodyHtml,
      // thumbnailUrl: post.thumbnail?.url,
    };
  }

  return null;
}
