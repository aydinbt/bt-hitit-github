const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const githubRoutes = require("./interface/routes/githubRoute");
const gitlabRoutes = require("./interface/routes/gitlabRoute");
const jenkinsRoute = require("./interface/routes/jenkinsRoute");


cors({
  origin: ["http://localhost:3000", "http://128.8.0.47:8080"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.use(cors());
app.use("/api", githubRoutes);
app.use("/api/gitlab", gitlabRoutes);
app.use("/api/jenkins", jenkinsRoute);


const axios = require('axios');
// ServiceNow proxy endpoint (CORS sorunsuz)
app.get("/api/proxy/servicenow", async (req, res) => {
  try {
    const { uri } = req.query;
    if (!uri) return res.status(400).json({ error: "uri parametresi gerekli" });
    const url = `http://128.8.0.47:8080/decode/servicenow?&uri=${encodeURIComponent(uri)}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
