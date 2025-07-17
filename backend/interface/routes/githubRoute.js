const express = require("express");
const router = express.Router();

const GitHubAPI = require("../../infrastructure/github/GitHubAPI");
const GetRepoCommits = require("../../application/usecases/GetRepoCommits");

router.get("/commits", async (req, res) => {
  try {
    const github = new GitHubAPI();
    const usecase = new GetRepoCommits(github);
    const commits = await usecase.execute();

    res.json(commits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Commit verileri alınamadı" });
  }
});

module.exports = router;
