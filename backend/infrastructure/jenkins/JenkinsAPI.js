const axios = require('axios');

const fetchJenkinsDeployments = async () => {
  const JENKINS_URL = 'http://129.1.5.29:8080/jenkins/job/V4-Prod-Environment/view/00-Server_Operations/job/V4-Prod-Scheduled-Deployment/api/json?pretty=true';

  const username = process.env.JENKINS_USER;
  const token = process.env.JENKINS_TOKEN;

  const authHeader = 'Basic ' + Buffer.from(`${username}:${token}`).toString('base64');

  try {
    const response = await axios.get(JENKINS_URL, {
      headers: {
        Authorization: authHeader,
      },
    });

    return response.data; // ✔️ Doğru yer
  } catch (err) {
    console.error("❌ Jenkins API isteği hatası:", err.message);
    if (err.response?.data) {
      console.error("🧾 Gelen veri:", err.response.data); // debug amaçlı
    }
    throw new Error("Jenkins verisi alınamadı.");
  }
};
const fetchJenkinsBuildDetail = async (number) => {
  const JENKINS_URL = `http://129.1.5.29:8080/jenkins/job/V4-Prod-Environment/view/00-Server_Operations/job/V4-Prod-Scheduled-Deployment/${number}/api/json?pretty=true`;
  const username = process.env.JENKINS_USER;
  const token = process.env.JENKINS_TOKEN;
  const authHeader = 'Basic ' + Buffer.from(`${username}:${token}`).toString('base64');
  try {
    const response = await axios.get(JENKINS_URL, {
      headers: {
        Authorization: authHeader,
      },
    });
    return response.data;
  } catch (err) {
    throw new Error("Build detayı alınamadı.");
  }
};

module.exports = {
  fetchJenkinsDeployments,
  fetchJenkinsBuildDetail,
};