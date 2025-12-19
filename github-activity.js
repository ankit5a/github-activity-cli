// Import built-in Node.js modules
const https = require("https");
const process = require("process");

// Read GitHub username from command-line arguments
const username = process.argv[2];

// If username is missing, show usage message and exit
if (!username) {
  console.log("Usage: github-activity <username>");
  process.exit(1);
}

// GitHub API endpoint to fetch public events for the user
const url = `https://api.github.com/users/${username}/events`;

// Make an HTTPS GET request to the GitHub API
https
  .get(url, { headers: { "User-Agent": "Node.js" } }, (res) => {
    let data = "";

    // Collect incoming data chunks
    res.on("data", (chunk) => {
      data += chunk;
    });

    // Once the entire response has been received
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
        // Parse the JSON response into a JavaScript object
        const events = JSON.parse(data);

        // If no activity is found for the user
        if (!Array.isArray(events) || events.length === 0) {
          console.log(`No recent activity for user '${username}'.`);
          return;
        }

        console.log(`Recent activity for ${username}:`);

        // Loop through each GitHub event
        events.forEach((event) => {
          let message = "";
          const repo = event.repo.name;

          // Decide how to display the event based on its type
          switch (event.type) {
            case "PushEvent":
              // Extract payload for push event details
              const payload = event.payload;

              // Determine commit count using available payload fields
              const commitCount =
                payload.size ||
                payload.distinct_size ||
                (payload.commits
                  ? payload.commits.length
                  : payload.head
                  ? 1
                  : 0);

              message = `Pushed ${commitCount} commit${
                commitCount !== 1 ? "s" : ""
              } to ${repo}`;
              break;

            case "IssuesEvent":
              // Capitalize the issue action (opened, closed, etc.)
              const action =
                event.payload.action.charAt(0).toUpperCase() +
                event.payload.action.slice(1);
              message = `${action} an issue in ${repo}`;
              break;

            case "WatchEvent":
              message = `Starred ${repo}`;
              break;

            case "CreateEvent":
              // ref_type can be branch or repository
              const refType = event.payload.ref_type;
              message = `Created a ${refType} in ${repo}`;
              break;

            case "PullRequestEvent":
              // Capitalize pull request action
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
              // ref_type indicates what was deleted (branch or tag)
              const delRefType = event.payload.ref_type;
              message = `Deleted a ${delRefType} in ${repo}`;
              break;

            default:
              // Fallback for unhandled event types
              message = `${event.type} in ${repo}`;
              break;
          }

          // Print the formatted activity message
          if (message) {
            console.log(`- ${message}`);
          }
        });
      } catch (err) {
        // Handle JSON parsing errors or unexpected exceptions
        if (err instanceof Error) {
          console.error("Error parsing response:", err.message);
        } else {
          console.error("Unknown error occurred:", err);
        }
        process.exit(1);
      }
    });
  })
  // Handle network or request-level errors
  .on("error", (err) => {
    console.error("Request error:", err.message);
    process.exit(1);
  });
