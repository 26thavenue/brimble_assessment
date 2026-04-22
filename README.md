# brimble_assessment

A take-home task that mirrors how we run Brimble: build a one-page deployment pipeline with Vite + TanStack, an API, Railpack builds, and Caddy ingress.

About the role
Brimble runs a PaaS on bare metal across Hetzner and DigitalOcean. Developers push code; we provision infrastructure, build, route traffic, and serve it all behind a single UI.

This is a contract role. We evaluate candidates through a scoped-down version of what we do every day: you'll build a one-pager that drives a deployment pipeline for containerised apps — built into an image with Railpack, run as a container, and fronted by Caddy.

A single UI, a single API, one pipeline. We care more about how you reason about the pieces fitting together than about polish.

Stack
Go or TypeScript (TypeScript preferred)
Vite + TanStack (Router + Query)
Caddy
Railpack
Deliverable: a public Git repository + a short README walking us through your decisions.

About our production stack
Our production platform runs on HashiCorp's stack: Nomad for orchestration, Consul for service discovery, and Vault for secrets — across bare metal.

You do not need to use Nomad for this task, and familiarity with it is not required to apply. That said, if you have hands-on experience with Nomad (or Consul/Vault), bring it up in the on-call interview — it's a meaningful bonus.

What to build
1. Frontend — one-pager UI
Built with Vite + TanStack (Router + Query). The UI should let a user:

Create a new deployment by submitting either a Git URL or an uploaded project.
See a list of deployments, their status (pending → building → deploying → running → failed), and live URL.
See the image tag that was built for each deployment.
Stream build/deploy logs live to the UI over SSE or WebSocket.
Keep it one page. No auth required. No design system required — functional is fine.

2. Backend API
TypeScript preferred, Go acceptable. Design the API surface yourself — we want to see how you think about resources, status, and log streaming. State can live in SQLite or Postgres.

3. The pipeline
Use Railpack to build the app into a container image. No handwritten Dockerfiles.
Run the container locally via Docker.
Configure Caddy to reverse-proxy a path or hostname to the running container.
Caddy is the single point of ingress. It fronts every deployment and routes traffic to the running container.

Hard requirements
These are non-negotiable. A submission that skips any of these will not be evaluated.

Runs end-to-end with `docker compose up`
The whole system — frontend, backend, Caddy, anything else — must come up with a single docker compose up on a clean machine. We'll run it on our laptops to test. Document any env vars or prerequisites in the README. Provide sensible defaults so we don't have to create external accounts to test it.

Live log streaming
Build and deploy logs must stream to the UI in real time over SSE or WebSocket. Polling a /logs endpoint does not count. Logs should be visible while the build is running, not just after it finishes, and should persist so a user can scroll back after the fact.

Brimble deploy + feedback
Separately from the main task, deploy anything on Brimble — a hello world, a portfolio page, the frontend from this task, whatever you want. We're not grading the app itself. We're grading the feedback.

Submit a link to what you deployed on Brimble, plus a short write-up (a paragraph or two) of your deploy experience — bugs you hit, friction points, confusing UI, missing features, things you'd change. Be direct. We want the honest version, not the polite version. Candidates who skip this or give empty feedback lose points.

Stuck on Brimble? Reach out to @pipe_dev on Twitter. Needing help is fine and doesn't count against you — but flag whatever you got stuck on in your feedback write-up.

What we're looking for
End-to-end works with a single docker compose up.
Logs stream live to the UI, not post-hoc.
Railpack builds produce runnable images.
Brimble deploy + honest feedback submitted.
Code is structured like you'd want to maintain it in six months — not like a hackathon.
README explains your choices, what you'd do with more time, and what you'd rip out.
What we're not looking for
Production-grade auth, multi-tenancy, or billing.
Kubernetes. Please no Kubernetes.
A pretty UI. Tailwind defaults are fine.
Exhaustive tests — a few meaningful ones beat 80% coverage of trivial code.
Bonus
Not required — don't burn time if the core isn't solid.

Rollback / redeploy a previous image tag.
Build cache reuse across deploys.
Graceful container shutdown and zero-downtime redeploys.
Interview process
Submission review — we review your repo + Brimble deploy + feedback.
Founder walkthrough — a hands-on session with one of the founders covering live debugging, system design, and a walkthrough of your submission. Familiarity with reverse proxies, container orchestration, and infra-as-code will come up.
If all goes well, we move to an offer letter.

Submission
Public GitHub repo link.
A docker-compose.yml that brings up the whole stack end-to-end on a clean machine.
README with setup instructions, architecture notes, and a 5–10 minute Loom walkthrough (optional but strongly preferred).
A sample container app (Node/Go/whatever) — either in the repo or linked.
Rough time spent, and what you'd change if you had another weekend.
Link to your Brimble deploy + written feedback on the experience.
How we score this
Hard requirements met (docker compose, streaming logs, Brimble feedback) — 30%
End-to-end works — 20%
Pipeline design (Railpack build, container runtime, Caddy routing) — 20%
Code quality & project structure — 15%
Frontend UX and API design — 5%
Brimble feedback quality — 5%
README + reasoning — 5%
