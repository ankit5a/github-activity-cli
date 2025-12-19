# GitHub Activity CLI

A simple **Node.js command-line tool** that fetches and displays the **recent public GitHub activity** of any user directly in your terminal.

---

## 🚀 Features

- Fetches recent GitHub events using the GitHub REST API
- Displays readable activity such as:
  - Commits pushed
  - Issues opened/closed
  - Pull requests created
  - Repositories starred or forked
- Handles common API errors gracefully
- Lightweight and dependency-free (uses only Node.js core modules)

---

## 📦 Installation

### Clone the repository
```bash
git clone https://github.com/<your-username>/github-activity-cli.git

cd github-activity-cli
````

### Make the script executable

```bash
chmod +x index.js
```

> Ensure the file name matches your script (e.g. `index.js`).

---

## 🛠 Usage

```bash
node index.js <github-username>
```

If installed globally:

```bash
github-activity <github-username>
```

### Example

```bash
node index.js torvalds
```

### Sample Output

```text
Recent activity for torvalds:
- Pushed 2 commits to torvalds/linux
- Opened an issue in torvalds/subsurface
- Starred torvalds/test-repo
```

---

## ⚙️ How It Works

* Reads the GitHub username from command-line arguments
* Calls the GitHub Events API:

  ```
  https://api.github.com/users/<username>/events
  ```
* Parses and formats event types into readable messages
* Prints results to the terminal

---

## ❗ Error Handling

The CLI handles common errors including:

* Missing username
* User not found (404)
* GitHub API rate limit exceeded (403)
* Network or response parsing errors

---

## 📋 Requirements

* Node.js v14 or higher
* Internet connection

---

## 🧪 Supported Event Types

* PushEvent
* IssuesEvent
* WatchEvent (stars)
* CreateEvent
* PullRequestEvent
* ForkEvent
* IssueCommentEvent
* PullRequestReviewEvent
* PullRequestReviewCommentEvent
* DeleteEvent

Other event types are displayed in a generic format.

---

## 📄 License

MIT License

---

## ✨ Future Improvements

* GitHub authentication for higher rate limits
* Filter events by type
* Colored output for better readability
* Publish as an npm package
