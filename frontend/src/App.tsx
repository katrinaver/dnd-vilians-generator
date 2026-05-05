import { useMemo, useState } from "react";
import { z } from "zod";
import type {
  GenerateMonsterRequest,
  GenerateMonsterResponse,
  ApiErrorResponse,
} from "../../shared/src/contracts/api";
import type { Difficulty, GeneratedMonster, MonsterType } from "../../shared/src/models/monster";

const difficulties: Difficulty[] = ["easy", "medium", "hard", "deadly"];
const monsterTypes: MonsterType[] = ["brute", "assassin", "caster"];

const formSchema = z.object({
  partySize: z.number().int().min(1, "Party size must be at least 1").max(10, "Party size cannot exceed 10"),
  difficulty: z.enum(["easy", "medium", "hard", "deadly"]),
  monsterType: z.enum(["brute", "assassin", "caster"]),
});

const successSchema = z.object({
  monster: z.object({
    hp: z.number(),
    ac: z.number(),
    attackBonus: z.number(),
    damagePerRound: z.number(),
    specialAbilities: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    ),
    estimatedCr: z.number(),
  }),
});

const errorSchema = z.object({
  error: z.object({
    code: z.enum(["VALIDATION_ERROR", "GENERATION_ERROR"]),
    message: z.string(),
  }),
});

const App = () => {
  const [partySize, setPartySize] = useState(4);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [monsterType, setMonsterType] = useState<MonsterType>("brute");
  const [monster, setMonster] = useState<GeneratedMonster | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => partySize >= 1 && partySize <= 10 && !loading, [partySize, loading]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMonster(null);

    const parsedForm = formSchema.safeParse({ partySize, difficulty, monsterType });
    if (!parsedForm.success) {
      setError(parsedForm.error.issues[0]?.message ?? "Invalid form values.");
      return;
    }

    setLoading(true);

    const payload: GenerateMonsterRequest = {
      input: parsedForm.data,
    };

    try {
      const response = await fetch("/generate-monster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawData: unknown = await response.json();

      if (!response.ok) {
        const parsedError = errorSchema.safeParse(rawData);
        setError(parsedError.success ? parsedError.data.error.message : "Failed to generate monster.");
        return;
      }

      const parsedSuccess = successSchema.safeParse(rawData);
      if (!parsedSuccess.success) {
        setError("Backend response format is invalid.");
        return;
      }

      const data: GenerateMonsterResponse | ApiErrorResponse = parsedSuccess.data;
      setMonster((data as GenerateMonsterResponse).monster);
    } catch {
      setError("Network error. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">D&D 5e Monster Stats Generator</h1>
          <p className="text-sm text-slate-400">
            Generate encounter-ready monster stats based on party size, difficulty, and archetype.
          </p>
        </header>

        <form onSubmit={onSubmit} className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
          <div className="grid gap-5 md:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">Party Size</span>
              <input
                type="number"
                min={1}
                max={10}
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring-2"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring-2"
              >
                {difficulties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">Monster Type</span>
              <select
                value={monsterType}
                onChange={(e) => setMonsterType(e.target.value as MonsterType)}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring-2"
              >
                {monsterTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-900"
          >
            {loading ? "Generating..." : "Generate Monster"}
          </button>
        </form>

        {error ? (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        ) : null}

        {monster ? (
          <section className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold capitalize">{monsterType} Monster</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="HP" value={monster.hp} />
              <Stat label="AC" value={monster.ac} />
              <Stat label="Attack Bonus" value={`+${monster.attackBonus}`} />
              <Stat label="Damage / Round" value={monster.damagePerRound} />
              <Stat label="Estimated CR" value={monster.estimatedCr} />
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Special Abilities</h3>
              <ul className="space-y-2">
                {monster.specialAbilities.map((ability) => (
                  <li key={ability.name} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2">
                    <p className="font-medium text-slate-100">{ability.name}</p>
                    <p className="text-sm text-slate-300">{ability.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <article className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-lg font-semibold text-slate-100">{value}</p>
  </article>
);

export default App;
