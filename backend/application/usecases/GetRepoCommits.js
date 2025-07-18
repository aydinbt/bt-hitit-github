
class GetRepoCommits {
  constructor(repoApi) {
    this.repoApi = repoApi;
  }

  async execute() {
    const repos = await this.repoApi.listRepos();
    console.log("[GetRepoCommits] repo names:", repos.map(r => r.name));
    const allCommits = [];

    for (const repo of repos) {
      const commits = await this.repoApi.getCommits(repo);
      for (const c of commits) {
        const detail = await this.repoApi.getCommitDetail(repo, c.id || c.sha);
        allCommits.push(detail);
      }
    }

    return allCommits;
  }
}

module.exports = GetRepoCommits;
