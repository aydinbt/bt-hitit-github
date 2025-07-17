const axios = require("axios");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Commit = require("../../domain/entities/Commit");

require("dotenv").config();

class GitHubAPI {
  constructor() {
    this.appId = process.env.GITHUB_APP_ID;
    this.privateKey = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY, "utf8");
    this.baseUrl = "https://api.github.com";
  }

  generateJWT() {
    return jwt.sign(
      {
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600,
        iss: this.appId,
      },
      this.privateKey,
      { algorithm: "RS256" }
    );
  }

  async getAccessToken() {
    const jwtToken = this.generateJWT();

    const installs = await axios.get(`${this.baseUrl}/app/installations`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const installation = installs.data[0];
    const installationId = installation.id;
    this.accountLogin = installation.account.login;
    this.accountType = installation.account.type; // 'Organization' veya 'User'

    const tokenRes = await axios.post(
      `${this.baseUrl}/app/installations/${installationId}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    this.token = tokenRes.data.token;
  }

  async listRepos() {
    if (!this.token) await this.getAccessToken();

    let url;
    if (this.accountType === "Organization") {
      url = `${this.baseUrl}/orgs/${this.accountLogin}/repos`;
    } else {
      url = `${this.baseUrl}/users/${this.accountLogin}/repos`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    return res.data;
  }

  async getCommits(repo) {
    if (!this.token) await this.getAccessToken();
    const res = await axios.get(
      `${this.baseUrl}/repos/${this.accountLogin}/${repo}/commits?per_page=3`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return res.data;
  }

  async getCommitDetail(repo, sha) {
    if (!this.token) await this.getAccessToken();
    const res = await axios.get(
      `${this.baseUrl}/repos/${this.accountLogin}/${repo}/commits/${sha}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );

    const c = res.data;
    return new Commit({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
      files: c.files.map((f) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
      })),
      repoName: repo,
    });
  }
}

module.exports = GitHubAPI;
