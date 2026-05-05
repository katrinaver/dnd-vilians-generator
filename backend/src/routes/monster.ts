import { Router } from "express";
import type { Request, Response } from "express";
import type {
  ApiErrorResponse,
  GenerateMonsterRequest,
  GenerateMonsterResponse,
} from "../../../shared/src/contracts/api";
import type { Difficulty, MonsterType } from "../../../shared/src/models/monster";
import { generateMonster } from "../services/monster-generator";

const router = Router();

const isDifficulty = (value: unknown): value is Difficulty => {
  return value === "easy" || value === "medium" || value === "hard" || value === "deadly";
};

const isMonsterType = (value: unknown): value is MonsterType => {
  return value === "brute" || value === "assassin" || value === "caster";
};

router.post(
  "/generate-monster",
  (
    req: Request<unknown, GenerateMonsterResponse | ApiErrorResponse, GenerateMonsterRequest>,
    res: Response<GenerateMonsterResponse | ApiErrorResponse>,
  ) => {
    const input = req.body?.input;

    if (!input || typeof input.partySize !== "number" || !Number.isFinite(input.partySize)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "input.partySize must be a valid number",
        },
      });
    }

    if (input.partySize < 1 || input.partySize > 10) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "partySize must be between 1 and 10",
        },
      });
    }

    if (!isDifficulty(input.difficulty)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "difficulty must be one of: easy, medium, hard, deadly",
        },
      });
    }

    if (!isMonsterType(input.monsterType)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "monsterType must be one of: brute, assassin, caster",
        },
      });
    }

    try {
      const monster = generateMonster(input);
      return res.status(200).json({ monster });
    } catch {
      return res.status(500).json({
        error: {
          code: "GENERATION_ERROR",
          message: "Failed to generate monster",
        },
      });
    }
  },
);

export default router;
