# The flow model

`wwjd.flow.json` at the project root, committed. `flow.mjs check` validates it, then runs the rules below. How to model well: `../rules/flows.md`.

## Schema
```json
{ "v": 1, "app": "Stilla",
  "screens": [
    { "id": "pricing", "title": "Pricing page", "job": "Pick the membership that fits", "route": "/", "entry": true,
      "data": true, "states": ["default", "empty", "loading", "error"], "review": false, "terminal": false, "modal": false,
      "shot": ".wwjd/shots/index-1440-light.png" }
  ],
  "edges": [ { "from": "pricing", "to": "join", "action": "Choose a card", "kind": "forward" } ],
  "journeys": [ { "id": "join", "title": "Join a membership", "steps": ["pricing", "join"], "goal": "Member", "undoes": null } ]
}
```
- **screen:** `id` (lowercase, digits, dashes; unique), `title`, `job` (the one thing a person does there). Optional: `route`; `entry` (people arrive here); `data` (shows loaded data); `states` (the states that exist); `review` (the review step before money, legal, delete or sending); `terminal` (a real end: confirmation, done); `modal` (opens over another screen: dialog, sheet; a multi-step modal is one screen); `shot` (screenshot, project-relative).
- **edge:** `from`, `to` (screen ids), `action` (the control's label), `kind`: `forward`, `back`, `undo`, `error` (where a failure goes; a failure shown in place is the screen's `error` state), `destructive` (money, legal commitment, delete, sent to others).
- **journey:** `id`, `title`, ordered `steps` (screen ids), `goal` (what the person has at the end), optional `undoes` (the journey it reverses: cancel undoes join).

## Rules
Each finding: `{rule, severity, screen?, journey?, what, fix}`. Errors exit 1.

| Rule | Severity | Finds | Source |
|---|---|---|---|
| `shape` | error | A missing field, bad id, duplicate id or unknown kind. | The model itself |
| `unknown-ref` | error | A way, step or `undoes` naming something that does not exist. | The model itself |
| `no-entry` | error | No screen marked as where people arrive. | A to B, no dead ends |
| `unreachable` | error | A screen no path from an entry reaches. | A to B, no dead ends |
| `dead-end` | error | No way onward and not `terminal`. | A to B, no dead ends |
| `journey-gap` | error | Two steps in a row with no direct way between them. | A to B; intended flow first |
| `no-way-back` | warn | A middle screen with no path back to any entry. | A to B, no dead ends |
| `destructive-unguarded` | error | A destructive way with no review step on either side and no undo from where it lands. | Floor: reversibility |
| `leaving-harder` | error | A journey that `undoes` another takes more steps than it, counting the way from the nearest entry to its first screen; review steps don't count. | Floor: honesty; DSA Art. 25(3)(c); GDPR Art. 7(3) |
| `missing-state` | warn | A `data` screen without an empty, loading or error state (one finding each). | States and flow: every state is part of it |
| `long-journey` | warn | More than 7 steps. | Remove before adding; GOV.UK question protocol, task list |
| `trap` | error | Screens you can enter but never leave, none of them an end. | A to B, no dead ends; NN/g user control and freedom |
| `review-no-change` | error | A review step with no way back to what it reviews (Change, Cancel, Keep). | WCAG 3.3.4; GOV.UK check answers |
| `modal-no-dismiss` | error | A `modal` screen with no `back` or `undo` way. | Apple HIG Modality; NN/g emergency exit |
| `no-failure-path` | warn | A destructive way where neither end has an `error` state or an `error` way (one per screen). | NN/g heuristic 9; Baymard (declined cards, site errors) |
| `error-restarts` | warn | An `error` way that lands more than one step back in a journey. | NN/g heuristic 9 (recover from errors); flows.md (errors keep the data) |
| `end-no-next` | warn | A `terminal` screen with no way onward. | GOV.UK confirmation pages |
| `no-shot` | info | A screen without `shot`; the canvas can't show it. | Loop: show it |
| `orphan-decision` | warn | A `.wwjd/decisions.jsonl` entry whose `screen` is not in the flow. | Corrections become rules |

A screen is reported once: a dead end or a trapped screen is not also `no-way-back`. Sources: `sources.md`.
