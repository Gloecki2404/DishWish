# Essensplan – Home-Assistant-Integration

Custom Integration `custom_components/essensplan` (Python) + Lovelace-Karten `frontend/` (TypeScript/Lit).
**Spezifikation, Entscheidungen, Phasen: [PLAN.md](PLAN.md).** Vor jeder Aufgabe den relevanten Abschnitt lesen. Entscheidungen aus PLAN.md Abschnitt 2 nicht ohne Rückfrage ändern.

## Arbeitsweise
- Eine Phase pro Session („Setze Phase N aus PLAN.md um“). Zuerst die Prüfpunkte dieser Phase (PLAN.md Abschnitt 15) gegen aktuelle Doku/Quellcode klären.
- Erledigte Aufgaben in PLAN.md abhaken. Abweichungen vom Plan dort mit Begründung notieren.
- Ende jeder Phase: Tests, Lint und Build grün, dann einen Commit vorschlagen.

## Befehle (PowerShell, vom Projektordner aus)
- Dev-HA: `docker compose -f dev/docker-compose.yml up -d homeassistant` → http://localhost:8123
- Nach Python-Änderung: `docker compose -f dev/docker-compose.yml restart homeassistant`
- Backend-Tests: `docker compose -f dev/docker-compose.yml run --rm test pytest`
- Backend-Lint: `docker compose -f dev/docker-compose.yml run --rm test ruff check .` und `… ruff format --check .`
- Frontend: `npm --prefix frontend ci` | `run build` | `run dev` | `run lint` | `run typecheck` | `test`

## Konventionen
- Python: im Event-Loop nur async. Blockierendes I/O ausschließlich im Executor: DB nur über den DB-Thread in `store.py`, Pillow über `hass.async_add_executor_job`. Typ-Hints, ruff. Moderne HA-Muster: `entry.runtime_data`, `has_entity_name`, `translation_key`.
- Keine neuen Abhängigkeiten (Python oder npm) ohne Rückfrage.
- Frontend: nur HA-CSS-Variablen. Keine HA-internen Elemente außer `ha-icon` (und ggf. `ha-form` im Editor). Alle UI-Texte über `i18n.ts` (de + en).
- Bezeichner und Code-Kommentare auf Englisch, knapp. UI-Texte und Doku auf Deutsch/Englisch.
- Keine echten Rezeptseiten (z. B. Chefkoch-HTML) als Test-Fixtures, nur synthetische.
