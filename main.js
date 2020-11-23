"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function map_append(map, key, value) {
    const current = map.get(key);
    if (current == undefined) {
        map.set(key, [value]);
    }
    else {
        current.push(value);
    }
}
function format_user(user) {
    if (user) {
        return `[${user.login}](${user.html_url})`;
    }
    else {
        return "n/a";
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const url_params = new URLSearchParams(window.location.search);
        var today = new Date().toLocaleDateString();
        const username_input = document.getElementById("username");
        console.log(username_input);
        const start_date_input = document.getElementById("start_date");
        const end_date_input = document.getElementById("end_date");
        const start_date = url_params.get("start_date") || "";
        if (start_date == "") {
            return;
        }
        start_date_input.value = start_date;
        const end_date = url_params.get("end_date") || "";
        if (end_date == "") {
            return;
        }
        end_date_input.value = end_date;
        const username = url_params.get("username") || "";
        if (username == "") {
            return;
        }
        username_input.value = username;
        const all_events = new Array();
        const res = [1, 2, 3].map((page) => fetch(`https://api.github.com/users/${username}/events?per_page=1000&page=${page}`));
        for (let r of res) {
            const r1 = yield r;
            all_events.push(...(yield r1.json()));
        }
        console.log(all_events);
        const events = all_events.filter((e) => {
            return e.created_at >= start_date && e.created_at < end_date;
        });
        console.log(events);
        events.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
        /*
        const issues = new Map<string, Promise<Issue>>();
        const pull_requests = new Map<string, Promise<PullRequest>>();
      
        for (let e of events) {
          {
            let issue_url = e.payload?.issue?.url;
            if (issue_url) {
              if (!issues.has(issue_url)) {
                issues.set(
                  issue_url,
                  fetch(issue_url).then((r) => r.json())
                );
              }
            }
          }
          {
            let pr_url = e.payload?.pull_request?.url;
            if (pr_url) {
              if (!pull_requests.has(pr_url)) {
                pull_requests.set(
                  pr_url,
                  fetch(pr_url).then((r) => r.json())
                );
              }
            }
          }
        }
        */
        let output = "";
        output += "Current date: " + today + "\n\n";
        output += "Opened issues:\n\n";
        output += events
            .filter((v) => v.type == "IssuesEvent")
            .filter((v) => v.payload.action == "opened")
            .map((v) => {
            const issue = v.payload.issue;
            return `- [${issue.title}](${issue.html_url}) (assignee: ${format_user(issue.assignee)})`;
        })
            .join("\n");
        output += "\n\n";
        output += "Reopened issues:\n\n";
        output += events
            .filter((v) => v.type == "IssuesEvent")
            .filter((v) => v.payload.action == "reopened")
            .map((v) => {
            const issue = v.payload.issue;
            return `- [${issue.title}](${issue.html_url}) (assignee: ${format_user(issue.assignee)})`;
        })
            .join("\n");
        output += "\n\n";
        output += "Commented on issues:\n\n";
        output += Array.from(events
            .filter((v) => v.type == "IssueCommentEvent")
            .filter((v) => v.payload.action == "created")
            .reduce((map, e) => {
            map_append(map, e.payload.issue.html_url, e);
            return map;
        }, new Map())
            .entries() || [])
            .map(([k, v]) => {
            const latest = v[v.length - 1];
            const issue = latest.payload.issue;
            return `- [${issue.title}](${k}) (author: ${format_user(issue.user)}, comments: ${v.length})`;
        })
            .join("\n");
        output += "\n\n";
        output += "Opened pull requests:\n\n";
        output += events
            .filter((v) => v.type == "PullRequestEvent")
            .filter((v) => v.payload.action == "opened")
            .map((v) => {
            const pull_request = v.payload.pull_request;
            return `- [${pull_request.title}](${pull_request.html_url}) (status: ${pull_request.state})`;
        })
            .join("\n");
        output += "\n\n";
        output += "Closed pull requests:\n\n";
        output += events
            .filter((v) => v.type == "PullRequestEvent")
            .filter((v) => v.payload.action == "closed")
            .map((v) => {
            const pull_request = v.payload.pull_request;
            return `- [${pull_request.title}](${pull_request.html_url})`;
        })
            .join("\n");
        output += "\n\n";
        output += "Commented on pull requests:\n\n";
        output += Array.from(events
            .filter((v) => v.type == "PullRequestReviewCommentEvent")
            .reduce((map, e) => {
            map_append(map, e.payload.pull_request.html_url, e);
            return map;
        }, new Map())
            .entries() || [])
            .map(([k, v]) => {
            const latest = v[v.length - 1];
            const pull_request = latest.payload.pull_request;
            return `- [${pull_request.title}](${k}) (author: ${format_user(pull_request.user)}, comments: ${v.length})`;
        })
            .join("\n");
        output += "\n\n";
        const snippets = document.getElementById("snippets");
        if (snippets) {
            snippets.innerText = output;
        }
    });
}
main();
