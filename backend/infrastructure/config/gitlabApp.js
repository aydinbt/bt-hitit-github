// gitlabApp config
module.exports = {
  baseUrl: "https://gitlab.com/api/v4",
  group: "aydinbt-group", // GitLab Group adı
  token: process.env.GITLAB_CLIENT_SECRET_TOKEN, // .env'den alınacak
};
