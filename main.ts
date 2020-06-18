"use strict";

class UserEvent {
  type!: string;
  payload!: any;
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
  let res = await fetch(
    `https://api.github.com/users/${username}/events?per_page=1000`
  );
  let events: UserEvent[] = await res.json();

  let events_by_type = events.reduce((map, o: UserEvent) => {
    map_append(map, o.type, o);
    return map;
  }, new Map<string, UserEvent[]>());
  console.log(events_by_type);

  let output = "";

  output += "Opened issues:\n\n";
  output += events_by_type
    .get("IssuesEvent")
    ?.filter((v) => v.payload.action == "opened")
    .map((v) => `- [${v.payload.issue.title}](${v.payload.issue.url})`)
    .join("\n");
  output += "\n\n";

  output += "Reopened issues:\n\n";
  output += events_by_type
    .get("IssuesEvent")
    ?.filter((v) => v.payload.action == "reopened")
    .map((v) => `- [${v.payload.issue.title}](${v.payload.issue.url})`)
    .join("\n");
  output += "\n\n";

  output += "Commented on issues:\n\n";
  output += Array.from(
    events_by_type
      .get("IssueCommentEvent")
      ?.filter((v) => v.payload.action == "created")
      .reduce((map, e) => {
        map_append(map, e.payload.issue.url, e);
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
  output += events_by_type
    .get("PullRequestEvent")
    ?.filter((v) => v.payload.action == "opened")
    .map(
      (v) =>
        `- [${v.payload.pull_request.title}](${v.payload.pull_request.url})`
    )
    .join("\n");
  output += "\n\n";

  output += "Closed pull requests:\n\n";
  output += events_by_type
    .get("PullRequestEvent")
    ?.filter((v) => v.payload.action == "closed")
    .map(
      (v) =>
        `- [${v.payload.pull_request.title}](${v.payload.pull_request.url})`
    )
    .join("\n");
  output += "\n\n";

  output += "Commented on pull requests:\n\n";
  output += Array.from(
    events_by_type
      .get("PullRequestReviewCommentEvent")
      ?.reduce((map, e) => {
        map_append(map, e.payload.pull_request.url, e);
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
