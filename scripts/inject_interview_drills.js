/**
 * Injects / refreshes #interview-drill sections on Labs 00–13.
 * Run: node scripts/inject_interview_drills.js
 */
const fs = require("fs");
const path = require("path");

const drills = {
  "00": [
    ["Why give ROLE_BANK_LAB_ADMIN ownership of MERIDIAN_BANK instead of leaving everything under ACCOUNTADMIN?", "ACCOUNTADMIN is break-glass, not a daily builder. Ownership lets Elena create schemas and grant privileges without wearing the god role for every change. Prod: account grants once; day-to-day DDL under an owned platform/architect role."],
    ["Why WITH GRANT OPTION on warehouse USAGE/OPERATE to lab admin — what breaks without it?", "Lab 01 needs Elena to pass WH_BANK_XS to FR_ roles. Without GRANT OPTION she can use the warehouse but cannot grant it onward — RBAC proofs die on “insufficient privilege to grant.” Grant option is how you delegate without making everyone ACCOUNTADMIN."],
    ["When would you not put Bronze, Silver, Gold, Risk, and Utils all in one database?", "One database fits Meridian’s single domain and shared RBAC. Split when regulatory isolation, separate billing, or different replication scopes force separate buildings — not because medallion “needs” three databases. Schemas are rooms; databases are buildings."],
    ["Auto-suspend saves money — what’s the failure mode students miss?", "Too-aggressive suspend + chatty short queries = resume latency and cold-cache pain; no suspend = idle credit burn. Tune suspend separately from size. Never leave a warehouse with no suspend “because trial feels free.”"],
    ["Bootstrap as ACCOUNTADMIN then switch — how do privilege repair and trial vs prod differ?", "Trial often has one user as ACCOUNTADMIN; prod scripts account grants once (00_privilege_repair) and refuses daily build as ACCOUNTADMIN. If APPLY POLICY / EXECUTE TASK / CREATE SHARE fail later, that’s missing account grants — not a medallion bug."]
  ],
  "01": [
    ["Why FR_/AR_ instead of granting SELECT on BRONZE_LANDING directly to FR_ANALYST?", "Direct grants become spaghetti every time a table is added. Access roles are key-rings: hang USAGE/SELECT once, clip rings onto jobs. When CLIENTS grows, grant the AR once — don’t reopen every FR. Interviewers want maintainability, not “we use RBAC.”"],
    ["Alex’s UI shows FR_ANALYST but the vault still opens — what failed?", "Secondary roles. Snowsight kept ROLE_BANK_LAB_ADMIN or ACCOUNTADMIN active, so privileges were the union. USE SECONDARY ROLES NONE, confirm CURRENT_SECONDARY_ROLES(), then vault fails and V_CLIENT_DIRECTORY still works. Without NONE you’re demoing theater."],
    ["Masking uses CURRENT_ROLE() as primary — how do secondaries interact with table grants?", "Table access unions secondaries; policy evaluation keys off primary role. Alex can “look like” FR_ANALYST and still open the vault via a secondary — and confuse masking proofs. Every FR_ proof is USE ROLE then USE SECONDARY ROLES NONE."],
    ["Why a view for Alex instead of column grants on CLIENTS?", "Column grants still leave Alex on the vault object and don’t scale to joins. V_CLIENT_DIRECTORY is a deliberate window: no SSN path, owned in SILVER_CURATED. When Sam needs row-level audit on the same shelf, Lab 03 policies beat another shadow table."],
    ["Production multi-account: who owns FR_ creation vs AR grants?", "Platform/IAM owns FR lifecycle tied to IdP groups; data owners own AR contents and which FR gets which ring. Trial collapses both under lab admin — call that out so you don’t imply one person owns IAM forever."]
  ],
  "02": [
    ["When is full refresh cheaper or safer than incremental MERGE?", "Small dimensions, broken watermarks, late deletes you don’t model, or schema-breaking rebuilds. Incremental wins on growing TXN_EVENTS; full refresh wins when the table is tiny or the MERGE contract is wrong. “Incremental always” is a buzzword fail."],
    ["Watermark on updated_at skips a late-corrected row — failure mode and fix?", "Source corrected order_id 1001 but updated_at didn’t move — MERGE never re-reads it. Fix: trustworthy change signal with Jordan, periodic lookback window, or full refresh for that model — not “run dbt harder.”"],
    ["unique_key MERGE vs append-only — when do you refuse MERGE?", "If grain isn’t stable or you need immutable audit history, MERGE upserts hide the past. Board facts want current status per order_id; compliance event logs often append. Wrong unique_key duplicates or silently overwrites."],
    ["Why not keep the watermark only in a Snowsight worksheet outside dbt?", "Then CI, Slim CI, and docs don’t own the contract — worksheets drift from prod. dbt incremental + unique_key keeps MERGE policy in git. WH_BANK_XS just executes it."],
    ["Does incremental always reduce credits?", "Usually less scan — but a bad watermark (full table every run) or huge MERGE join can cost more than a disciplined full refresh. Prove Day-2 MERGE with new rows + status change — evidence, not hope."]
  ],
  "03": [
    ["Why one CLIENTS_GOV with masking + RAP instead of US_CLIENTS and CA_CLIENTS tables?", "Shadow copies drift and double the governance surface. Policies centralize rules in RISK_CTRL; Alex and Sam run the same SELECT and CURRENT_ROLE() changes the answer. Physical split only when law demands separate accounts — not laziness."],
    ["RAP filters countries; masking hides email — what breaks if you only do one?", "Masking alone still leaks out-of-scope rows’ existence; RAP alone still shows full email for allowed countries. Meridian needs both: entitlement + mask unless FR_COMPLIANCE. Complementary controls, not “we have governance.”"],
    ["Can a secure view replace RAP for Alex?", "A view can hardcode WHERE country IN (…) but every path must use it and engineers recreate bypass tables. RAP binds to the table so forgetful SELECT * still filters. Views trim columns for shares (Lab 10); RAP is role-driven row entitlement."],
    ["Why not grant APPLY MASKING/ROW ACCESS to FR_DATA_ENGINEER?", "Policy apply is a loaded gun; Jordan loading TXN_EVENTS shouldn’t rewire Sam’s rules. Lab admin or a security role applies; FR_COMPLIANCE may own entitlement data. Trial collapses roles — prod separates apply from load."],
    ["Secondary roles NONE again — why do masking demos lie without it?", "Policies key off primary CURRENT_ROLE(); table privilege still unions secondaries. You can get “masked but shouldn’t see the table” or unmasked via lab-admin secondary. NONE makes the FR_ badge the only coat in the room."]
  ],
  "04": [
    ["What belongs in BRONZE_LANDING that must never be Alex’s default path?", "As-landed PII and raw events — CLIENTS vault, unvalidated TXN_EVENTS. Alex reads SILVER_CURATED windows and GOLD_MART tiles. Bronze is Jordan’s dock; promoting raw to Finance is a regulator story."],
    ["When would you skip Gold and let Finance query Silver?", "Early product, few consumers, metrics still changing — Gold is ceremony. Once Marcus’s KPIs stabilize, GOLD_MART freezes grain and stops Looker from re-implementing risk logic on Silver. Don’t invent Gold to “complete medallion.”"],
    ["Data Vault vs medallion — answer without dogma?", "Medallion is landing → curated → mart for Meridian’s speed. Vault shines when many sources need stable hubs/links and audit historization. Vault inside Silver if source churn is brutal — don’t rename schemas to HUB_ for vocabulary points."],
    ["Failure mode of “everyone has USAGE on MERIDIAN_BANK”?", "Database USAGE isn’t table SELECT — but over-granting schema USAGE plus future grants leaks new Bronze tables. Pair medallion with AR_BRONZE_LANDING_READ vs AR_SILVER_CURATED_READ; colors without AR boundaries are cosplay."],
    ["Multi-account: replicate all three layers or only Gold?", "DR follows the recovery story (Lab 11) — often Silver+Gold or whole MERIDIAN_BANK. Replicating Bronze alone doesn’t save Alex; sharing Gold alone doesn’t help Jordan rebuild. Pick objects by RPO/RTO, not by color names."]
  ],
  "05": [
    ["Streams+tasks vs Dynamic Tables vs dbt — pick for Meridian and when you’d refuse each.", "Stream+task for near-real-time BRONZE→SILVER CDC with explicit control (and SUSPEND so credits don’t burn). Dynamic Tables for declarative lag. dbt for governed batch marts, tests, Slim CI. Refuse tasks left resumed forever in a demo; refuse DT for heavy procedural merge; refuse dbt for sub-minute risk ticks."],
    ["Stream offsets advance on consumption — silent data-loss mode?", "Ad-hoc SELECT from the stream (or messy partial consume) can advance offsets outside the task. Production: task owns INSERT…SELECT from the stream; don’t “peek” the stream in worksheets. Monitor STREAM_HAS_DATA and task history for lag."],
    ["Why SUSPEND the lab task — what does prod do instead?", "A resumed task still wakes warehouses; leaving it running burns trial credits. Prod keeps it resumed with WHEN STREAM HAS DATA, alerting on failures, warehouse auto-suspend. Suspend is a lab seatbelt, not the architecture."],
    ["Can Dynamic Tables replace RAP/masking on Silver?", "No — DT moves data; policies govern reads. You can DT into a governed table and still attach RAP. Pipeline ≠ security."],
    ["Cost comparison in one sentence?", "Tasks bill warehouse runtime per fire; DTs bill refresh compute to meet TARGET_LAG; dbt bills WH_BANK_XS per run — pick the freshness you can afford and measure lag; don’t stack all three on the same grain."]
  ],
  "06": [
    ["COPY vs Snowpipe vs external tables — when is pipe wrong?", "Snowpipe for continuous FILE_IN landings. Batch COPY for controlled backfills. External tables for query-in-place exploration, not Meridian’s Bronze dock of record. Pipe without file format/error handling just automates garbage."],
    ["What fails if FILE_IN stage grants are wide open to FR_ANALYST?", "Analysts can LIST/GET raw files with PII before policies exist — stage is another vault. Stage privileges stay with load roles; Alex reads SILVER/GOLD. Share publishes views, not stage URLs."],
    ["Snowpipe “exactly once” — what still duplicates in BRONZE_LANDING?", "Redelivered files with new names, or COPY without idempotent discipline, insert again. Pipe dedupes same-file metadata; it doesn’t make your business key unique. Downstream MERGE/dedupe (Lab 02) still matters."],
    ["Trial vs prod loading — what do you refuse to call “done”?", "Hardcoded keys in worksheets, public buckets, ACCOUNTADMIN as pipe owner. Prod: storage integrations, least-privilege pipe owner, error notification. Trial user-stage demos are teaching aids — say the gap out loud."],
    ["Why land in BRONZE_LANDING instead of COPY straight to GOLD_MART?", "You lose replay, as-landed audit, and the ability to rebuild Silver when rules change. Gold is a product; Bronze is evidence. Skipping Bronze for “speed” puts Finance on brittle extracts."]
  ],
  "07": [
    ["Profile shows high bytes scanned — why is ALTER WAREHOUSE … SIZE the wrong first move?", "Size multiplies the same bad plan. Fix projection, sargable filters, filter-before-join; prove bytes/partitions; then route heavy board jobs to WH_BANK_BOARD_S. On-call ALTER SIZE is a war-room tactic, not an operating model."],
    ["Users will run the board query again — do they ping Elena to resize every time?", "No. Snowflake does not auto-change one warehouse’s size per query. Give the board workload WH_BANK_BOARD_S with AUTO_RESUME/AUTO_SUSPEND; point Alex’s BI / FR_ANALYST at it. It wakes on query and sleeps idle. Daily work stays on WH_BANK_XS."],
    ["Auto-resume on WH_BANK_BOARD_S — cost/SLA tradeoff?", "First query pays resume latency; idle doesn’t burn. Failure mode: BOARD_S with no auto-suspend, or every ad hoc query pointed at BOARD_S so XS discipline dies. Route by workload class."],
    ["Multi-cluster vs bigger warehouse — when is each wrong?", "Multi-cluster = concurrency (many Alexes queuing). Larger size = one fat query needing more CPU/memory. Scaling out won’t fix SELECT * over a year of BIG_EVENTS; scaling up won’t fix 50 concurrent dashboards on XS."],
    ["Spill to remote storage in Profile — what do you say next?", "Memory pressure from wide rows or bad joins — tighten columns, pre-aggregate, maybe bigger WH for that job class. Spill means SQL/WH pairing is wrong; clustering (Lab 08) helps pruning, not magic anti-spill."]
  ],
  "08": [
    ["CLUSTER BY (EVENT_DATE) vs Search Optimization — how do you choose?", "Date-window aggregates on BIG_EVENTS → clustering for micro-partition pruning. Point lookups on txn_id → search optimization. Clustering on a high-cardinality ID wastes credits; search opt on “last 7 days” is the wrong tool."],
    ["When do you refuse to cluster?", "Tiny tables, filters that never hit the cluster key, or write-heavy tables where recluster cost exceeds read savings. Poor SYSTEM$CLUSTERING_INFORMATION plus Profile showing no pruning → don’t set cluster and pray."],
    ["Does clustering replace a good WHERE clause?", "No — pruning needs sargable predicates on the clustered expression. Wrapping EVENT_DATE in functions leaves shelves scanned. Lab 07 SQL hygiene still comes first."],
    ["Automatic clustering cost — honest FinOps line?", "Background maintenance burns credits as DML lands. Enable when Profile proves repeated partition thrash on a hot path; avoid on cold archives. Marcus hears “maintenance tax vs scan tax,” not “Snowflake optimizes itself.”"],
    ["Multi-key CLUSTER BY (EVENT_DATE, COUNTRY) — when does that backfire?", "When queries don’t co-filter that way — you pay recluster for a key nobody uses. Lead with the selective predicate in real workloads; don’t invent composites from ER diagrams."]
  ],
  "09": [
    ["Time Travel vs UNDROP vs CLONE vs replication — one wrong-tool story each.", "TT: table exists, need yesterday’s rows. UNDROP: someone DROP TABLE. CLONE: Dev’s same-account QA fork. Replication: region/account loss. Using clone as DR, or TT as geo-failover, is the classic fail."],
    ["Retention failure mode nobody mentions until prod?", "Temporary/transient tables and short DATA_RETENTION_TIME_IN_DAYS shrink UNDROP/TT windows. Fail-safe isn’t self-serve. Set retention deliberately on SILVER/GOLD; don’t promise 90-day undo on a 1-day default."],
    ["Zero-copy clone — when does storage cost show up?", "Day one shares micro-partitions; Dev writes and prod churn diverge and bill growth. Clone isn’t free forever, and isn’t cross-account for Nora. QA speed — not partner delivery or DR."],
    ["AT (OFFSET => …) after a bad UPDATE — why not always UNDROP?", "UNDROP restores a dropped object; a bad UPDATE leaves the table up. Point-in-time SELECT or CTAS … AT restores the good version. Pick the tool by what broke."],
    ["Trial vs Enterprise Time Travel depths — what do you say?", "Max retention depends on edition — confirm before promising 90-day TT. Architecture answer is retention policy + tested restore runbook, not a number from a blog."]
  ],
  "10": [
    ["Why SECURE view V_SHARE_TXNS instead of sharing the base table?", "Secure hides definition and forces the trimmed column list — no BRONZE_LANDING vault, no join logic leakage. Sharing base tables invites SELECT * of tomorrow’s PII. Least columns on a secure view is the partner contract."],
    ["Who pays compute when Nora queries the share?", "Nora — consumer warehouse in her account. Live data, Meridian keeps provider control, partner pays scans. Failure mode: Meridian running Nora’s reports on WH_BANK_XS “as a courtesy” and eating the bill."],
    ["Share revoked — what still hurts?", "Cached extracts Nora already pulled, and any insecure objects once shared. Governance is ongoing: column review, secure view, CREATE SHARE discipline, no “temporary” share of CLIENTS. Clone is wrong here — same-account QA, not cross-org."],
    ["Masking on provider objects — what does Nora see?", "Don’t assume her roles map to FR_COMPLIANCE. Share only non-PII txn fields so we don’t rely on her role names matching ours. Cross-account role mapping is designed explicitly, not inherited from Lab 03."],
    ["Trial limitation you’d call out?", "Adding Nora’s real account locator and validating consume often isn’t available on personal trial. SHOW shares/grants locally, then production completes with consumer smoke tests — same honesty as Lab 11 replication."]
  ],
  "11": [
    ["“We share with Nora, so we’re DR-ready” — dismantle it.", "Share is cross-account read of live provider objects; if Meridian’s region is down, Nora’s window dies too. DR needs replication/failover groups and a promotion runbook. Share ≠ secondary; clone ≠ secondary."],
    ["RPO vs RTO with Meridian numbers — how do you speak to Marcus?", "RPO is replication lag — how stale secondary MERIDIAN_BANK might be. RTO is people+steps: promote, repoint apps, smoke WH_BANK_XS, validate Gold. Small RPO with untested 4-hour manual RTO is still a board failure."],
    ["What do you refuse to replicate, and why?", "Maybe skip ephemeral junk and huge Bronze cold history if RTO only needs Silver+Gold — but document the rebuild path. Replicating everything blindly burns cost; replicating only share metadata helps nobody."],
    ["Clone for Dev vs share vs replication — three sentences.", "Clone: same-account, zero-copy QA. Share: partner consume, not failover. Replication: cross-region/account continuity with lag and promotion. Mixing them is how architects sound confident and design wrong."],
    ["Trial can’t do org-admin replication — credible interview close?", "Prove discipline with the SHOW/readiness checks you can run, then describe the production runbook: failover group, refresh cadence → RPO, drilled promotion → RTO. Don’t pretend a personal trial failover is a completed DR program."]
  ],
  "12": [
    ["Why contract fct_orders_incremental but not every stg_ model?", "Staging is an internal translator; published marts are Alex/Looker’s API. Contracting every stage slows the team without protecting consumers. Contract the boundary where silent rename becomes a NULL board tile."],
    ["Contract enforced — what still breaks Alex?", "Semantic drift: same column name/type, wrong grain or business meaning; or updated_at “ok” but source stops updating it. Contracts catch schema breaks; tests and ownership catch meaning breaks."],
    ["Slim CI state:modified+ with --defer — failure if manifest is stale?", "You defer to yesterday’s prod graph and miss broken upstream changes, or under-build and ship green CI that fails in prod. Manifest freshness is part of the pipeline contract — not an optional flag."],
    ["When do you refuse Slim CI and run a fuller build?", "Cross-cutting macro changes, shared staging refactors, or release trains where modified+ is known-blind. Slim CI is PR cost control; release gates can still full-build critical marts."],
    ["How do contracts interact with Lab 02 incremental?", "If updated_at or order_id type drifts, incremental MERGE and Alex’s “last refresh” both break — contract makes that a CI failure. The watermark column belongs in enforced YAML, not a wiki comment."]
  ],
  "13": [
    ["ACCOUNT_USAGE empty for “this morning’s spike” — what do you tell Finance?", "Views lag about one to three hours — empty isn’t “SQL wrong.” Re-pull WAREHOUSE_METERING_HISTORY later and use QUERY_HISTORY for expensive statements once visible. Don’t promise live pennies from ACCOUNT_USAGE alone."],
    ["Why ACCOUNTADMIN for metering/monitors then back to ROLE_BANK_LAB_ADMIN?", "Billing views and resource monitors are account-scoped; daily modeling isn’t. Separating “read the bill / set brakes” from “build Silver” is the privilege story — same pattern as Lab 00."],
    ["NOTIFY at 75% vs SUSPEND at 100% — when is notify-only wrong?", "Notify still lets a runaway finish and blow the weekend. Marcus asked for a hard brake — SUSPEND at quota. Notify-only when killing WH mid-board-refresh is worse than an email."],
    ["Resource monitor suspend — operational failure you plan for?", "Legitimate month-end jobs hit the cap and dashboards die. Size quota to workload, alert at 75%, documented reset owner, separate BOARD_S monitors so a lab spike doesn’t freeze the board path."],
    ["Metering by warehouse vs QUERY_HISTORY — attribute to teams?", "Warehouse first (WH_BANK_XS vs WH_BANK_BOARD_S as cost centers), then QUERY_HISTORY for who/role/SQL — Profile closes the loop (Lab 07). Tags/naming beat archaeology; monitors stop bleeding while engineering removes the scan."]
  ]
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSection(lab, items) {
  const details = items
    .map(
      ([q, a], i) => `      <details class="drill">
        <summary><strong>Q${i + 1}.</strong> ${esc(q)}</summary>
        <p class="drill-say"><strong>Say:</strong> ${esc(a)}</p>
      </details>`
    )
    .join("\n");

  return `    <section class="teach drill-wrap" id="interview-drill" aria-label="Interviewer presses further">
      <h2>Interviewer presses further — say these out loud</h2>
      <p>
        Basics got you into the room. Cover each answer <em>before</em> you open it.
        If you blank here, an Architect + dbt interviewer will know.
      </p>
${details}
    </section>

`;
}

const docs = path.join(__dirname, "..", "docs");
let updated = 0;

for (const [lab, items] of Object.entries(drills)) {
  const file = path.join(docs, `lab-${lab}.html`);
  let html = fs.readFileSync(file, "utf8");
  const section = buildSection(lab, items);

  if (html.includes('id="interview-drill"')) {
    html = html.replace(
      /    <section class="teach drill-wrap" id="interview-drill"[\s\S]*?<\/section>\s*/m,
      section
    );
  } else if (html.includes('<div class="soundbite">')) {
    html = html.replace('<div class="soundbite">', section + '    <div class="soundbite">');
  } else {
    console.error("No insert point:", file);
    continue;
  }

  fs.writeFileSync(file, html);
  updated++;
  console.log("updated lab-" + lab);
}

console.log("done", updated);
