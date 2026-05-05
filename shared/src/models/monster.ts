export type Difficulty = "easy" | "medium" | "hard" | "deadly";

export type MonsterType = "brute" | "assassin" | "caster";

export interface MonsterGenerationInput {
  partySize: number;
  difficulty: Difficulty;
  monsterType: MonsterType;
}

export interface SpecialAbility {
  name: string;
  description: string;
}

export interface GeneratedMonster {
  hp: number;
  ac: number;
  attackBonus: number;
  damagePerRound: number;
  specialAbilities: SpecialAbility[];
  estimatedCr: number;
}
