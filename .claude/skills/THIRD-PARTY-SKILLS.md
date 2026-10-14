# Third-party design skills

The skills in this folder were copied unchanged from their upstream repositories.
Each folder carries its upstream license file. Do not edit the upstream files in place;
to update a skill, replace its folder with a newer upstream copy.

| Skill folder | Upstream | Commit | License | Copyright |
| --- | --- | --- | --- | --- |
| `emil-design-eng/` | https://github.com/emilkowalski/skills (`skills/emil-design-eng`) | `2d228630ba1446365f614a108cb8252f1feda202` | MIT (`emil-design-eng/LICENSE`) | (c) 2026 Emil Kowalski |
| `impeccable/` | https://github.com/pbakaus/impeccable (`.claude/skills/impeccable`, v4.5.2) | `2f98774f86bc05563876643db37e6c37c322850f` | Apache-2.0 (`impeccable/LICENSE`, `impeccable/NOTICE.md`) | Paul Bakaus |
| `design-taste-frontend/` | https://github.com/Leonxlnx/taste-skill (`skills/taste-skill`) | `a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9` | MIT (`design-taste-frontend/LICENSE`) | (c) 2026 Leonxlnx |

Impeccable also ships four subagents, copied unchanged into `../agents/`:
`impeccable-asset-producer.md`, `impeccable-documenter.md`, `impeccable-finish-reviewer.md`,
`impeccable-manual-edit-applier.md` (same commit and license as above).

## Deliberately not installed

- The other Emil Kowalski skills (animate, review-animations, write-swift, ...) and the other
  Taste Skill skills (redesign, soft, minimalist, brutalist, image generation, ...): not requested.
- Impeccable's hooks (`.claude/settings.json` in its repo). They run the Impeccable engine binary
  after every edit, and that binary is downloaded from GitHub releases on first run. Not enabled
  without the project owner's approval.
- No install script (`npx skills`, `npx impeccable install`, `install.sh`) was run; files were copied.

## Runtime notes

- `impeccable/scripts/impeccable` downloads a platform binary from
  `https://github.com/pbakaus/impeccable/releases` on first use (checksum-verified). The skill has a
  documented fallback when the launcher is not run: read `PRODUCT.md` / `DESIGN.md` directly.
- `design-taste-frontend/scripts/*.mjs` need Node 22+ (and Chrome/Chromium for `inspect.mjs`);
  `assets.mjs` searches open image collections over the network. They install nothing.
