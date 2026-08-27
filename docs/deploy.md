# Deploying with Docker

The portfolio ships as a single Docker image: Next.js server + Payload admin + SQLite, nothing else to install. Every GitHub **release** builds and publishes it to GitHub Container Registry:

```
ghcr.io/silkepilon/portfolio:latest      # newest stable release
ghcr.io/silkepilon/portfolio:1.2.3       # exact release (also :1.2 and :1)
```

## 1. Run it

```bash
mkdir portfolio && cd portfolio
curl -O https://raw.githubusercontent.com/SilkePilon/portfolio/main/docker-compose.yml
echo "PAYLOAD_SECRET=$(openssl rand -hex 32)" > .env
echo "SITE_URL=https://your-domain.com" >> .env
docker compose up -d
```

Open `http://<host>:3000/admin` and create the first admin user. Put a reverse proxy with TLS in front (Caddy, Traefik, nginx, Cloudflare Tunnel — anything that forwards to port 3000).

Without compose:

```bash
docker run -d --name portfolio --restart unless-stopped \
  -p 3000:3000 \
  -e PAYLOAD_SECRET="$(openssl rand -hex 32)" \
  -e SITE_URL=https://your-domain.com \
  -v portfolio-data:/data \
  ghcr.io/silkepilon/portfolio:latest
```

## 2. Persistent data

Everything that must survive upgrades is in the **`/data`** volume:

| path | contents |
| --- | --- |
| `/data/payload.db` | SQLite database — works, posts, home lists, home/pages/site settings, admin users, contact messages |
| `/data/media/` | uploaded images and videos |

Back up by copying the volume (`docker run --rm -v portfolio-data:/data -v "$PWD":/backup busybox tar czf /backup/portfolio-data.tgz -C /data .`). Nothing else in the container holds state.

## 3. Environment variables

| variable | required | default | notes |
| --- | --- | --- | --- |
| `PAYLOAD_SECRET` | **yes** | — | signs admin sessions; the container refuses to start without it |
| `SITE_URL` | recommended | `http://localhost:3000` | public URL used for absolute metadata/share links. Must be the same origin you open `/admin` on — the live-preview pane is same-origin checked, so a mismatch leaves it frozen on the last saved version |
| `DATABASE_URI` | no | `file:/data/payload.db` | libSQL URL; keep it on the volume |
| `MEDIA_DIR` | no | `/data/media` | upload directory |
| `PORT` | no | `3000` | listening port inside the container |
| `NEXT_PUBLIC_FORM_ENDPOINT` | no | — | **build-time only** — set as `--build-arg` when building your own image to send contact-form posts elsewhere instead of the CMS inbox |

## 4. Upgrading

```bash
docker compose pull && docker compose up -d
```

Pin a major (`:1`) or exact version (`:1.2.3`) in `docker-compose.yml` if you prefer controlled upgrades. The container applies pending SQLite schema migrations (`src/migrations/`) on start, so upgrades need no manual step.

> Changing collections/globals in code? Run `npm run payload -- migrate:create <name>` and commit the new file in `src/migrations/` before releasing — the image will not start correctly against an old database otherwise.

## 5. Placeholder content (optional)

The image does not include the seed script. The site renders the template's static placeholder content until you add your own in `/admin`. To import the placeholder content — works, posts, home-page copy, the home lists (services/testimonials/clients/awards/FAQ), site settings and the showcase video — into a fresh volume, run the seed from a source checkout against that volume:

```bash
docker compose stop
DATABASE_URI=file:/var/lib/docker/volumes/portfolio_portfolio-data/_data/payload.db \
MEDIA_DIR=/var/lib/docker/volumes/portfolio_portfolio-data/_data/media \
npm run seed
docker compose start
```

## 6. Releasing a new version

1. Merge to `main` (CI runs typecheck + tests).
2. Create a GitHub release with a semver tag, e.g. `v1.4.0` (`gh release create v1.4.0 --generate-notes`).
3. The **Docker image** workflow builds the image (layer cache in GitHub Actions, ~3–5 min) and pushes `1.4.0`, `1.4`, `1` and `latest`. Pre-releases get version tags but not `latest`.

Manual builds from the Actions tab (`workflow_dispatch`) push `<branch>` and `sha-<short>` tags — handy for testing a branch before releasing.

To add `linux/arm64`, change `platforms:` in `.github/workflows/docker.yml` to `linux/amd64,linux/arm64` and add `docker/setup-qemu-action@v3` before buildx (emulated builds take ~4× longer).

## 7. Building locally

```bash
docker build -t portfolio .
docker run --rm -p 3000:3000 -e PAYLOAD_SECRET=dev -v portfolio-data:/data portfolio
```

The image is a three-stage build (`deps` → `build` → `run`): Next.js `output: 'standalone'` traces only the files the server needs, so the runtime layer contains no `node_modules` install, no source, no dev tooling, and runs as the unprivileged `node` user.
