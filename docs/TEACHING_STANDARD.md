# Teaching standard (every lab)

Students can copy-paste and finish without learning. **That is a fail.** Prefer **seeing** over theory tables.

This course exists so Elena clears a **Snowflake Architect + dbt** interview — not so she finishes worksheets. Basics without follow-ups is a fail.

## Required shape

1. Business problem / Solution (short)  
2. **BEFORE / AFTER** screens (`.ba-grid` + `labXX-before.jpg` / `labXX-after.jpg`) — first thing after Solution  
3. Optional extra concept art (`.viz-panel` JPG/SVG) **after** see-cards — not instead of BEFORE/AFTER  
4. **See it** cards (`.see-grid` / `.see-card`) — concrete examples, not Word/Layman/Metaphor dictionaries  
5. **Comic strips** (`.comic-strip`) — Meridian cast dialogue **throughout** the lab: opener after BEFORE/AFTER **and** a coach strip (`.comic-step`) before **every** numbered step (100% coverage). Faces from `cast-sheet.jpg`. Voices: Alex/Jordan ask like beginners; Elena always answers *why* in plain words; Marcus presses cost/risk; Sam presses compliance; Nora is the partner. Student habit: **read the coach comic → then SQL**. Source of truth: `scripts/inject_comics.js` (re-run after edits). Cast bible: `docs/CAST_VISUAL.md`.  
6. Contrast visuals like Lab 03 “two different problems” / `.flow-pipeline` when ideas get mixed up  
7. **Small code chunks** (≤12 lines) — *what / why / what you should see*  
8. **Interviewer presses further** (`.drill-wrap` / `#interview-drill`) — **required**, before Elena wrap-up  
9. Elena wrap-up  

## Interviewer presses further (required)

After the student can run the lab, an interviewer will dig. Every lab must include **4–5 hard follow-ups** with spoken Elena answers (`<details class="drill">`).

Cover at least:

- Tradeoffs / when **not** to use the feature  
- Failure modes & silent data/security bugs  
- Automation & ops (who gets paged? what runs without Elena?)  
- Cost / FinOps angle  
- Prod vs trial honesty  

**Agent rule:** When editing a lab, anticipate the next interviewer question yourself. Do not wait for the student to catch gaps (example: Lab 07 warehouse resize → dedicated auto-resume WH). Prefer adding the drill (+ SQL if needed) in the same change.

## Forbidden

- Giant unexplained SQL dumps  
- Long theoretical dictionaries as the main teaching device  
- Jargon with no concrete before→after example  
- Labs that stop at “happy path SQL” with no drill-down  

## Reference

- Lab 03 — BEFORE/AFTER + see-cards + “don’t mix them up”  
- Lab 02 — animated pipeline + watermark as bookmark (with examples)  
- Lab 07 — triage + `WH_BANK_BOARD_S` automation follow-up  

