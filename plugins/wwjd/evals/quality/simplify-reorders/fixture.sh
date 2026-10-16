#!/usr/bin/env bash
set -e
mkdir -p src
cat > src/NotificationSettings.tsx <<'TSX'
export function NotificationSettings({ emailVerified, channels }: { emailVerified: boolean; channels: { name: string; on: boolean }[] }) {
  return (
    <section className="card">
      <h2>Notification settings</h2>
      <p>This section lets you control how we contact you. You can always change these later, nothing is ever lost.</p>
      <p>You have {channels.length} channels configured.</p>
      {channels.map((c) => (
        <label key={c.name}><input type="checkbox" defaultChecked={c.on} /> {c.name} <span className="pill">{c.on ? "Enabled" : "Disabled"}</span></label>
      ))}
      <div>
        <button className="btn">Save</button>
        <button className="btn">Reset to defaults</button>
        <button className="btn">Export settings</button>
        <button className="btn">Send test notification</button>
      </div>
      {!emailVerified && <p className="muted">Your email address is not verified, so email notifications will not be delivered.</p>}
    </section>
  );
}
TSX
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
