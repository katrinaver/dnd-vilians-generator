import type {
  Difficulty,
  GeneratedMonster,
  MonsterGenerationInput,
  MonsterType,
  SpecialAbility,
} from "../../../shared/src/models/monster";

const difficultyMultiplier: Record<Difficulty, number> = {
  easy: 0.8,
  medium: 1,
  hard: 1.25,
  deadly: 1.6,
};

const typeModifiers: Record<
  MonsterType,
  { hp: number; ac: number; attackBonus: number; damagePerRound: number }
> = {
  brute: { hp: 1.3, ac: 0.9, attackBonus: 1, damagePerRound: 1.2 },
  assassin: { hp: 0.75, ac: 1, attackBonus: 1.2, damagePerRound: 1.45 },
  caster: { hp: 0.8, ac: 0.95, attackBonus: 1.1, damagePerRound: 1.1 },
};

const typeAbilities: Record<MonsterType, SpecialAbility[]> = {
  brute: [
    {
      name: "Crushing Blow",
      description: "Once per turn, deals +1d8 extra melee damage on a hit.",
    },
    {
      name: "Relentless Bulk",
      description: "Has advantage on checks against being shoved or knocked prone.",
    },
  ],
  assassin: [
    {
      name: "Sneak Strike",
      description: "Deals +2d6 damage against a target that has not acted yet.",
    },
    {
      name: "Evasive Step",
      description: "Can take Disengage as a bonus action each round.",
    },
  ],
  caster: [
    {
      name: "Arcane Burst",
      description: "Ranged spell attack with force damage instead of weapon damage.",
    },
    {
      name: "Control Spell",
      description: "Once per encounter, forces a Wisdom save or target is restrained until end of next turn.",
    },
  ],
};

const round = (value: number): number => Math.max(1, Math.round(value));

export const generateMonster = (input: MonsterGenerationInput): GeneratedMonster => {
  const targetCrByDifficulty: Record<Difficulty, number> = {
    easy: input.partySize * 0.5,
    medium: input.partySize * 0.75,
    hard: input.partySize,
    deadly: input.partySize * 1.25,
  };

  const targetCr = Math.max(0.125, Math.min(20, targetCrByDifficulty[input.difficulty]));

  const baseHp = 15 + targetCr * 22;
  const baseAc = 13 + Math.floor(targetCr / 4);
  const baseAttackBonus = 3 + Math.floor((targetCr + 1) / 3);
  const baseDamagePerRound = 6 + targetCr * 6;

  const archetypeAdjusted = {
    brute: {
      hp: baseHp * 1.35,
      ac: baseAc - 1,
      attackBonus: baseAttackBonus,
      damagePerRound: baseDamagePerRound * 1.15,
    },
    assassin: {
      hp: baseHp * 0.7,
      ac: baseAc,
      attackBonus: baseAttackBonus + 1,
      damagePerRound: baseDamagePerRound * 1.35,
    },
    caster: {
      hp: baseHp * 0.8,
      ac: baseAc - 1,
      attackBonus: baseAttackBonus,
      damagePerRound: baseDamagePerRound * 0.95,
    },
  }[input.monsterType];

  const hp = round(archetypeAdjusted.hp);
  const ac = round(archetypeAdjusted.ac);
  const attackBonus = round(archetypeAdjusted.attackBonus);
  const damagePerRound = round(archetypeAdjusted.damagePerRound);

  const defensiveCr = Math.max(0.125, (hp - 15) / 22 + (ac - 13) * 0.5);
  const casterControlBonus = input.monsterType === "caster" ? 0.5 : 0;
  const offensiveCr = Math.max(
    0.125,
    (damagePerRound - 6) / 6 + (attackBonus - 3) * 0.75 + casterControlBonus,
  );
  const estimatedCr = Number((((defensiveCr + offensiveCr) / 2) * difficultyMultiplier[input.difficulty]).toFixed(2));

  return {
    hp,
    ac,
    attackBonus,
    damagePerRound,
    specialAbilities: typeAbilities[input.monsterType],
    estimatedCr,
  };
};
