const axios = require("axios");
const Commit = require("../../domain/entities/Commit");
const config = require("../config/gitlabApp");

class GitLabAPI {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.group = config.group;
    this.token = config.token;
  }

  async listRepos() {
    // Grup altındaki tüm projeleri getir
    const url = `${this.baseUrl}/groups/${this.group}/projects`;
    const res = await axios.get(url, {
      headers: { "PRIVATE-TOKEN": this.token },
    });
    return res.data.map((p) => ({
      id: p.id,
      name: p.name,
      path: p.path,
      full_path: p.path_with_namespace,
    }));
  }

  async getCommits(repo) {
    // repo: {id, name, ...} veya repo adı
    let projectId = repo.id || repo;
    const url = `${this.baseUrl}/projects/${encodeURIComponent(projectId)}/repository/commits?per_page=3`;
    const res = await axios.get(url, {
      headers: { "PRIVATE-TOKEN": this.token },
    });
    return res.data;
  }

  async getCommitDetail(repo, sha) {
    let projectId = repo.id || repo;
    // Commit detayını ve dosyalarını getir
    const url = `${this.baseUrl}/projects/${encodeURIComponent(projectId)}/repository/commits/${sha}`;
    const res = await axios.get(url, {
      headers: { "PRIVATE-TOKEN": this.token },
    });
    // Dosyalar için ayrı bir istek
    const filesUrl = `${this.baseUrl}/projects/${encodeURIComponent(projectId)}/repository/commits/${sha}/diff`;
    const filesRes = await axios.get(filesUrl, {
      headers: { "PRIVATE-TOKEN": this.token },
    });
    return new Commit({
      sha: res.data.id,
      message: res.data.title,
      author: res.data.author_name,
      date: res.data.created_at,
      files: filesRes.data.map(f => ({
        filename: f.new_path,
        old_path: f.old_path,
        new_path: f.new_path,
        diff: f.diff,
        new_file: f.new_file,
        renamed_file: f.renamed_file,
        deleted_file: f.deleted_file,
      })),
      repoName: repo.name || repo,
    });
  }
}

module.exports = GitLabAPI;
