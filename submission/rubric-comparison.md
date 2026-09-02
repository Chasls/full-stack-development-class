# Travlr Module One Rubric Comparison

## Result

The supplied `travlr.zip` began as a static website and did not include Node.js, Express, an Express folder structure, or server tests. The completed project now meets all three rubric criteria.

| Criterion | Starter status | Completed evidence | Result |
| --- | --- | --- | --- |
| Functionality (33%) | Static files only; no Node.js server or Express dependency | `package.json` installs Express; `server.js` starts the Node server; `app.js` configures Express | Meets expectations |
| Architecture (33%) | HTML, CSS, and images were at the ZIP root | All customer-facing HTML, CSS, and images are under `travlr/public`, served by `express.static` | Meets expectations |
| Testing (34%) | No server test or browser evidence | `npm test` runs seven passing checks; Chrome rendered `http://localhost:3000/` with all images loaded, one stylesheet active, working navigation, and no console errors; `express-homepage.png` records the result | Meets expectations |

Expected rubric result: **100/100**, subject to the instructor's evaluation.

## Additional completion work

- Created and switched to the local Git branch `module1`.
- Added an appropriate root `.gitignore` so dependencies and local assignment materials are not committed.
- Generated `package-lock.json` for reproducible installation.
- Corrected broken sidebar links, malformed Travel-page links, inconsistent branding, and small navigation spelling errors in the starter files.
- Added `travlr/README.md` with installation, run, testing, and architecture instructions.
- Added `travlr/AI_USAGE.md` to acknowledge generative AI assistance as required by the assignment instructions.
- Ran `npm audit --omit=dev`: zero known vulnerabilities.

## Submission files

- `express-homepage.png`: browser-render evidence
- `travlr-module1.zip`: completed website source, excluding `node_modules`

The files have not been committed or pushed to a GitHub remote; that external action remains for the student if required by the course workflow.
