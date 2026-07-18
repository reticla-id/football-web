"use client";

import type { ExplorerPlayer } from "@/app/radar/explorer/components/types";
import type { PlayerSummary } from "@/types/player";

export function normalizeExplorerPlayer(player: PlayerSummary): ExplorerPlayer {
  const age = getAgeFromDateOfBirth(player.date_of_birth);
  const passAccuracyValue = player.pass_accuracy ?? 0;
  const appearances = null;
  const tacklesPer90 =
    appearances && appearances > 0 ? Number((player.tackles / appearances).toFixed(1)) : 0;
  const interceptionsPer90 =
    appearances && appearances > 0
      ? Number((player.interceptions / appearances).toFixed(1))
      : 0;
  const savesPer90 =
    appearances && appearances > 0 ? Number((player.saves / appearances).toFixed(1)) : 0;
  const traits = buildTraits(player);
  const playstyles = buildPlaystyles(player);

  return {
    ...player,
    slug: slugify(player.display_name),
    age,
    heightValue: player.height ?? null,
    appearances,
    positionLabel: player.detailed_position_name?.trim() || "Profile unavailable",
    clubName: player.team_name?.trim() || "Club unavailable",
    clubLogo: player.team_image_path ?? null,
    nationality: player.nationality?.trim() || null,
    country: null,
    league: player.league_name?.trim() || null,
    transferStatus: null,
    passAccuracyValue,
    tacklesPer90,
    interceptionsPer90,
    savesPer90,
    traits,
    playstyles,
  };
}

function buildTraits(player: PlayerSummary) {
  const traits: string[] = [];

  if (player.goals >= 5) {
    traits.push("Finisher");
  }

  if (player.assists >= 4 || (player.pass_accuracy ?? 0) >= 84) {
    traits.push("Creator");
  }

  if (player.tackles_won >= 20 || player.interceptions >= 18) {
    traits.push("Ball Winner");
  }

  if ((player.pass_accuracy ?? 0) >= 88) {
    traits.push("Secure Distributor");
  }

  return traits.length ? traits : ["Unclassified"];
}

function buildPlaystyles(player: PlayerSummary) {
  const playstyles: string[] = [];

  if (player.goals >= 6) {
    playstyles.push("Penalty Box Threat");
  }

  if (player.assists >= 4) {
    playstyles.push("Chance Creator");
  }

  if ((player.pass_accuracy ?? 0) >= 86 && player.passes >= 300) {
    playstyles.push("Possession Controller");
  }

  if (player.tackles >= 18 || player.interceptions >= 16) {
    playstyles.push("Defensive Presser");
  }

  return playstyles.length ? playstyles : ["General Profile"];
}

function getAgeFromDateOfBirth(dateOfBirth: string | null) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
