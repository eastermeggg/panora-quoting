---
name: ship
description: Commit, create PR, merge to main, and deploy to panora-quoting.vercel.app. Run /ship to push current work to production in one step.
user-invocable: true
argument-hint: "[commit message]"
---

Ship the current branch to production: commit → PR → merge → deploy.

## Prerequisites

Before starting, verify:
1. You are NOT on the `main` branch. If you are, STOP and tell the user to create a feature branch first.
2. There are actual changes to commit (staged, unstaged, or untracked). If the working tree is clean, skip straight to PR creation (the branch may already have unpushed commits).

## Step 1: Commit

1. Run `git status` (never use `-uall`) and `git diff` to see all changes.
2. Run `git log --oneline -5` to match the repo's commit message style.
3. Stage relevant files by name — do NOT use `git add -A` or `git add .`. Never stage `.env`, credentials, or secrets.
4. Write a concise commit message (1-2 sentences) focused on the "why." If the user provided an argument, use it as the commit message.
5. Commit with the co-author trailer:

```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Use a HEREDOC for the message:
```bash
git commit -m "$(cat <<'EOF'
message here

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

6. If a pre-commit hook fails, fix the issue and create a NEW commit (never `--amend`).

## Step 2: Push & Create PR

1. Push the branch to origin: `git push -u origin HEAD`
2. Check if a PR already exists for this branch: `gh pr view --json number,url 2>/dev/null`
   - If a PR exists, tell the user and skip to Step 3.
3. Create the PR targeting `main`:

```bash
gh pr create --title "the title" --body "$(cat <<'EOF'
## Summary
- bullet points describing the changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- Keep the title under 70 characters.
- The summary should cover ALL commits on the branch (not just the latest).

## Step 3: Merge to main

1. Wait for any required checks. Poll with `gh pr checks` up to 3 times (5s apart). If checks are still pending after 3 polls, ask the user whether to wait or force-merge.
2. Merge using squash: `gh pr merge --squash --delete-branch`
3. If merge fails (conflicts, branch protection), report the error and STOP. Do not force-merge without asking.

## Step 4: Deploy

Vercel auto-deploys from `main` on push. After merge:

1. Tell the user the merge is complete and Vercel is deploying.
2. Check deployment status: `gh api repos/eastermeggg/panora-quoting/deployments --jq '.[0] | {state: .statuses[0].state // "pending", environment, created_at}'` or `vercel ls --token=$VERCEL_TOKEN 2>/dev/null | head -5`
3. Provide the production URL: **https://panora-quoting.vercel.app**

## Error Handling

- **Merge conflicts**: Report them clearly and STOP. Do not attempt to resolve automatically.
- **Failed checks**: Show which checks failed and ask the user how to proceed.
- **Auth issues**: If `gh` or `vercel` commands fail with auth errors, tell the user to run `gh auth login` or `vercel login`.
- **No changes**: If there's nothing to commit AND no unpushed commits, tell the user there's nothing to ship.

## Safety

- NEVER force-push.
- NEVER merge without the user seeing the PR first (always print the PR URL).
- NEVER skip pre-commit hooks with `--no-verify`.
- If anything unexpected happens, STOP and ask. Better to pause than to push broken code to production.
