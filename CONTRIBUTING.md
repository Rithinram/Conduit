# 🤝 Team Collaboration Guide (Conduit)

To work in parallel without breaking the build or overwriting each other's work, follow this standard Git-Flow workflow.

## 1. Branching Strategy
**Never push directly to `main`.**

*   **`main` branch**: Always contains stable, production-ready code.
*   **Feature branches**: Every new feature or fix should happen on its own branch.
    *   Naming convention: `feature/ml-ui-updates`, `fix/login-bug`, `dev/user-portal-refactor`.
    *   Create a branch: `git checkout -b feature/your-feature-name`

## 2. The Daily Workflow
1.  **Sync Local**: Start your day by pulling the latest stable code.
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Branch Out**: Create your working branch from the updated `main`.
3.  **Commit Often**: Make small, logical commits with clear messages.
4.  **Stay Updated**: Periodically merge `main` into your feature branch to handle conflicts early.
    ```bash
    git merge main
    ```

## 3. Pull Requests (PRs) & Code Review
When your feature is done:
1.  Push your branch: `git push origin feature/your-feature-name`
2.  **Open a Pull Request (PR)** on GitHub/GitLab against the `main` branch.
3.  **Peer Review**: At least one other team member MUST review the code for:
    *   Logic errors.
    *   UI consistency (CSS variables).
    *   Impact on the 3 ML engines.
4.  **Merge**: Once approved and tests pass, merge it into `main`.

## 4. Environment & Dependencies
*   **`.env` Files**: Since `.env` is gitignored, share new keys (like `MONGO_URI`) via your team chat. 
*   **New Packages**: If you run `npm install <package>`, you MUST commit the `package.json` and `package-lock.json`. 
    *   Team members should run `npm install` immediately after pulling to stay in sync.

## 5. ML Consistency
When modifying files in `src/lib/` (the engines):
*   **Inform the team**: These files are the "brain" of the app. Changes here affect all 24 portals.
*   **Run the Audit**: Always run `node scripts/audit_ml.mjs` before opening a PR to ensure you haven't broken the core logic.

---

### Pro-Tip: Squash Commits
When merging a deep feature, "Squash and Merge" to keep the `main` history clean and readable.
