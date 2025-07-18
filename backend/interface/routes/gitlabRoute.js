const express = require("express");
const router = express.Router();

const GitLabAPI = require("../../infrastructure/gitlab/GitLabAPI");
const GetRepoCommits = require("../../application/usecases/GetRepoCommits");


// Pagination ve filtre desteği
router.get("/commits", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const filter = req.query.filter ? req.query.filter.toLowerCase() : null;

    const gitlab = new GitLabAPI();
    const usecase = new GetRepoCommits(gitlab);
    const allCommits = await usecase.execute();

    // Filtre uygula
    let filtered = allCommits;
    if (filter) {
      filtered = allCommits.filter(c =>
        (c.author && c.author.toLowerCase().includes(filter)) ||
        (c.repoName && c.repoName.toLowerCase().includes(filter)) ||
        (c.message && c.message.toLowerCase().includes(filter))
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    res.json({ items, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Commit verileri alınamadı" });
  }
});

module.exports = router;
