# BlackLine — Plans & Technical Docs

Este directorio documenta las decisiones de diseño técnico, mejoras planificadas y el estado de las features del proyecto BlackLine.

## Estructura

```
docs/
└── plans/
    ├── README.md                        ← este archivo (índice)
    ├── match-cities-catalog.md          ← Catálogo de ciudades MX + mejora del flujo Match
    └── [futuras features].md
```

## Available skills that write here

| Skill | Command | What it creates |
|-------|---------|-----------------|
| App Audit | `/app-audit` | `app-audit-YYYY-MM-DD.md` — broken flows, gaps, severity-coded issues |
| Feature Ideas | `/feature-idea [area]` | `feature-ideas-[area]-YYYY-MM-DD.md` — prioritized ideas with impact/effort |
| Module Plan | `/module-plan [name]` | `module-[name]-YYYY-MM-DD.md` — full implementation blueprint |

## Convenciones

- Cada plan describe **qué se construye**, **por qué**, y **cómo**.
- Los planes se vinculan a tickets Jira cuando aplique (prefijo `BL-XXX`).
- Una vez implementada la feature, el plan se marca como **[IMPLEMENTADO]** y se archiva.

---

*Último update: 2026-05-01*
