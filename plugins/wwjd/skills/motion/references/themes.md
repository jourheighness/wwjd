# Themes per product type

The theme sets the numbers; the register decides what may move (`springy` limits: SKILL.md §2).

## Theme definitions
| Theme | Tokens | Model |
|---|---|---|
| `instant` | 80/100/160ms, `--pop-scale: 1`, `--enter-y: 0` | Opacity only (IBM Carbon productive; frequent stays under 150ms) |
| `crisp` | 120/160/220ms, `.97`, `.98` press, 8px | Ease-out from near-size |
| `smooth` | 180/240/320ms, `.96`, 12px, drawer curve | Long deceleration (iOS sheet curve) |
| `springy` | 120/180/320ms + 420ms spring, `.95`, 16px | Damping .8 / stiffness 380 spatial; .9/700 for moves (Material 3 Expressive) |

## Product type → theme → signature moments
| Product type | Register | Theme | Signature moments (everything else: none) |
|---|---|---|---|
| Work tool: tracker, CRM, editor, admin | Operate | `crisp` | Popover from trigger · optimistic insert · undo toast · detail drawer · palette instant |
| Power tool, IDE-like, spreadsheet | Operate (dense) | `instant` | Nothing on keyboard paths · selection is instant · only overlays fade |
| Dashboard, ops, analytics | Monitor | `instant` | Number change in place · new row tints once then settles · no chart grow-in, no count-up |
| Docs, API reference, help | Reference | `instant` | Search palette · copy-to-clipboard check · anchor jump without smooth scroll on long pages |
| Article, blog, newsletter | Editorial | `instant` in the column, `crisp` chrome | Cross-document crossfade · image to lightbox shared element · nothing in the reading column |
| Chat, assistant, agent panel | Converse | `crisp` | Streaming text · thinking label · tool-step expand · message send settles into the thread |
| Store, product page, cart | Transact | `smooth` browse, `crisp` checkout | Add to cart → count change + mini-cart drawer · gallery shared element · sticky buy bar slides in · checkout calm |
| Signup, onboarding, wizard | Flow | `smooth` | Directional step slide (VT types forward/back) · progress · one success at the end |
| Consumer app: social, habits, finance | Native or Operate | `smooth` | Sheets with momentum · like/toggle press · pull to refresh · rare milestone |
| Landing, pricing, waitlist | Persuade | `springy` or `smooth` | One hero sequence · real product demo · one scroll-built idea · pricing toggle number change |
| Portfolio, case study, gallery | Showcase | `springy` or `smooth` | Shared-element thumbnail → case study · scroll-linked media · cursor stays the system cursor |
| Native mobile | Native | platform | SwiftUI default springs (`.smooth`/`.snappy`, `duration: 0.5`); Compose M3 motion scheme; system sheet and navigation transitions |
| Playful: learning, kids, games-adjacent | Native or Persuade | `springy` | Springy press · progress fill · milestone moment (no confetti) · mascot via Rive, paused on reduced motion |
| Government, public service, forms that must work for all | Flow | `instant` | None. GOV.UK components ship no motion; that is the bar |

## Mixing
- A landing page and its app may differ (`springy` site, `crisp` app); an inner region keeps its own register's theme (a chat panel in a dashboard stays `crisp`).
