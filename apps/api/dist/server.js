"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const data_1 = require("./data");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ ok: true, mode: 'demo' });
});
app.get('/dashboard', (_req, res) => {
    res.json((0, data_1.getDashboard)());
});
app.get('/models', (_req, res) => {
    res.json((0, data_1.getModels)());
});
app.get('/incidents', (_req, res) => {
    res.json((0, data_1.getIncidents)());
});
app.get('/deployments', (_req, res) => {
    res.json((0, data_1.getDeployments)());
});
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    console.log(`PulseML API listening on http://localhost:${port}`);
});
