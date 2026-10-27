---
name: pastlife-deploy
description: Deploy the Pastlife repository to its development or production environment when the user explicitly asks to deploy, release, publish, or promote it. Do not use for status questions, deployment planning, or local app startup.
---

# Pastlife deployment

Run the repository-owned deployment entrypoint; do not recreate provider commands ad hoc.

## Select the target

- “개발 배포”, “dev 배포”, or equivalent means `dev`.
- “운영 배포”, “실서비스 배포”, “prod 배포”, “출시 배포”, or equivalent means `prod`.
- If the user says only “배포해줘” and the recent context does not identify one environment, ask whether the target is development or production.
- A question such as “배포됐어?”, “배포 상태는?”, or “어떻게 배포해?” is read-only and does not authorize a deployment.

## Execute

1. Work from the Git repository root and read `docs/deployment/prompt-driven-deployment.md` if provider setup or environment variables are incomplete.
2. Before an actual deployment, confirm `git status --short` is empty. Do not commit or discard changes merely to make it clean unless the user separately requested that action.
3. For development run:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment dev
   ```

4. For production, the user’s explicit production deployment request authorizes this exact promotion command:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -ConfirmProduction
   ```

5. Never pass `-SkipChecks` during an actual deployment. It is permitted only with `-DryRun` while testing the deployment machinery.
6. If Railway or Cloudflare credentials, Git integrations, deployment branches, or health URLs are missing, stop at that boundary and request only the specific account action needed. Never ask the user to paste passwords, database URLs, or API tokens into chat.
7. Do not force-push `dev` or `prod`, bypass a failed test, or deploy a production commit not already present on `origin/dev`.

## Report

State the target, short commit SHA, checks run, branch pushed, Railway health result, Cloudflare health result, and any step that was not executed. A successful Git push alone is not a successful deployment; both configured health checks must pass.
