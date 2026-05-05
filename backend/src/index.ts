import express from "express";
import monsterRouter from "./routes/monster";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/", monsterRouter);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
