// node --test skills/ux/scripts/dials-spec.test.mjs: references/dials.md lists every stop exactly as dials-spec.mjs has it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { DIALS } from "./dials-spec.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const md = readFileSync(join(here, "..", "references", "dials.md"), "utf8");

for (const dial of DIALS) {
  test(`dials.md matches the spec for ${dial.name} (${dial.key})`, () => {
    const at = md.indexOf(`(\`${dial.key}\`)`);
    assert.ok(at > 0, `no "## ${dial.name} … (\`${dial.key}\`)" heading in dials.md`);
    const section = md.slice(at, md.indexOf("\n## ", at) === -1 ? undefined : md.indexOf("\n## ", at));
    dial.stops.forEach(([name, does], i) => {
      const def = i + 1 === dial.default ? " (default)" : "";
      const line = `- **${i + 1} ${name}${def}:** ${does}`;
      assert.ok(section.includes(line), `dials.md is missing or differs from:\n${line}`);
    });
  });
}
