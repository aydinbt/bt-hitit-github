class GetRepoCommits {
  constructor(githubRepo) {
    this.githubRepo = githubRepo;
  }

  async execute() {
    const repos = await this.githubRepo.listRepos();
    console.log("[GetRepoCommits] repo names:", repos.map(r => r.name));
    const allCommits = [];

    for (const repo of repos) {
      const commits = await this.githubRepo.getCommits(repo.name);

      for (const c of commits) {
        const detail = await this.githubRepo.getCommitDetail(repo.name, c.sha);
        allCommits.push(detail);
      }
    }

    return allCommits;
  }
}

module.exports = GetRepoCommits;
