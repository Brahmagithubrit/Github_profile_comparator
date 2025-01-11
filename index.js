const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
const app = express();

const token = process.env.auth;
const port = 5000 || process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>GitHub Profile Comparison</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background-color: #f4f4f9;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          background: #fff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .rough {
          font-family: "Courier New", Courier, monospace;
          font-weight: bold;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          animation: typing 2s steps(30, end), blink-caret 0.5s step-end infinite;
          border-right: 2px solid #333;
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: #333; }
        }
        .chat-box {
          border: 1px solid #ccc;
          padding: 10px;
          margin: 20px 0;
          max-width: 100%;
          background-color: #fafafa;
          border-radius: 5px;
        }
        .message {
          margin: 10px 0;
        }
        .user {
          font-weight: bold;
          color: #007bff;
        }
        .chatgpt {
          font-weight: bold;
          color: #28a745;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
        }
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background-color: #007bff;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="rough">GitHub Profile Comparison Tool</div>
        <form action="/compare" method="POST">
          <input type="text" name="name" placeholder="Profile name" required />
          <input type="text" name="comparator" placeholder="Comparator profile name" required />
          <button type="submit">Compare</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

app.post("/compare", async (req, res) => {
  const name = req.body.name;
  const comparator = req.body.comparator;

  try {
    const [user1, user2] = await Promise.all([
      axios.get(`https://api.github.com/users/${name}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`https://api.github.com/users/${comparator}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [repos1, repos2] = await Promise.all([
      axios.get(`https://api.github.com/users/${name}/repos`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`https://api.github.com/users/${comparator}/repos`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const user1Data = user1.data;
    const user2Data = user2.data;

    const user1Repos = repos1.data;
    const user2Repos = repos2.data;

    const user1Languages = await Promise.all(
      user1Repos.map((repo) =>
        axios.get(
          `https://api.github.com/repos/${name}/${repo.name}/languages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      )
    );

    const user2Languages = await Promise.all(
      user2Repos.map((repo) =>
        axios.get(
          `https://api.github.com/repos/${comparator}/${repo.name}/languages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      )
    );

    const user1LanguageList = user1Languages
      .map((lang) => Object.keys(lang.data))
      .flat();
    const user2LanguageList = user2Languages
      .map((lang) => Object.keys(lang.data))
      .flat();

    const uniqueUser1Languages = [...new Set(user1LanguageList)];
    const uniqueUser2Languages = [...new Set(user2LanguageList)];

    const newLanguagesUser2 = uniqueUser2Languages.filter(
      (lang) => !uniqueUser1Languages.includes(lang)
    );
    const newLanguagesUser1 = uniqueUser1Languages.filter(
      (lang) => !uniqueUser2Languages.includes(lang)
    );

    const user1Projects = user1Repos.map((repo) => repo.name).join(", ");
    const user2Projects = user2Repos.map((repo) => repo.name).join(", ");

    const user1Contributions = user1Repos.reduce(
      (acc, repo) => acc + repo.stargazers_count + repo.forks_count,
      0
    );
    const user2Contributions = user2Repos.reduce(
      (acc, repo) => acc + repo.stargazers_count + repo.forks_count,
      0
    );

    const comparisonTable = `
      <table border="1">
        <tr>
          <th>Aspect</th>
          <th>${user1Data.name}</th>
          <th>${user2Data.name}</th>
        </tr>
        <tr>
          <td>Total Repositories</td>
          <td>${user1Repos.length}</td>
          <td>${user2Repos.length}</td>
        </tr>
        <tr>
          <td>Most Used Languages</td>
          <td>${uniqueUser1Languages.join(", ")}</td>
          <td>${uniqueUser2Languages.join(", ")}</td>
        </tr>
        <tr>
          <td>New Languages (User 2)</td>
          <td>${newLanguagesUser1.join(", ") || "None"}</td>
          <td>${newLanguagesUser2.join(", ") || "None"}</td>
        </tr>
        <tr>
          <td>Total Followers</td>
          <td>${user1Data.followers}</td>
          <td>${user2Data.followers}</td>
        </tr>
        <tr>
          <td>Total Following</td>
          <td>${user1Data.following}</td>
          <td>${user2Data.following}</td>
        </tr>
        <tr>
          <td>Public Gists</td>
          <td>${user1Data.public_gists}</td>
          <td>${user2Data.public_gists}</td>
        </tr>
        <tr>
          <td>Public Repositories</td>
          <td>${user1Data.public_repos}</td>
          <td>${user2Data.public_repos}</td>
        </tr>
        <tr>
          <td>Biography</td>
          <td>${user1Data.bio || "No bio available"}</td>
          <td>${user2Data.bio || "No bio available"}</td>
        </tr>
        <tr>
          <td>Projects</td>
          <td>${user1Projects || "No projects available"}</td>
          <td>${user2Projects || "No projects available"}</td>
        </tr>
        <tr>
          <td>Total Contributions (Stars + Forks)</td>
          <td>${user1Contributions}</td>
          <td>${user2Contributions}</td>
        </tr>
      </table>
    `;

    const feedback = [];

    if (user1Data.followers < user2Data.followers) {
      feedback.push(
        `You have fewer followers (${user1Data.followers}) compared to ${comparator} (${user2Data.followers}). Engage more with your audience.`
      );
    } else {
      feedback.push(
        `Great job! You have more followers (${user1Data.followers}) than ${comparator} (${user2Data.followers}).`
      );
    }

    if (user1Data.public_repos < user2Data.public_repos) {
      feedback.push(
        `You have fewer public repositories (${user1Data.public_repos}) than ${comparator} (${user2Data.public_repos}). Consider creating and sharing more projects.`
      );
    } else {
      feedback.push(
        `Excellent! You have more public repositories (${user1Data.public_repos}) than ${comparator} (${user2Data.public_repos}).`
      );
    }

    if (user1Data.public_gists < user2Data.public_gists) {
      feedback.push(
        `You have fewer public gists (${user1Data.public_gists}) compared to ${comparator} (${user2Data.public_gists}). Share more code snippets or notes.`
      );
    } else {
      feedback.push(
        `Good work! You have more public gists (${user1Data.public_gists}) than ${comparator} (${user2Data.public_gists}).`
      );
    }

    const chatResponse = feedback
      .map((message, index) => {
        const delay = index * 2; // Adjust the delay for each message
        return `<div class="message" style="animation-delay: ${delay}s;">${message}</div>`;
      })
      .join("\n");

    const fullHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>GitHub Profile Comparison</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 50px;
        line-height: 1.6;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      h1 {
        color: #333;
        text-align: center;
        margin-bottom: 30px;
      }

      .rough {
        font-family: "Courier New", Courier, monospace;
        font-weight: bold;
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        animation: typing 5s steps(30, end), blink-caret 0.5s step-end infinite;
        border-right: 2px solid #333;
      }

      @keyframes typing {
        from { width: 0; }
        to { width: 100%; }
      }

      @keyframes blink-caret {
        from, to { border-color: transparent; }
        50% { border-color: #333; }
      }

      .comparison-table {
        max-width: 800px;
        margin: 50px auto;
        background: #ffffff;
        border-collapse: collapse;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .comparison-table th, .comparison-table td {
        padding: 10px 15px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      .comparison-table th {
        background-color: #5c67f2;
        color: #fff;
      }

      .comparison-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }

      .comparison-table tr:hover {
        background-color: #f1f1f1;
      }

      .message {
        font-size: 18px;
        margin-bottom: 15px;
        display: inline-block;
        opacity: 0;
        animation: typing 2s steps(30, end) forwards, fadeIn 0.5s ease-out forwards;
        white-space: nowrap;
      }

      @keyframes typing {
        from {
          width: 0;
        }
        to {
          width: 100%;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    </style>
  </head>
  <body>
    <h1 class="rough">GitHub Profile Comparison</h1>
    <div class="chat-box">
      ${chatResponse}
    </div>
    <table class="comparison-table">
    ${comparisonTable}
  </table>
  </body>
  </html>
`;

    res.send(fullHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from GitHub API");
  }
});

app.listen(port, () => {
  console.log("Server is running on port 5000");
});
