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
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        let username = document.getElementById("username")
            .value;
        let res = yield fetch(`https://api.github.com/users/${username}/events?per_page=1000`);
        let events = yield res.json();
        let events_by_type = events.reduce((map, o) => {
            map_append(map, o.type, o);
            return map;
        }, new Map());
        console.log(events_by_type);
        let output = "";
        output += "Opened issues:\n\n";
        output += (_a = events_by_type
            .get("IssuesEvent")) === null || _a === void 0 ? void 0 : _a.filter((v) => v.payload.action == "opened").map((v) => `- [${v.payload.issue.title}](${v.payload.issue.url})`).join("\n");
        output += "\n\n";
        output += "Reopened issues:\n\n";
        output += (_b = events_by_type
            .get("IssuesEvent")) === null || _b === void 0 ? void 0 : _b.filter((v) => v.payload.action == "reopened").map((v) => `- [${v.payload.issue.title}](${v.payload.issue.url})`).join("\n");
        output += "\n\n";
        output += "Commented on issues:\n\n";
        output += Array.from(((_c = events_by_type
            .get("IssueCommentEvent")) === null || _c === void 0 ? void 0 : _c.filter((v) => v.payload.action == "created").reduce((map, e) => {
            map_append(map, e.payload.issue.url, e);
            return map;
        }, new Map()).entries()) || [])
            .map(([k, v]) => `- [${v[0].payload.issue.title}](${k}) (author: ${v[0].payload.issue.user.login}, comments: ${v.length})`)
            .join("\n");
        output += "\n\n";
        output += "Opened pull requests:\n\n";
        output += (_d = events_by_type
            .get("PullRequestEvent")) === null || _d === void 0 ? void 0 : _d.filter((v) => v.payload.action == "opened").map((v) => `- [${v.payload.pull_request.title}](${v.payload.pull_request.url})`).join("\n");
        output += "\n\n";
        output += "Closed pull requests:\n\n";
        output += (_e = events_by_type
            .get("PullRequestEvent")) === null || _e === void 0 ? void 0 : _e.filter((v) => v.payload.action == "closed").map((v) => `- [${v.payload.pull_request.title}](${v.payload.pull_request.url})`).join("\n");
        output += "\n\n";
        output += "Commented on pull requests:\n\n";
        output += Array.from(((_f = events_by_type
            .get("PullRequestReviewCommentEvent")) === null || _f === void 0 ? void 0 : _f.reduce((map, e) => {
            map_append(map, e.payload.pull_request.url, e);
            return map;
        }, new Map()).entries()) || [])
            .map(([k, v]) => `- [${v[0].payload.pull_request.title}](${k}) (author: ${v[0].payload.pull_request.user.login}, comments: ${v.length})`)
            .join("\n");
        output += "\n\n";
        let snippets = document.getElementById("snippets");
        if (snippets) {
            snippets.innerText = output;
        }
    });
}
