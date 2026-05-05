import type { GeneratedMonster, MonsterGenerationInput } from "../models/monster";

export interface GenerateMonsterRequest {
  input: MonsterGenerationInput;
}

export interface GenerateMonsterResponse {
  monster: GeneratedMonster;
}

export interface ApiErrorResponse {
  error: {
    code: "VALIDATION_ERROR" | "GENERATION_ERROR";
    message: string;
  };
}
