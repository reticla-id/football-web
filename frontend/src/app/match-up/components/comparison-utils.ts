"use client";

export type ComparisonWinner = "A" | "B" | "Draw";
export type ComparisonDirection = "higher" | "lower";
export type ComparisonTone = "winner" | "neutral";

type CompareValuesOptions<TValue> = {
  playerAValue: TValue | null | undefined;
  playerBValue: TValue | null | undefined;
  formatter?: (value: TValue | null | undefined) => string;
  comparisonDirection?: ComparisonDirection;
};

export type ComparisonResult = {
  winner: ComparisonWinner;
  playerAState: ComparisonTone;
  playerBState: ComparisonTone;
  playerADisplayValue: string;
  playerBDisplayValue: string;
  shouldShowIndicators: boolean;
};

export function comparePlayerValues<TValue extends number | string>({
  playerAValue,
  playerBValue,
  formatter,
  comparisonDirection = "higher",
}: CompareValuesOptions<TValue>): ComparisonResult {
  const playerADisplayValue = formatComparisonValue(playerAValue, formatter);
  const playerBDisplayValue = formatComparisonValue(playerBValue, formatter);

  const comparablePlayerAValue = getComparableValue(playerAValue);
  const comparablePlayerBValue = getComparableValue(playerBValue);

  if (comparablePlayerAValue == null || comparablePlayerBValue == null) {
    return {
      winner: "Draw",
      playerAState: "neutral",
      playerBState: "neutral",
      playerADisplayValue,
      playerBDisplayValue,
      shouldShowIndicators: false,
    };
  }

  if (comparablePlayerAValue === comparablePlayerBValue) {
    return {
      winner: "Draw",
      playerAState: "neutral",
      playerBState: "neutral",
      playerADisplayValue,
      playerBDisplayValue,
      shouldShowIndicators: false,
    };
  }

  const playerAIsBetter =
    comparisonDirection === "higher"
      ? comparablePlayerAValue > comparablePlayerBValue
      : comparablePlayerAValue < comparablePlayerBValue;

  return {
    winner: playerAIsBetter ? "A" : "B",
    playerAState: playerAIsBetter ? "winner" : "neutral",
    playerBState: playerAIsBetter ? "neutral" : "winner",
    playerADisplayValue,
    playerBDisplayValue,
    shouldShowIndicators: true,
  };
}

function formatComparisonValue<TValue extends number | string>(
  value: TValue | null | undefined,
  formatter?: (value: TValue | null | undefined) => string
) {
  if (formatter) {
    return formatter(value);
  }

  if (value == null || value === "") {
    return "-";
  }

  return String(value);
}

function getComparableValue(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue || normalizedValue === "-") {
      return null;
    }

    const numericValue = Number(normalizedValue.replace(/[^\d.-]/g, ""));
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  return null;
}
