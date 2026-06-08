## Learned User Preferences

- Use English for all user-facing UI text, labels, and locale formatting (en-US).
- Mermaid diagrams in docs should use plain readable labels without `<code>` tags or route paths in nodes.
- LSP navigation diagrams should show admin panel main menu and CRUD sub-navigation together.
- Do not add `url` to `schema.prisma` for third-party ERD tools; use a temporary Prisma v6 copy with a placeholder URL instead.

## Learned Workspace Facts

- Project: XStock Inventory Management — student Petrus Handika, 4KA24, NPM 11122114.
- Stack: Next.js 16 client (:3000), Express + Prisma 7 API (:3001), PostgreSQL.
- Prisma 7: `DATABASE_URL` belongs in `server/prisma.config.ts`, not in `schema.prisma`.
- Seed login credentials: admin / admin (not admin123).
- Admin-only app — no public client pages; flow is Login → Dashboard with sidebar shell.
- Business Rule 11: stock status Active / Normal / Low Stock / Out of Stock from minStock ± 5 thresholds.
- Business Rule 12: list pages use `ExportReportMenu` for CSV, Excel, PDF, and Print exports.
- LSP documentation lives at `docs/LSP.md` (three sessions aligned to Web Programmer competency).
- `.cursor` directory is gitignored.
