const express = require('express');
const router = express.Router();
const {
  fetchJenkinsDeployments,
  fetchJenkinsBuildDetail,
} = require("../../infrastructure/jenkins/JenkinsAPI");
require("dotenv").config();

router.get("/", async (req, res) => {
  try {
    const data = await fetchJenkinsDeployments();
    res.json(data);
  } catch (error) {
    console.error("Jenkins API hatası:", error.message);
    res.status(500).json({ error: "Jenkins bağlantı hatası" });
  }
});

module.exports = router;

// Build detay endpointi
router.get('/:number/api/json', async (req, res) => {
  const { number } = req.params;
  try {
    const data = await fetchJenkinsBuildDetail(number);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Build detayı alınamadı" });
  }
});
