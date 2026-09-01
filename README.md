# Portfolio — Viery Naoussi Djoumessi

Site personnel : recherche en transport optimal et mécanismes d'appariement,
projets de l'École 42 Paris, CV et notes techniques.

**En ligne :** <https://vnaoussi-djoumessi.com>

## Stack

- [Astro](https://astro.build/) 4 (génération statique) + MDX
- Tailwind CSS 3 + DaisyUI 4 (thème sur-mesure `viery`)
- Police [Inter](https://rsms.me/inter/) auto-hébergée (`@fontsource-variable/inter`)
- Déploiement : build statique servi par nginx, exposé via Cloudflare Tunnel

## Développement

```bash
npm install
npm run dev      # serveur local sur http://localhost:4321
npm run build    # génère dist/
npm run preview  # sert dist/ localement
```

## Structure

| Chemin | Rôle |
| --- | --- |
| `src/site_config.ts` | Contenu centralisé (contact, compétences, projets, publications, CV) |
| `src/pages/` | Pages : accueil, `cv`, `projects`, `research`, `blog`, `sitemap.xml` |
| `src/content/blog/` | Articles du blog (Markdown) |
| `src/components/` | Composants de mise en page |
| `tailwind.config.cjs` | Définition du thème `viery` |
| `public/` | Fichiers servis tels quels (PDF, `robots.txt`) |
