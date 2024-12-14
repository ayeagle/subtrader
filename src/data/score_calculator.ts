import { BASE_SCORE } from "../main.js";
import { PostData, ScoreHistoryItem } from "./types.js";

export const getScoreModifier = (
  selected_score: number,
  other_score: number
): number => {
  const score_diff = selected_score - other_score;
  const score_ratio = selected_score / other_score;
  const max_score = Math.max(selected_score, other_score);
  const score_scale = score_diff / max_score;

  let modifier = 1;

  // console.log("SCORE MODIFIER STUFF");
  // console.log("score_diff : ", score_diff);
  // console.log("score_ratio : ", score_ratio);
  // console.log("max_score : ", max_score);
  // console.log("score_scale : ", score_scale);
  console.log("score_diff");
  console.log(score_diff);
  if (score_diff > 0) {
    // winning choice
    if (score_scale > 0.5) {
      // large score diff, small reward
      modifier = 1.1;
    } else if (score_scale > 0.3) {
      // small score diff, large reward
      modifier = 1.25;
    } else if (score_scale > 0.1) {
      modifier = 1.5;
    } else if (score_scale > 0.05) {
      modifier = 2;
    } else {
      modifier = 3;
    }
  } else {
    // losing choice
    if (score_scale > 0.5) {
      // large score diff, large subtraction
      modifier = 0.3;
    } else if (score_scale > 0.3) {
      // small score diff, small subtraction
      modifier = 0.5;
    } else if (score_scale > 0.1) {
      modifier = 0.75;
    } else if (score_scale > 0.05) {
      modifier = 0.9;
    } else {
      modifier = 1;
    }
  }
  // console.log("modifier : ", modifier);
  return modifier;
};

export const add_new_and_calculate_score = (
  new_selected: PostData,
  new_other: PostData,
  scoreHistory: ScoreHistoryItem[]
): ScoreHistoryItem => {
  const score_history_copy = [...scoreHistory];

  const last_score_update = score_history_copy.pop();

  //   const result = score_history_copy.reduce((acc, item) => {
  //     const modifier = getScoreModifier(item.selected.score, item.other.score);

  //     const score_ratio = item.selected.score / item.other.score;
  //     return acc * score_ratio * modifier;
  //   }, BASE_SCORE);
  const result = scoreHistory.reduce(
    (acc, item) => acc + item.scoreChangeValue,
    BASE_SCORE
  );

  const modifier = getScoreModifier(new_selected.score, new_other.score);

  const ratio = new_selected.score / new_other.score;

  let capped_ratio = 0;
  if (ratio < 1) {
    capped_ratio = Math.max(0.33, modifier * ratio);
  } else {
    capped_ratio = Math.min(3, modifier * ratio);
  }

  const last_score_change = capped_ratio * result - result;
  console.log("cum result : ", last_score_change);
  console.log("capped_ratio : ", capped_ratio);
  console.log("modifier : ", modifier);
  console.log("ratio : ", ratio);
  console.log("result : ", result);
  console.log("score - score : ", new_selected.score - new_other.score);
  console.log("result calcd : ", modifier * ratio * result);

  // console.log("score change : ", last_score_change);

  let bounded_score_change = 0;
  if (new_selected.score - new_other.score > 0) {
    console.log("positive score change");
    bounded_score_change = Math.max(last_score_change, 1);
  } else {
    console.log("negative score change");
    console.log(last_score_change);
    console.log(Math.min(last_score_change, -1));
    bounded_score_change = Math.min(last_score_change, -1);
  }

  const new_score_history_item: ScoreHistoryItem = {
    selected: new_selected,
    other: new_other,
    scoreChangeValue: Math.floor(bounded_score_change),
    cumScore: Math.floor(result + bounded_score_change),
  };
  // console.log("old_score_history");
  // console.log(scoreHistory);
  // console.log("new_score_history");
  // console.log(new_score_history_item);
  // console.log("new_score_history", [...scoreHistory, new_score_history_item]);

  return new_score_history_item;
};
