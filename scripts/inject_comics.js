/**
 * Inject Meridian cast comic strips into Labs 00–15.
 * Run: node scripts/inject_comics.js
 */
const fs = require("fs");
const path = require("path");

function face(who) {
  const meta = {
    elena: ["Elena", "Architect"],
    marcus: ["Marcus", "COO"],
    alex: ["Alex", "Analyst"],
    jordan: ["Jordan", "Engineer"],
    sam: ["Sam", "Compliance"],
    nora: ["Nora", "Partner"],
    dev: ["Dev", "QA"]
  }[who];
  return `<div class="comic-who">
        <div class="comic-face ${who}" role="img" aria-label="${meta[0]}"></div>
        <div><span class="comic-name">${meta[0]}</span><span class="comic-role">${meta[1]}</span></div>
      </div>`;
}

function panel(who, html) {
  return `<figure class="comic-panel">
      ${face(who)}
      <blockquote class="comic-bubble">${html}</blockquote>
    </figure>`;
}

function strip(id, kicker, title, cols, panels, caption) {
  const rowClass = cols === 3 ? "three" : cols === 1 ? "" : "two";
  return `    <section class="comic-strip" id="${id}" aria-label="${title.replace(/"/g, "")}">
      <p class="comic-kicker">${kicker}</p>
      <h2 class="comic-title">${title}</h2>
      <div class="comic-row ${rowClass}">
${panels.map((p) => "        " + p.replace(/\n/g, "\n        ")).join("\n")}
      </div>
      ${caption ? `<p class="comic-caption">${caption}</p>` : ""}
    </section>

`;
}

