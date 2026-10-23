---
name: propose-commit
description: Propose the commit message and ticket description for the finished task. Claude does not commit; the maintainer reviews and runs it.
disable-model-invocation: true
---

# Propose the commit

The maintainer commits, never you. Produce the text they will use, and stop.

1. **Verify first.** `git status --porcelain` and `git diff`. Lint and build must have passed this
   session; if not, run them and report the real output.
2. **Take the message from the card's `_Commit_` line.** If the delivered scope diverged, propose
   the corrected message and explain the divergence in one line.
3. **English, conventional commits**, one short subject line, no trailer.
4. **Output exactly two blocks:** the `git add … && git commit -m "…"` command in a `bash` block,
   and the ticket description in a `markdown` block, ready to paste as the GitHub PR description
   (the PR title is the commit subject). English, this template, no prose outside it:

   ```markdown
   ## Summary

   - <what changed, one bullet per component or behavior, paths in `code`>

   ## Acceptance

   - [x] <criterion from the card's _Acceptance_>: <what it printed or showed>
   - [ ] <criterion not verified>: <why>

   ## Notes

   - <`ponytail:` shortcuts, backlog items earned, decisions the reviewer must make>
   ```

   Drop `## Notes` when it would be empty. Inline code only inside the description: no fences.

5. Flag anything the pre-commit hook will reject before they run it.
