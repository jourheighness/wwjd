# Before and after

Short, concrete pairs. When a rule is unclear, match the example.

## 1. Explaining text goes
```tsx
// Before
<Card>
  <p className="uppercase tracking-wide text-xs">Overview</p>
  <h3>{project.name}</h3>
  <p>This card shows your project's progress. Don't worry, nothing is ever lost.</p>
</Card>

// After
<Card>
  <h3>{project.name}</h3>
</Card>
```
The eyebrow restates the obvious, the sentence narrates the card, and the reassurance answers a question nobody asked.

## 2. A count that changes nothing becomes a mark
```tsx
// Before
<span>{published} of {total} areas published</span>

// After
<Progress value={published} max={total} aria-label="Areas published" />
// …or, in a list where only "something needs you" matters:
{hasUnread && <Dot aria-label="New activity" />}
```

## 3. Five actions become one plus a menu
```tsx
// Before
<Row>
  <Button>Edit</Button><Button>Share</Button><Button>Duplicate</Button>
  <Button>Archive</Button><Button variant="danger">Delete</Button>
</Row>

// After: the title link is stretched over the row; inner actions sit above it
<Row>
  <RowLink href={item.url}>{item.name}</RowLink>
  <Button variant="primary">Share</Button>
  <RowActionsMenu items={[edit, duplicate, archive, del]} />
</Row>
```

## 4. Labels say what happens
| Before | After |
|---|---|
| Submit | Send invite to Anna |
| Delete selected | Delete 5 items |
| Are you sure? [Yes] [No] | Deleted. [Undo] (hide now; undo until the next action, announced, keyboard-reachable) |
| Invalid date | Enter a date as YYYY-MM-DD |
| Oops! Something went wrong! | Couldn't save. [Retry] |
| `Owner: Sara Lind` as grey label text in a list row | ⟨avatar + name chip⟩ in the owner column |
| Updated 2026-10-14 09:32 | Yesterday (full timestamp in a tooltip) |

## 5. A hover fill that doesn't move anything
```css
/* Before: padding appears on hover and the row jumps */
.row:hover { background: var(--hover); padding-inline: 12px; }

/* After: the fill hangs outside the text, so nothing shifts */
.row { position: relative; isolation: isolate; }
.row::before { content: ""; position: absolute; inset: 0 -12px; border-radius: 6px;
               background: var(--hover); opacity: 0; z-index: -1; }
.row:hover::before { opacity: 1; }
```

## 6. Content aligns, the card bleeds
```text
Before                          After
Heading                         Heading
Paragraph text                  Paragraph text
  ┌──────────────┐            ┌──────────────────┐
  │ Card title   │            │Card title        │  ← text on the same edge
  │ Card body    │            │Card body         │    as the paragraph;
  └──────────────┘            └──────────────────┘    the surface hangs out
```

## 7. An empty state
```tsx
// Before
<Empty
  icon={<Sparkles />}
  title="Welcome to Projects!"
  body="Projects help you organise your work. Create your first project to get started on your journey."
  actions={[<Button>Create project</Button>, <Button variant="ghost">Learn more</Button>]}
/>

// After
<Empty body="No projects yet." action={<Button>New project</Button>} />
```

## 8. A landing hero
```text
Before: centred eyebrow "✨ Introducing Acme" → gradient headline
        "Supercharge your workflow" → two buttons → floating 3D blobs.
After:  start-aligned headline built from the inventory ("Every invoice
        your accountant asks for, already sorted"), one lede line, one
        button ("Connect your bank"), and a real screenshot of the sorted
        inbox, cropped to the moment it matters.
```

## 9. An agent's work in a product
```text
Before: a chat bubble saying "I've analysed 14 documents and updated
        the report! Here's a summary of what I did: 1… 2… 3…"
After:  the change is marked in the report itself, with Keep and Undo
        on it. One line in the chat: "Filled in section 3 from the
        March audit."
```