/** labId -> array of HTML strip sections (injected after first .ba-grid) */
const comics = {
  "00": [
    strip(
      "comic-00",
      "Episode 00 · Monday morning",
      "Marcus wants a home. Elena pours concrete.",
      2,
      [
        panel("marcus", "We have CSV chaos and three Slack channels named “final_v2”. Where does Meridian’s data <em>live</em>?"),
        panel("elena", "In one building: <code>MERIDIAN_BANK</code>. Rooms for bronze, silver, gold. Engine <code>WH_BANK_XS</code> that sleeps when idle — Finance will thank us.")
      ],
      "Remember the building metaphor — schemas are rooms, warehouse is the engine."
    )
  ],
  "01": [
    strip(
      "comic-01a",
      "Episode 01 · Vault vs window",
      "Alex finds SSN. Sam finds Elena.",
      3,
      [
        panel("alex", "I just SELECT * from clients for a board deck… wait. Is that a social security number?!"),
        panel("sam", "If Alex can see SSN, Meridian fails the exam with the regulator. Elena — doors. Now."),
        panel("elena", "Job badge <code>FR_ANALYST</code>. Key-ring <code>AR_SILVER_CURATED_READ</code>. Window view — not the vault. And Alex: hang up your secondary coats.")
      ],
      "Secondary roles = wearing two coats. USE SECONDARY ROLES NONE hangs the lab-admin coat."
    ),
    strip(
      "comic-01b",
      "Same day · proof",
      "Elena makes Alex prove it.",
      2,
      [
        panel("alex", "UI says I’m FR_ANALYST. Vault still opens? Magic?"),
        panel("elena", "Not magic — leftovers. Run <code>USE SECONDARY ROLES NONE</code>, then try again. Theater isn’t least privilege.")
      ]
    )
  ],
  "02": [
    strip(
      "comic-02a",
      "Episode 02 · Midnight rebuild",
      "Jordan’s full refresh vs Elena’s bookmark",
      2,
      [
        panel("jordan", "Nightly we rebuild the whole ledger. Five million rows. Forty-five minutes. Credits cry."),
        panel("elena", "Stop re-reading the whole book. Put a <strong>watermark</strong> on <code>updated_at</code> — tonight only process pages after last night’s bookmark. That’s dbt incremental MERGE.")
      ],
      "Watermark = bookmark. Incremental = only new/changed pages."
    ),
    strip(
      "comic-02b",
      "Whiteboard",
      "Alex asks the dangerous question",
      2,
      [
        panel("alex", "So incremental is always cheaper and better?"),
        panel("elena", "No. Tiny tables, broken watermarks, weird deletes — full refresh can be safer. “Incremental always” is how juniors fail interviews.")
      ]
    )
  ],
  "03": [
    strip(
      "comic-03",
      "Episode 03 · Same SELECT, two truths",
      "Sam needs email. Alex gets stars.",
      3,
      [
        panel("alex", "Why does Sam see real emails and I see <code>***@…</code> on the same table?!"),
        panel("sam", "Because I’m FR_COMPLIANCE. Masking is the glass disguise. RAP is which countries I’m allowed to walk."),
        panel("elena", "One shelf. Two policies. No US_CLIENTS / CA_CLIENTS copy-paste twins. Twins drift. Policies don’t.")
      ]
    )
  ],
  "04": [
    strip(
      "comic-04a",
      "Episode 04 · Lost COO",
      "Marcus points BI at the dock",
      2,
      [
        panel("marcus", "Alex’s board number doesn’t match Risk. Which table is “the truth”?"),
        panel("elena", "You pointed Looker at <code>BRONZE_LANDING</code> — the truck dock. Gold is <code>GOLD_MART</code>. Silver is cleaned shelves. Stop shopping in the loading bay.")
      ],
      "Bronze = dock · Silver = shelves · Gold = report wall."
    ),
    strip(
      "comic-04b",
      "Part B · Git owns the floors",
      "Jordan brings dbt to the same path",
      2,
      [
        panel("jordan", "Cool CTAS demo. In prod I’m not hand-running Elena’s worksheet every night."),
        panel("elena", "Agreed. Same floors — <code>silver_txns</code> → <code>SILVER_CURATED</code>, <code>gold_client_summary</code> → <code>GOLD_MART</code>. Folders aren’t schemas. dbt maps to floors.")
      ]
    )
  ],
  "05": [
    strip(
      "comic-05a",
      "Episode 05 · Hand-carrying",
      "Jordan’s calendar vs a notebook",
      2,
      [
        panel("jordan", "I INSERT…SELECT new txns every hour. When I’m in meetings, silver is stale."),
        panel("elena", "Stream = change notebook. Task = worker that wakes when the notebook has pages. Then SUSPEND the lab worker so credits don’t party overnight.")
      ]
    ),
    strip(
      "comic-05b",
      "Fork in the hallway",
      "Stream+task vs dynamic table",
      3,
      [
        panel("jordan", "Can’t we just use a dynamic table and delete the task?"),
        panel("elena", "Different job. DT = declare SELECT + lag, Snowflake refreshes. Stream+task = <em>you</em> write the CDC SQL and can audit every line."),
        panel("marcus", "I don’t care about the toy names. I care who owns freshness and who owns the bill.")
      ],
      "Click the Lab 05 picker — same fork, visual lanes."
    )
  ],
  "06": [
    strip(
      "comic-06",
      "Episode 06 · Night truck bay",
      "Files don’t jump into tables",
      2,
      [
        panel("jordan", "Partner dropped a CSV. Can I COPY straight into gold so Alex is happy by 8am?"),
        panel("elena", "No. Stage in <code>FILE_IN</code> first — truck bay. Then COPY into <code>BRONZE_LANDING</code>. Gold is a product, not a loading dock. Snowpipe = the bay door that opens itself.")
      ]
    )
  ],
  "07": [
    strip(
      "comic-07a",
      "Episode 07 · Board deck is dying",
      "Alex wrote SELECT *. Elena smells blood.",
      2,
      [
        panel("alex", "Board in two hours. Query crawls. Buy a bigger warehouse?!"),
        panel("elena", "First: stop <code>SELECT *</code>. You hauled three PAD columns Marcus never charts. Profile the bytes — then we talk engines.")
      ],
      "This is the CTE / filter-early moment — shrink what enters the join."
    ),
    strip(
      "comic-07b",
      "Whiteboard · the CTE talk",
      "Why filter before the join",
      2,
      [
        panel("alex", "Why wrap it in a CTE? My join to clients already works… eventually."),
        panel("elena", "Because you joined a <em>year</em> of events, then hoped. CTE <code>recent</code> keeps last 7 days first — fewer rows into the join. Same answer, less pain. That’s the habit interviewers listen for.")
      ]
    ),
    strip(
      "comic-07c",
      "Ops · no Slack resize rota",
      "Marcus asks who Alex pings at 7am",
      3,
      [
        panel("marcus", "So every board morning Alex Slacks you to ALTER SIZE?"),
        panel("elena", "Never. Board path uses <code>WH_BANK_BOARD_S</code> — auto-resume, auto-suspend. Daily work stays on XS."),
        panel("alex", "…so I just point Looker at BOARD_S and stop texting Elena. Got it.")
      ]
    )
  ],
  "08": [
    strip(
      "comic-08",
      "Episode 08 · Messy library",
      "Last 7 days was scanning a year",
      2,
      [
        panel("alex", "I filtered last 7 days. Profile still opened half the shelves?!"),
        panel("elena", "Dates were scattered across micro-partitions — random piles. <code>CLUSTER BY (EVENT_DATE)</code> re-shelves so prune can skip. Search optimization is for ID lookups — different tool.")
      ]
    )
  ],
  "09": [
    strip(
      "comic-09",
      "Episode 09 · Undo button",
      "Dev wants a twin. Marcus hears “DR.”",
      3,
      [
        panel("dev", "I need a prod-like sandbox today without breaking Alex."),
        panel("elena", "CLONE — same-account fast fork. Not geo-DR. Time Travel for yesterday’s rows. UNDROP if someone DROP TABLE’d."),
        panel("marcus", "Clone is not our disaster plan. Say that louder for the people in the back.")
      ]
    )
  ],
  "10": [
    strip(
      "comic-10",
      "Episode 10 · Partner window",
      "Nora wants data. Not a CSV dump truck.",
      2,
      [
        panel("nora", "Can you email us the ledger every Friday? Our analysts are drowning in attachments."),
        panel("elena", "Secure share + secure view — live window, minimum columns. You pay your warehouse. We don’t ship the vault. Friday dump trucks are how PII grows legs.")
      ]
    )
  ],
  "11": [
    strip(
      "comic-11",
      "Episode 11 · Region on fire",
      "Share is not DR",
      3,
      [
        panel("marcus", "We share with Nora — so we’re DR-ready, right?"),
        panel("elena", "No. If our region dies, her window dies too. Share ≠ secondary. Clone ≠ secondary. Replication + failover group + a drilled runbook = DR."),
        panel("sam", "Write RPO and RTO in numbers Marcus can take to the board — lag vs people-minutes.")
      ]
    )
  ],
  "12": [
    strip(
      "comic-12",
      "Episode 12 · Silent rename",
      "Jordan “cleaned” a column. Looker cried.",
      2,
      [
        panel("jordan", "Renamed a staging column. CI was green. Why is Alex’s tile NULL?"),
        panel("elena", "You contracted the wrong boundary. Contract <em>published</em> marts — Alex’s API — not every staging view. Slim CI still needs a fresh manifest or you’re deferring to yesterday’s fantasy.")
      ]
    )
  ],
  "13": [
    strip(
      "comic-13",
      "Episode 13 · Surprise invoice",
      "Finance forwards pain",
      3,
      [
        panel("marcus", "Who burned the weekend credits on WH_BANK_XS?!"),
        panel("elena", "ACCOUNT_USAGE will tell us — with lag. Meanwhile RM_BANK_LAB suspends at quota so next weekend can’t. BOARD_S is a separate cost center."),
        panel("jordan", "I’ll stop leaving worksheets running. …After coffee.")
      ]
    )
  ],
  "14": [
    strip(
      "comic-14",
      "Episode 14 · Interview chair",
      "No laptop. Just Elena’s mouth.",
      2,
      [
        panel("marcus", "(as interviewer) Walk me through how Meridian keeps Alex off SSN — and what breaks if you skip secondary-role NONE."),
        panel("elena", "Context → decision → proof → outcome. FR_/AR_, window view, USE SECONDARY ROLES NONE. If I blank on the coat trick, I don’t get the offer.")
      ],
      "Open each lab’s comic + Interviewer presses further. Say it out loud."
    )
  ],
  "15": [
    strip(
      "comic-15",
      "Episode 15 · 2 a.m.",
      "Who wakes dbt — hope or a DAG?",
      3,
      [
        panel("jordan", "Models are in git. Overnight gold still depends on my laptop cron. That’s… not a platform."),
        panel("elena", "CDC stays on Tasks. File → bronze → dbt silver/gold → Slack is Airflow-shaped. Don’t wrap every Task in Airflow. One writer per table."),
        panel("marcus", "When gold is late, who gets paged? Put a name on it.")
      ]
    )
  ]
};

const docs = path.join(__dirname, "..", "docs");
let n = 0;

for (const [lab, strips] of Object.entries(comics)) {
  const file = path.join(docs, `lab-${lab}.html`);
  let html = fs.readFileSync(file, "utf8");
  const block = strips.join("");

  // Remove prior injected comics
  html = html.replace(/\s*<section class="comic-strip"[\s\S]*?<\/section>\s*/g, "\n");

  if (html.includes('class="ba-grid"')) {
    html = html.replace(
      /(<\/div>\s*\n\s*)(<section class="teach"|<figure class="viz-panel"|<section class="teach cdc|<div class="story"|<article class="step")/,
      `$1${block}$2`
    );
  } else {
    console.error("no ba-grid", file);
    continue;
  }

  fs.writeFileSync(file, html);
  n++;
  console.log("comics → lab-" + lab, strips.length, "strip(s)");
}

console.log("done", n);
