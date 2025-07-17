const express = require("express");
require("dotenv").config();

const githubRoutes = require("./interface/routes/githubRoute");

const app = express();
app.use("/api", githubRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
