import cors from 'cors';
import express from 'express';
import { getDashboard, getDeployments, getIncidents, getModels } from './data';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, mode: 'demo' });
});

app.get('/dashboard', (_req, res) => {
  res.json(getDashboard());
});

app.get('/models', (_req, res) => {
  res.json(getModels());
});

app.get('/incidents', (_req, res) => {
  res.json(getIncidents());
});

app.get('/deployments', (_req, res) => {
  res.json(getDeployments());
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`PulseML API listening on http://localhost:${port}`);
});
