# Ksmile

Catalogue de droguerie en ligne pour le Cameroun (zone Odza et environs).  
Parcourir → panier → envoyer une demande. **Pas de paiement en ligne** : l’équipe confirme disponibilité et remise.

## Stack

- **Next.js 16** (App Router, Cache Components)
- **PostgreSQL** + **Prisma**
- **Auth.js** (admin credentials)
- **Cloudinary** (images produits + backups DB)
- **Docker Compose** (app + Postgres + backup nocturne)

## Fonctionnalités

- Catalogue public (catégories, recherche, panier, demande)
- Admin : produits, catégories, stock, demandes, import Excel
- Upload images Cloudinary
- PWA (installable sur téléphone)
- Dump Postgres quotidien vers Cloudinary (`ksmile/backups`)

## Démarrage local

Prérequis : Node 22+, Docker (Postgres), compte Cloudinary.

```bash
cp .env.example .env
# Renseigner AUTH_SECRET, ADMIN_*, CLOUDINARY_*

# Postgres local (exemple port 5439)
docker run -d --name ksmile-postgres \
  -e POSTGRES_USER=ksmile -e POSTGRES_PASSWORD=ksmile -e POSTGRES_DB=ksmile \
  -p 5439:5432 postgres:16-alpine

npm install
npx prisma db push
npm run db:seed   # admin + catalogue de démo (dev uniquement)
npm run dev
```

- Boutique : [http://localhost:3000](http://localhost:3000)
- Admin : [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Production (VPS + Docker)

```bash
cp .env.production.example .env
# Remplir secrets + AUTH_URL / NEXT_PUBLIC_SITE_URL = https://ton-domaine
# RUN_SEED=false  → pas de produits de démo (recommandé)

docker compose up -d --build
```

Services :

| Service  | Rôle |
|----------|------|
| `web`    | Next.js (standalone) |
| `db`     | PostgreSQL |
| `backup` | `pg_dump` chaque soir 23:00 (Africa/Douala) → Cloudinary |

Backup manuel :

```bash
npm run db:backup
```

Derrière un reverse proxy HTTPS (Caddy / Nginx), pointer vers le port `APP_PORT` (défaut `3000`).

## Variables d’environnement

Voir `.env.example` (local) et `.env.production.example` (VPS).

| Variable | Usage |
|----------|--------|
| `DATABASE_URL` | Connexion Postgres |
| `AUTH_SECRET` / `AUTH_URL` | Auth.js |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte admin (sync au démarrage) |
| `CLOUDINARY_*` | Images + backups |
| `RUN_SEED` | `true` = catalogue démo (dev) ; **`false` en prod** |

**Ne jamais committer `.env`.** Le dépôt est public.

## Scripts utiles

```bash
npm run dev
npm run build
npm run db:push
npm run db:seed
npm run docker:up
npm run docker:logs
npm run db:backup
```

## Licence

Projet privé / usage Ksmile. Tous droits réservés.
