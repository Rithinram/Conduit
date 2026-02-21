const express = require("express");
const router = express.Router();
const { PythonShell } = require("python-shell");
const path = require("path");

const SCRIPTS_DIR = path.join(__dirname, "../conduit-ml");

/**
 * Perform ML Prediction using Python script
 * @param {string} task - 'urgency' or 'load'
 * @param {object} payload - Input features
 */
const runInference = (task, payload) => {
    return new Promise((resolve, reject) => {
        const options = {
            mode: 'json',
            pythonPath: 'python',
            pythonOptions: ['-u'],
            scriptPath: SCRIPTS_DIR,
        };

        const pyshell = new PythonShell('inference.py', options);
        let response = null;

        pyshell.send({ task, payload });

        pyshell.on('message', (message) => {
            response = message;
        });

        pyshell.end((err) => {
            if (err) reject(err);
            resolve(response);
        });
    });
};

router.post("/urgency", async (req, res) => {
    try {
        const result = await runInference('urgency', req.body);
        res.json(result);
    } catch (err) {
        console.error("[ML-Urgency] Error:", err);
        res.status(500).json({ error: "ML Inference Failed", details: err.message });
    }
});

router.post("/load", async (req, res) => {
    try {
        const result = await runInference('load', req.body);
        res.json(result);
    } catch (err) {
        console.error("[ML-Load] Error:", err);
        res.status(500).json({ error: "ML Inference Failed", details: err.message });
    }
});

router.post("/forecast", async (req, res) => {
    try {
        console.log("[ML-Forecast] Request received:", req.body);
        const result = await runInference('forecast', req.body);
        res.json(result);
    } catch (err) {
        console.error("[ML-Forecast] Error:", err);
        res.status(500).json({ error: "ML Inference Failed", details: err.message });
    }
});

router.post("/resource-forecast", async (req, res) => {
    try {

        const result = await runInference('resource_exhaustion', req.body);
        res.json(result);
    } catch (err) {
        console.error("[ML-Resource] Error:", err);
        res.status(500).json({ error: "ML Inference Failed", details: err.message });
    }
});

router.post("/network-stress", async (req, res) => {
    try {
        const result = await runInference('network_stress', req.body);
        res.json(result);
    } catch (err) {
        console.error("[ML-Stress] Error:", err);
        res.status(500).json({ error: "ML Inference Failed", details: err.message });
    }
});

router.post("/realloc-proposals", async (req, res) => {
    try {
        const result = await runInference('realloc_proposals', req.body);
        res.json(result);
    } catch (err) {
        console.error("[ML-Realloc] Error:", err);
        res.status(500).json({ error: "ML Inference Failed", details: err.message });
    }
});


module.exports = router;
module.exports.runInference = runInference;
