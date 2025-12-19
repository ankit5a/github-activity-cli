#!/usr/bin/env node

// Import built-in Node.js modules
const https = require("https");
const process = require("process");

// Read the GitHub username from command-line arguments
// Example: node index.js octocat
const username = process.argv[2];

// If username is not provided, show usage and exit
if (!username) {
  console.log("Usage: github-activity <username>");
  process.exit(1);
}

// Construct GitHub API URL for fetching user events
const url = `https://api.github.com/users/${username}/events`;

// Make HTTPS GET request to GitHub API
https
  .get(
    url,
    {
      // GitHub API requires a User-Agent header
      headers: { "User-Agent": "Node.js" },
    },
    (res) => {
      let data = "";

      // Collect response data in chunks
      res.on("data", (chunk) => {
        data += chunk;
      });

      // When response is fully received
      res.on("end", () => {
        // Handle non-success HTTP status codes
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
          // Parse JSON response into JavaScript object
          const events = JSON.parse(data);

          // If no activity is found
          if (!Array.isArray(events) || events.length === 0) {
            console.log(`No recent activity for user '${username}'.`);
            return;
          }

          console.log(`Recent activity for ${username}:`);

          // Loop through each GitHub event
          events.forEach((event) => {
            let message = "";
            const repo = event.repo.name;

            // Format message based on event type
            switch (event.type) {
              case "PushEvent": {
                const commitCount =
                  event.payload?.size || event.payload?.commits?.length || 0;
                message = `Pushed ${commitCount} commit${
                  commitCount !== 1 ? "s" : ""
                } to ${repo}`;
                break;
              }

              case "IssuesEvent": {
                const action =
                  event.payload.action.charAt(0).toUpperCase() +
                  event.payload.action.slice(1);
                message = `${action} an issue in ${repo}`;
                break;
              }

              case "WatchEvent":
                message = `Starred ${repo}`;
                break;

              case "CreateEvent":
                message = `Created a ${event.payload.ref_type} in ${repo}`;
                break;

              case "PullRequestEvent": {
                const action =
                  event.payload.action.charAt(0).toUpperCase() +
                  event.payload.action.slice(1);
                message = `${action} a pull request in ${repo}`;
                break;
              }

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
                message = `Deleted a ${event.payload.ref_type} in ${repo}`;
                break;

              default:
                message = `${event.type} in ${repo}`;
                break;
            }

            // Print formatted message
            if (message) {
              console.log(`- ${message}`);
            }
          });
        } catch (err) {
          // Handle JSON parsing or unexpected errors
          console.error("Error parsing response:", err.message);
          process.exit(1);
        }
      });
    }
  )
  // Handle request-level errors
  .on("error", (err) => {
    console.error("Request error:", err.message);
    process.exit(1);
  });
