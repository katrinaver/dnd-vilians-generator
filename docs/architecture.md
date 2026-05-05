# D&D 5e Monster Stats Generator - Step 1 Architecture

## Folder Structure

```txt
.
├── backend/
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── index.ts
├── frontend/
│   └── src/
│       ├── components/
│       └── lib/
├── shared/
│   └── src/
│       ├── contracts/
│       └── models/
└── docs/
```

## API Contract

### Endpoint

- `POST /generate-monster`

### Request Body

```json
{
  "input": {
    "partySize": 4,
    "difficulty": "medium",
    "monsterType": "brute"
  }
}
```

### Success Response

```json
{
  "monster": {
    "hp": 85,
    "ac": 14,
    "attackBonus": 6,
    "damagePerRound": 27,
    "specialAbilities": [
      {
        "name": "Crushing Blow",
        "description": "Once per turn, deals extra damage on melee hit."
      }
    ],
    "estimatedCr": 4
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "partySize must be between 1 and 10"
  }
}
```

## Data Models

Defined in `shared/src/models/monster.ts`:

- `Difficulty`: `easy | medium | hard | deadly`
- `MonsterType`: `brute | assassin | caster`
- `MonsterGenerationInput`
- `SpecialAbility`
- `GeneratedMonster`
