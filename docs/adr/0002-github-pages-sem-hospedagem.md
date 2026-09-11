# GitHub + GitHub Pages sem hospedagem do back-end

Projeto de estudo/portfólio: o live demo roda só como front estático no GitHub Pages, sem servidor hospedado. O back-end Node + Express + SQLite vive em `backend/` para execução local e leitura de código (prova full-stack no repo). Por isso o front usa `ApiService` com fallback: tenta `fetch` na API local e, se offline, cai para seed local rico, mantendo o demo quebrado nunca.
