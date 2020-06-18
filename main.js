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
class UserEvent {
}
class Issue {
}
class PullRequest {
}
function map_append(map, key, value) {
    const current = map.get(key);
    if (current == undefined) {
        map.set(key, [value]);
    }
    else {
        current.push(value);
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let username = document.getElementById("username")
            .value;
        let start_date = Date.parse(document.getElementById("start_date").value);
        let end_date = Date.parse(document.getElementById("end_date").value);
        let all_events = new Array();
        let res = [1, 2, 3].map((page) => fetch(`https://api.github.com/users/${username}/events?per_page=1000&page=${page}`));
        for (let r of res) {
            let r1 = yield r;
            all_events.push(...(yield r1.json()));
        }
        console.log(all_events);
        let events = all_events.filter((e) => {
            return (Date.parse(e.created_at) >= start_date &&
                Date.parse(e.created_at) < end_date);
        });
        console.log(events);
        const issues = new Map();
        const pull_requests = new Map();
        let output = "";
        output += "Opened issues:\n\n";
        output += events
            .filter((v) => v.type == "IssuesEvent")
            .filter((v) => v.payload.action == "opened")
            .map((v) => {
            var _a;
            return `- [${v.payload.issue.title}](${v.payload.issue.html_url}) (assignee: ${((_a = v.payload.issue.assignee) === null || _a === void 0 ? void 0 : _a.login) || "n/a"})`;
        })
            .join("\n");
        output += "\n\n";
        output += "Reopened issues:\n\n";
        output += events
            .filter((v) => v.type == "IssuesEvent")
            .filter((v) => v.payload.action == "reopened")
            .map((v) => {
            var _a;
            return `- [${v.payload.issue.title}](${v.payload.issue.html_url}) (assignee: ${((_a = v.payload.issue.assignee) === null || _a === void 0 ? void 0 : _a.login) || "n/a"})`;
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
            .map(([k, v]) => `- [${v[0].payload.issue.title}](${k}) (author: ${v[0].payload.issue.user.login}, comments: ${v.length})`)
            .join("\n");
        output += "\n\n";
        output += "Opened pull requests:\n\n";
        output += events
            .filter((v) => v.type == "PullRequestEvent")
            .filter((v) => v.payload.action == "opened")
            .map((v) => `- [${v.payload.pull_request.title}](${v.payload.pull_request.html_url})`)
            .join("\n");
        output += "\n\n";
        output += "Closed pull requests:\n\n";
        output += events
            .filter((v) => v.type == "PullRequestEvent")
            .filter((v) => v.payload.action == "closed")
            .map((v) => `- [${v.payload.pull_request.title}](${v.payload.pull_request.html_url})`)
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
            .map(([k, v]) => `- [${v[0].payload.pull_request.title}](${k}) (author: ${v[0].payload.pull_request.user.login}, comments: ${v.length})`)
            .join("\n");
        output += "\n\n";
        let snippets = document.getElementById("snippets");
        if (snippets) {
            snippets.innerText = output;
        }
    });
}
