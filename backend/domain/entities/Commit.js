
class Commit {
  constructor({ sha, message, author, date, files = [], repoName }) {
    this.sha = sha;
    this.message = message;
    this.author = author;
    this.date = date;
    this.files = files;
    this.repoName = repoName;
  }
}

module.exports = Commit;
