class GitHubRepoInterface {
  async listRepos() {
    throw new Error("Not implemented");
  }

  async getCommits(repoName) {
    throw new Error("Not implemented");
  }

  async getCommitDetail(repoName, sha) {
    throw new Error("Not implemented");
  }
}

module.exports = GitHubRepoInterface;
