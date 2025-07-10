const fs = require("fs");
const https = require("https");

const GITHUB_TOKEN = process.env.GITHUB_PAT;
const REPO_OWNER = "mwaxman519";
const REPO_NAME = "RishiAppTest";

function makeGitHubRequest(path, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      port: 443,
      path: path,
      method: method,
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Rishi-Platform-Sync",
      },
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers["Content-Type"] = "application/json";
      options.headers["Content-Length"] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function uploadFile(filePath, content) {
  const base64Content = Buffer.from(content).toString("base64");

  // Check if file exists
  try {
    const existingFile = await makeGitHubRequest(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
    );

    // Update existing file
    const updateData = {
      message: `Update ${filePath} - Azure deployment configuration`,
      content: base64Content,
      sha: existingFile.sha,
    };

    return await makeGitHubRequest(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      "PUT",
      updateData,
    );
  } catch (error) {
    // Create new file
    const createData = {
      message: `Create ${filePath} - Azure deployment configuration`,
      content: base64Content,
    };

    return await makeGitHubRequest(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      "PUT",
      createData,
    );
  }
}

async function syncFiles() {
  console.log("Starting GitHub API sync...");

  try {
    // 1. Upload Azure workflow file
    const workflowContent = fs.readFileSync(
      ".github/workflows/azure-static-web-apps-happy-grass-0aaaade10.yml",
      "utf8",
    );
    await uploadFile(
      ".github/workflows/azure-static-web-apps-happy-grass-0aaaade10.yml",
      workflowContent,
    );
    console.log("✅ Uploaded Azure workflow file");

    // 2. Upload Next.js config
    const nextConfigContent = fs.readFileSync("next.config.mjs", "utf8");
    await uploadFile("next.config.mjs", nextConfigContent);
    console.log("✅ Uploaded Next.js configuration");

    // 3. Upload staticwebapp config
    const staticConfigContent = fs.readFileSync(
      "staticwebapp.config.json",
      "utf8",
    );
    await uploadFile("staticwebapp.config.json", staticConfigContent);
    console.log("✅ Uploaded Azure Static Web Apps configuration");

    // 4. Upload API files
    const healthFunctionContent = fs.readFileSync(
      "api/health/function.json",
      "utf8",
    );
    await uploadFile("api/health/function.json", healthFunctionContent);

    const healthIndexContent = fs.readFileSync("api/health/index.js", "utf8");
    await uploadFile("api/health/index.js", healthIndexContent);

    const bookingsFunctionContent = fs.readFileSync(
      "api/bookings/function.json",
      "utf8",
    );
    await uploadFile("api/bookings/function.json", bookingsFunctionContent);

    const bookingsIndexContent = fs.readFileSync(
      "api/bookings/index.js",
      "utf8",
    );
    await uploadFile("api/bookings/index.js", bookingsIndexContent);

    const hostContent = fs.readFileSync("api/host.json", "utf8");
    await uploadFile("api/host.json", hostContent);

    console.log("✅ Uploaded all API functions");

    console.log("\n🎉 GitHub sync completed successfully!");
    console.log("Azure deployment will trigger automatically.");
    console.log(
      "Monitor at: https://github.com/mwaxman519/RishiAppTest/actions",
    );
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    process.exit(1);
  }
}

syncFiles();
