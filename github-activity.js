#!/usr/bin/env node

const https = require("https");
const process = require("process");

const username = process.argv[2];

if (!username) {
  console.log("Usage: github-activity <username>");
  process.exit(1);
}

const url = `https://api.github.com/users/${username}/events`;

https
  .get(url, { headers: { "User-Agent": "Node.js" } }, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      if (res.statusCode !== 200) {
        if (res.statusCode === 404) {
          console.error(`User '${username}' not found.`);
        } else if (res.statusCode === 403) {
          console.error("API rate limit exceeded. Try again later.");
        } else {
          console.error(
            `Error fetching data: ${res.statusCode} ${res.statusMessage}`
          );
        }
        process.exit(1);
      }

      try {
        const events = JSON.parse(data);
        if (!Array.isArray(events) || events.length === 0) {
          console.log(`No recent activity for user '${username}'.`);
          return;
        }

        console.log(`Recent activity for ${username}:`);
        events.forEach((event) => {
          let message = "";
          const repo = event.repo.name;

          switch (event.type) {
            case "PushEvent":
              const commitCount =
                (event.payload && event.payload.size) ||
                (event.payload &&
                  event.payload.commits &&
                  event.payload.commits.length) ||
                0;
              message = `Pushed ${commitCount} commit${
                commitCount > 1 ? "s" : ""
              } to ${repo}`;
              break;
            case "IssuesEvent":
              const action =
                event.payload.action.charAt(0).toUpperCase() +
                event.payload.action.slice(1);
              message = `${action} an issue in ${repo}`;
              break;
            case "WatchEvent":
              message = `Starred ${repo}`;
              break;
            case "CreateEvent":
              const refType = event.payload.ref_type;
              message = `Created a ${refType} in ${repo}`;
              break;
            case "PullRequestEvent":
              const prAction =
                event.payload.action.charAt(0).toUpperCase() +
                event.payload.action.slice(1);
              message = `${prAction} a pull request in ${repo}`;
              break;
            case "ForkEvent":
              message = `Forked ${repo}`;
              break;
            case "IssueCommentEvent":
              message = `Commented on an issue in ${repo}`;
              break;
            case "PullRequestReviewEvent":
              message = `Reviewed a pull request in ${repo}`;
              break;
            case "PullRequestReviewCommentEvent":
              message = `Commented on a pull request review in ${repo}`;
              break;
            case "DeleteEvent":
              const delRefType = event.payload.ref_type;
              message = `Deleted a ${delRefType} in ${repo}`;
              break;
            default:
              message = `${event.type} in ${repo}`;
              break;
          }

          if (message) {
            console.log(`- ${message}`);
          }
        });
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error parsing response:", err.message);
        } else {
          console.error("Unknown error occurred:", err);
        }
        process.exit(1);
      }
    });
  })
  .on("error", (err) => {
    console.error("Request error:", err.message);
    process.exit(1);
  });
