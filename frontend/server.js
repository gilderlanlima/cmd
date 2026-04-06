const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const buildPath = path.join(__dirname, "build");
const indexPath = path.join(buildPath, "index.html");

app.use(express.static(buildPath));

// SPA fallback sem padrão de rota frágil entre versões do express/path-to-regexp.
app.use((req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(indexPath);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
