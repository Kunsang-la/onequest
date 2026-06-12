export const calculateProgression = (totalXp) => {
  let level = 1;
  let xpForNextLevel = 100;
  let currentLevelXp = totalXp || 0;

  // Every level requires 50% more XP than the previous level
  while (currentLevelXp >= xpForNextLevel) {
    currentLevelXp -= xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(xpForNextLevel * 1.5);
  }

  let rank = '🌱 New Arrival';
  if (level >= 11) rank = '🎒 Traveler';
  if (level >= 21) rank = '⚔ Adventurer';
  if (level >= 31) rank = '🗺 Pathfinder';
  if (level >= 41) rank = '🌿 Wayfarer';
  if (level >= 51) rank = '🏹 Guild Scout';
  if (level >= 61) rank = '🦅 Trailblazer';
  if (level >= 71) rank = '🌄 Journeymaster';
  if (level >= 81) rank = '⭐ Guild Champion';
  if (level >= 91) rank = '👑 OneQuest Legend';

  return {
    level,
    currentXp: currentLevelXp,
    requiredXp: xpForNextLevel,
    rank
  };
};
