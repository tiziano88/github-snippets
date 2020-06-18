"use strict";

class UserEvent {
  type!: string;
  payload!: any;
  created_at!: string;
}

class Issue {}

class PullRequest {
  html_url!: string;
  state!: string;
  merged!: boolean;
  title!: string;
}

function map_append<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const current = map.get(key);
  if (current == undefined) {
    map.set(key, [value]);
  } else {
    current.push(value);
  }
}

async function main() {
  let username = (document.getElementById("username") as HTMLInputElement)
    .value;

  let start_date = Date.parse(
    (document.getElementById("start_date") as HTMLInputElement).value
  );
  let end_date = Date.parse(
    (document.getElementById("end_date") as HTMLInputElement).value
  );

  let all_events = new Array<UserEvent>();

  let res = [1, 2, 3].map((page) =>
    fetch(
      `https://api.github.com/users/${username}/events?per_page=1000&page=${page}`
    )
  );

  for (let r of res) {
    let r1 = await r;
    all_events.push(...(await r1.json()));
  }

  console.log(all_events);

  let events = all_events.filter((e) => {
    return (
      Date.parse(e.created_at) >= start_date &&
      Date.parse(e.created_at) < end_date
    );
  });
  console.log(events);

  const issues = new Map<string, Issue>();
  const pull_requests = new Map<string, PullRequest>();

  let output = "";

  output += "Opened issues:\n\n";
  output += events
    .filter((v) => v.type == "IssuesEvent")
    .filter((v) => v.payload.action == "opened")
    .map(
      (v) =>
        `- [${v.payload.issue.title}](${v.payload.issue.html_url}) (assignee: ${
          v.payload.issue.assignee?.login || "n/a"
        })`
    )
    .join("\n");
  output += "\n\n";

  output += "Reopened issues:\n\n";
  output += events
    .filter((v) => v.type == "IssuesEvent")
    .filter((v) => v.payload.action == "reopened")
    .map(
      (v) =>
        `- [${v.payload.issue.title}](${v.payload.issue.html_url}) (assignee: ${
          v.payload.issue.assignee?.login || "n/a"
        })`
    )
    .join("\n");
  output += "\n\n";

  output += "Commented on issues:\n\n";
  output += Array.from(
    events
      .filter((v) => v.type == "IssueCommentEvent")
      .filter((v) => v.payload.action == "created")
      .reduce((map, e) => {
        map_append(map, e.payload.issue.html_url, e);
        return map;
      }, new Map<string, UserEvent[]>())
      .entries() || []
  )
    .map(
      ([k, v]) =>
        `- [${v[0].payload.issue.title}](${k}) (author: ${v[0].payload.issue.user.login}, comments: ${v.length})`
    )
    .join("\n");
  output += "\n\n";

  output += "Opened pull requests:\n\n";
  output += events
    .filter((v) => v.type == "PullRequestEvent")
    .filter((v) => v.payload.action == "opened")
    .map(
      (v) =>
        `- [${v.payload.pull_request.title}](${v.payload.pull_request.html_url})`
    )
    .join("\n");
  output += "\n\n";

  output += "Closed pull requests:\n\n";
  output += events
    .filter((v) => v.type == "PullRequestEvent")
    .filter((v) => v.payload.action == "closed")
    .map(
      (v) =>
        `- [${v.payload.pull_request.title}](${v.payload.pull_request.html_url})`
    )
    .join("\n");
  output += "\n\n";

  output += "Commented on pull requests:\n\n";
  output += Array.from(
    events
      .filter((v) => v.type == "PullRequestReviewCommentEvent")
      .reduce((map, e) => {
        map_append(map, e.payload.pull_request.html_url, e);
        return map;
      }, new Map<string, UserEvent[]>())
      .entries() || []
  )
    .map(
      ([k, v]) =>
        `- [${v[0].payload.pull_request.title}](${k}) (author: ${v[0].payload.pull_request.user.login}, comments: ${v.length})`
    )
    .join("\n");
  output += "\n\n";

  let snippets = document.getElementById("snippets");
  if (snippets) {
    snippets.innerText = output;
  }
}
