import type {
  ExplorerPlayer,
  ExplorerSortColumn,
  ExplorerSortState,
} from "./types";

export function sortExplorerPlayers(
  players: ExplorerPlayer[],
  sortState: ExplorerSortState
) {
  if (!sortState.column || !sortState.direction) {
    return players;
  }

  const column = sortState.column;
  const directionFactor = sortState.direction === "asc" ? 1 : -1;

  return [...players].sort((left, right) => {
    const leftValue = getSortableValue(left, column);
    const rightValue = getSortableValue(right, column);

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * directionFactor;
    }

    return String(leftValue).localeCompare(String(rightValue)) * directionFactor;
  });
}

function getSortableValue(player: ExplorerPlayer, column: ExplorerSortColumn) {
  switch (column) {
    case "display_name":
      return player.display_name.toLowerCase();
    case "age":
      return player.age ?? Number.POSITIVE_INFINITY;
    case "height":
      return player.heightValue ?? Number.POSITIVE_INFINITY;
    case "prefer_foot":
      return (player.prefer_foot ?? "").toLowerCase();
    case "appearances":
      return player.appearances ?? Number.NEGATIVE_INFINITY;
    case "goals":
      return player.goals;
    case "assists":
      return player.assists;
  }
}
