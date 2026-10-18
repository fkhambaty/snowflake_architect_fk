/**
 * Meridian comics throughout labs — opener + a coach strip before each step.
 * Plain language: Alex asks, Elena explains WHY. Run: node scripts/inject_comics.js
 */
const fs = require("fs");
const path = require("path");

const META = {
  elena: ["Elena", "Architect — explains why"],
  marcus: ["Marcus", "COO — business pressure"],
  alex: ["Alex", "Analyst — still learning"],
  jordan: ["Jordan", "Engineer — builds pipelines"],
  sam: ["Sam", "Compliance — protects data"],
  nora: ["Nora", "Partner — needs a safe window"],
  dev: ["Dev", "QA — needs a safe copy"]
};

function face(who) {
  const [n, r] = META[who];
  return `<div class="comic-who">
        <div class="comic-face ${who}" role="img" aria-label="${n}"></div>
        <div><span class="comic-name">${n}</span><span class="comic-role">${r}</span></div>
      </div>`;
}

function panel(who, html) {
  return `<figure class="comic-panel">
      ${face(who)}
      <blockquote class="comic-bubble">${html}</blockquote>
    </figure>`;
}

function strip({ id, kicker, title, panels, caption, mini }) {
  const cols = panels.length >= 3 ? "three" : panels.length === 1 ? "" : "two";
  const cls = mini ? "comic-strip comic-step" : "comic-strip";
  return `<section class="${cls}" id="${id}" aria-label="${title.replace(/"/g, "")}">
      <p class="comic-kicker">${kicker}</p>
      <h2 class="comic-title">${title}</h2>
      <div class="comic-row ${cols}">
${panels.map(([w, t]) => "        " + panel(w, t)).join("\n")}
      </div>
      ${caption ? `<p class="comic-caption">${caption}</p>` : ""}
    </section>`;
}

/** @type {Record<string, { open: object[], steps: Record<string, object> }>} */
const L = {};

function S(title, panels, caption) {
  return { title, panels, caption };
}

// ——— Lab 00 ———
L["00"] = {
  open: [
    {
      kicker: "Episode 00 · Start here",
      title: "Marcus is lost. Elena draws a building.",
      panels: [
        ["marcus", "I hear “data platform” and see twenty random tables. Where does Meridian’s data <em>live</em>?"],
        ["elena", "Think of a building. Database = the building name <code>MERIDIAN_BANK</code>. Schemas = rooms. Warehouse = the engine that runs when we ask questions — then sleeps so we don’t burn money."]
      ],
      caption: "If you remember only one picture today: building → rooms → engine."
    }
  ],
  steps: {
    "1": S("Why start as ACCOUNTADMIN?", [
      ["alex", "Can I just be Elena from the first click?"],
      ["elena", "Not yet. Someone has to pour the foundation. Mayor (<code>ACCOUNTADMIN</code>) creates the cheap engine and Elena’s badge — then we take the master key <em>off</em>."]
    ], "Mayor builds once. Elena runs the labs."),
    "2": S("Why a tiny warehouse?", [
      ["alex", "Why not a huge warehouse so everything is fast?"],
      ["elena", "Big engines cost more every second they’re on. We start tiny (<code>XSMALL</code>) and only go bigger when a real query proves we need it. Sleep after 60 seconds idle."]
    ], "AUTO_SUSPEND = the engine turns off when nobody is driving."),
    "3": S("Why create a special role for Elena?", [
      ["alex", "Can’t we just use ACCOUNTADMIN for everything? It’s easier."],
      ["elena", "ACCOUNTADMIN is the master key to the whole bank. You don’t wear it to make a table. Elena’s badge <code>ROLE_BANK_LAB_ADMIN</code> is for building labs — safer habit for interviews too."]
    ]),
    "4": S("Why grant CREATE ROLE / APPLY POLICY now?", [
      ["jordan", "We’re not masking anything today…"],
      ["elena", "Mayor stamps powers Elena will need in Labs 01–03 <em>before</em> you’re stuck mid-lab. Privilege repair = same idea if a stamp was missed."]
    ]),
    "5": S("Why grant the warehouse to lab admin?", [
      ["jordan", "I created the warehouse as mayor. Why grant it again?"],
      ["elena", "Creating it doesn’t auto-share it. Grant = “Elena’s badge may use this engine.” <code>WITH GRANT OPTION</code> means she can pass keys to Alex later."]
    ]),
    "6": S("Why give Elena the database?", [
      ["marcus", "Who owns MERIDIAN_BANK?"],
      ["elena", "Lab admin owns the building so she can create rooms and tables without asking the mayor every time. Mayor still owns account-wide safety switches."]
    ]),
    "7": S("Why attach the badge to me?", [
      ["alex", "I logged in. Why doesn’t the badge stick automatically?"],
      ["elena", "Badges are clipped onto users. This step clips <code>ROLE_BANK_LAB_ADMIN</code> onto <em>you</em> so you can wear it in Snowsight."]
    ]),
    "8": S("Why smoke-test create/drop role?", [
      ["jordan", "Seems pointless — create a temp role then drop it?"],
      ["elena", "It’s a fire drill: proves Elena is allowed to print new badges. If this fails, Lab 01 RBAC will fail too. Fix privileges now."]
    ]),
    "9": S("Why so many rooms?", [
      ["alex", "BRONZE, SILVER, GOLD, RISK, FILE_IN… my head hurts."],
      ["elena", "Same building, different jobs. Dock vs clean shelves vs board reports vs rules vs file truck bay. You’ll use each room when the story needs it — not all today."]
    ], "Rooms have jobs. You don’t need every room memorized yet."),
    "10": S("Why load scary CLIENTS already?", [
      ["sam", "You’re putting SSN in on day zero?"],
      ["elena", "On purpose — a tiny vault so Lab 01 has something to lock. Five fake clients. The danger must exist before we prove the window."]
    ])
  }
};

// ——— Lab 01 ———
L["01"] = {
  open: [
    {
      kicker: "Episode 01 · Scary SELECT",
      title: "Alex saw SSN. Sam is not happy.",
      panels: [
        ["alex", "I only wanted names for a slide… why is there a social security number on my screen?!"],
        ["sam", "If analysts can see SSN, we fail. Elena — lock the vault. Give Alex a window."],
        ["elena", "Two ideas only: <strong>job badge</strong> (who you are) and <strong>key-ring</strong> (what you can open). Alex never holds the vault key-ring."]
      ],
      caption: "Vault = scary table. Window = safe view. Badge ≠ keys."
    }
  ],
  steps: {
    "0": S("Skip if Lab 00 already worked", [
      ["jordan", "Do I always run this repair?"],
      ["elena", "Only if creating roles failed. It’s the mayor stamping “Elena may print badges.” Skip when Lab 00 smoke already passed."]
    ]),
    "1": S("Why check the vault first?", [
      ["alex", "Why are we looking at CLIENTS if I shouldn’t use it?"],
      ["elena", "So you see the danger exists. Later the proof is: same you, Alex badge, vault blocked. Without this table the story has no villain."]
    ]),
    "2": S("What are FR_ and AR_ in baby words?", [
      ["alex", "These names look like alphabet soup."],
      ["elena", "<code>FR_</code> = job badge (Analyst, Engineer…). <code>AR_</code> = key-ring of permissions. We print blank badges and empty rings first — then hang keys — then clip rings onto badges."]
    ], "Order matters: print → hang keys → clip onto jobs. Don’t skip ahead."),
    "3": S("Why give jobs the warehouse?", [
      ["alex", "I have a badge. Why can’t I run SQL yet?"],
      ["elena", "Badge without engine = ID card in a dark building. USAGE on <code>WH_BANK_XS</code> is permission to turn the lights on."]
    ]),
    "4": S("Building key vs floor key?", [
      ["alex", "USAGE on database AND schema… isn’t that the same?"],
      ["elena", "Building door + floor door. Database USAGE = enter the building. Schema USAGE = enter that floor. You still need SELECT to open a cabinet (table)."]
    ]),
    "5": S("Why SELECT on the key-ring not on Alex?", [
      ["jordan", "Faster to GRANT SELECT TO FR_ANALYST directly?"],
      ["elena", "Then every new table means editing every job. Hang SELECT on the key-ring once; clip the ring to jobs. That’s how banks scale."]
    ]),
    "6": S("Clip rings onto badges", [
      ["alex", "So my analyst badge gets the silver key-ring only?"],
      ["elena", "Yes. Jordan gets bronze dock keys. Sam gets PII keys. Your human user will wear all three badges later only to <em>test</em> — Alex the person in real life would wear one job."]
    ]),
    "7": S("Why grant all three jobs to me?", [
      ["marcus", "Isn’t that insecure?"],
      ["elena", "On a trial you’re one human playing three costumes. In prod, Alex the employee only gets FR_ANALYST. Here we grant all three so you can switch costumes and prove locks."]
    ]),
    "8": S("What is the window?", [
      ["alex", "Is a VIEW a copy of the table?"],
      ["elena", "No — it’s a saved SELECT. Like a window that only shows safe columns. The vault still holds SSN; the window simply doesn’t look at that cabinet."]
    ]),
    "9": S("THE important proof — hang the coat", [
      ["alex", "UI says FR_ANALYST but vault still opens. Snowflake broken?"],
      ["elena", "You’re still wearing a second coat — lab admin. Run <code>USE SECONDARY ROLES NONE</code>. Now only Alex’s coat. Vault fails. Window works. Say this in every interview."]
    ], "If you remember one thing from Lab 01: SECONDARY ROLES NONE."),
    "10": S("Jordan and Sam costumes", [
      ["jordan", "I should open the vault — that’s my dock."],
      ["sam", "And I need PII for audits — different key-ring."],
      ["elena", "Same pattern: wear the job, hang secondary coats, prove what opens. Three costumes, three truths."]
    ]),
    "11": S("Why smoke again?", [
      ["alex", "We already tested…"],
      ["elena", "Smoke = quick checklist that badges and grants still stick after a long lab. Two minutes now beats debugging Lab 03 later."]
    ])
  }
};

// ——— Lab 02 ———
L["02"] = {
  open: [
    {
      kicker: "Episode 02 · Tired computer",
      title: "Jordan rebuilds the whole book every night",
      panels: [
        ["jordan", "Every night I reload <em>all</em> transactions. Millions of rows. Slow. Expensive."],
        ["elena", "Imagine a bookmark. Last night you finished page Tuesday 2pm. Tonight start <em>after</em> the bookmark. That bookmark is a <strong>watermark</strong>. dbt incremental does that with MERGE."]
      ],
      caption: "Watermark = bookmark in the book of time."
    }
  ],
  steps: {
    "1": S("What is profiles.yml?", [
      ["alex", "Is dbt inside Snowflake?"],
      ["elena", "dbt is a tool on your laptop (or CI) that <em>talks to</em> Snowflake. <code>profiles.yml</code> is the phone number + password so dbt can call Meridian Bank. Keep secrets out of git."]
    ]),
    "2": S("Why create TXN_EVENTS by hand first?", [
      ["jordan", "Can’t dbt create the source too?"],
      ["elena", "Today the “dock table” is already in Snowflake — like a truck already parked. dbt <em>reads</em> it as a source and builds cleaner tables. Lab 06 is how files become dock tables."]
    ]),
    "3": S("First dbt run — what am I building?", [
      ["alex", "View? Fact? Staging? I’m lost."],
      ["elena", "Two toys: a small clean <strong>view</strong> (stg) and a <strong>fact table</strong> that stores history. First run has no bookmark yet — so it loads everything once. That’s normal."]
    ], "First run = fill the shelf. Later runs = only new pages."),
    "4": S("Day 2 — prove the bookmark moved", [
      ["jordan", "I added new rows and changed one old row’s status."],
      ["elena", "Run dbt again. Incremental should MERGE only changes — not rebuild the universe. If the changed order updates and new ids appear, your watermark brain works."]
    ])
  }
};

// ——— Lab 03 ———
L["03"] = {
  open: [
    {
      kicker: "Episode 03 · Same table, two answers",
      title: "Why Alex sees stars and Sam sees email",
      panels: [
        ["alex", "We query the same table. Sam sees real email. I see <code>***@…</code>. How?!"],
        ["elena", "Two stickers on the glass: <strong>masking</strong> = disguise a column. <strong>Row access</strong> = hide whole rows (countries). Same shelf. Rules change what each badge sees."]
      ],
      caption: "Masking = cover the number on a jersey. RAP = which players leave the locker room."
    }
  ],
  steps: {
    "0": S("Only if policies won’t create", [
      ["jordan", "CREATE MASKING POLICY failed…"],
      ["elena", "Mayor must allow Elena to apply policies. Same privilege-repair idea as Lab 00 — skip if Lab 00 already stamped it."]
    ]),
    "1": S("Why a RISK_CTRL room?", [
      ["alex", "Another schema? My brain is full…"],
      ["elena", "Think “rulebook office.” Policies live in <code>RISK_CTRL</code> so rules aren’t mixed into Alex’s report tables. Session first so SQL knows which building."]
    ]),
    "2": S("Why a governed copy of clients?", [
      ["jordan", "Why not put policies on BRONZE_LANDING.CLIENTS?"],
      ["elena", "We could. Today we make <code>CLIENTS_GOV</code> so Lab 01 vault demos stay simple and this lab has a clean practice shelf."]
    ]),
    "3": S("What is masking in baby words?", [
      ["alex", "Is it encrypting the email?"],
      ["elena", "Not encryption. It’s a rule: “If you’re Sam’s badge, show real email; else show stars.” Data stays; the <em>answer</em> changes by badge."]
    ]),
    "4": S("What is the entitlement list?", [
      ["sam", "Who decides which countries Alex may see?"],
      ["elena", "A small mapping table — badge → allowed countries. RAP will read that list. It’s the guest list for the party."]
    ]),
    "5": S("What is RAP?", [
      ["alex", "Masking already hid email. Why more?"],
      ["elena", "Masking hides a <em>field</em>. RAP hides <em>rows</em>. Without RAP Alex still sees customers in countries he shouldn’t — even with starred emails."]
    ]),
    "6": S("Why attach both rules?", [
      ["jordan", "I created the policies. Nothing changed on SELECT…"],
      ["elena", "Creating the rulebook ≠ sticking it on the shelf. ALTER TABLE attaches masking + RAP. Without attach, rules sit in a drawer."]
    ]),
    "7": S("Why grant read to Alex and Sam?", [
      ["alex", "I have FR_ANALYST — why more grants?"],
      ["elena", "Policies change what you see; you still need SELECT on the shelf. We hang read on the key-rings so both costumes can query."]
    ]),
    "8": S("Proof as Alex — coats off", [
      ["sam", "Show me Alex is limited."],
      ["elena", "Wear FR_ANALYST, <code>USE SECONDARY ROLES NONE</code>, SELECT. Stars on email + fewer countries. If vault coat still on, the demo lies."]
    ]),
    "9": S("Proof as Sam — same SQL", [
      ["alex", "We change the query for Sam?"],
      ["elena", "No — identical SELECT. Only the badge changes. That’s the whole point of policies."]
    ])
  }
};

// ——— Lab 04 ———
L["04"] = {
  open: [
    {
      kicker: "Episode 04 · Wrong floor",
      title: "Marcus shopped in the loading dock",
      panels: [
        ["marcus", "Alex’s board number doesn’t match Risk. Who’s lying?"],
        ["elena", "Alex pointed the dashboard at the <strong>dock</strong> (<code>BRONZE_LANDING</code>). Board numbers should come from the <strong>report wall</strong> (<code>GOLD_MART</code>). Middle floor = cleaned shelves (<code>SILVER_CURATED</code>)."]
      ],
      caption: "Dock → shelves → report wall. Don’t skip."
    }
  ],
  steps: {
    "1": S("Session — same as always", [
      ["alex", "Why repeat USE ROLE every lab?"],
      ["elena", "Snowsight forgets your costume between worksheets. We put the badge and engine on again so SQL doesn’t fail for mysterious reasons."]
    ]),
    "2": S("Why a GOLD_MART room?", [
      ["jordan", "Can’t gold tables live in silver schema?"],
      ["elena", "They can — but separate rooms make permissions and mental models easier. Alex’s dashboards point at gold. Engineers live in silver. Clean story for interviews."]
    ]),
    "3": S("What did we change from bronze?", [
      ["alex", "It’s almost the same SELECT…"],
      ["elena", "Almost — we UPPER(status) so “paid/PAID” become one spelling, and we drop negative amounts so board math isn’t garbage. Silver = rules applied."]
    ]),
    "4": S("Why aggregate for gold?", [
      ["marcus", "I want one number per client for the deck."],
      ["elena", "That’s gold’s job: counts and lifetime value. Gold reads silver — never jumps back to the messy dock."]
    ]),
    "5": S("Why count each layer?", [
      ["alex", "Just to see numbers?"],
      ["elena", "To feel the funnel: dock has many rows → silver maybe fewer → gold is one row per client. If gold > silver, something’s wrong."]
    ]),
    "6": S("Why dbt after CTAS?", [
      ["jordan", "We already built the tables by hand…"],
      ["elena", "Hand SQL proves the floors. dbt is how we ship the same floors from git every night. Interviewers want both: pattern + tool."]
    ], "Folders on disk ≠ Snowflake room names."),
    "7": S("Prove dbt wrote the rooms", [
      ["alex", "How do I know dbt didn’t invent a fourth place?"],
      ["elena", "Count again. Silver and gold should be in <code>SILVER_CURATED</code> and <code>GOLD_MART</code> — same rooms, now owned by Jordan’s project."]
    ])
  }
};

// ——— Lab 05 ———
L["05"] = {
  open: [
    {
      kicker: "Episode 05 · Tired Jordan",
      title: "Copy-paste every hour is not a pipeline",
      panels: [
        ["jordan", "I manually copy new txns into silver when I remember."],
        ["elena", "We’ll give you a <strong>notebook</strong> that only lists changes (stream) and a <strong>worker</strong> that runs when the notebook has pages (task). You shouldn’t be the cron job."]
      ],
      caption: "Stream = notebook of changes. Task = worker. Dynamic table = different tool (later)."
    }
  ],
  steps: {
    "0": S("Repair only if tasks fail", [
      ["jordan", "EXECUTE TASK denied…"],
      ["elena", "Mayor must stamp EXECUTE TASK on Elena’s badge. Same idea as Lab 00 privilege repair — account powers, not table SQL."]
    ]),
    "1": S("Empty shelf first", [
      ["alex", "Why create an empty table?"],
      ["elena", "That’s the destination shelf. The worker will put rows there. Empty on purpose — so when txn 1099 appears, you know the pipeline did it."]
    ]),
    "2": S("What is a stream really?", [
      ["alex", "Is it a live firehose like Kafka?"],
      ["elena", "Simpler: Snowflake keeps a bookmark on a table. “What changed since I last read?” That’s the notebook. <code>APPEND_ONLY</code> = we only care about new inserts here."]
    ]),
    "3": S("What is the task body doing?", [
      ["jordan", "Why SELECT from the stream not the table?"],
      ["elena", "If you SELECT the base table you reprocess history. The stream is “unread changes only.” Worker reads the notebook, writes silver, notebook pages get marked read."]
    ]),
    "4": S("Why RESUME?", [
      ["alex", "We created it. Isn’t it on?"],
      ["elena", "New tasks start asleep (suspended) so they don’t burn money by surprise. RESUME = allow it to run. Later we SUSPEND again for the lab."]
    ]),
    "5": S("Insert 1099 — make a page appear", [
      ["jordan", "Watch the stream after insert…"],
      ["elena", "Dock gets 1099 → notebook gets a page → we EXECUTE TASK once → silver should show 1099. That’s the whole movie."]
    ]),
    "6": S("Put the worker to bed", [
      ["marcus", "Don’t leave engines idling."],
      ["elena", "SUSPEND the task. In real life you’d leave it resumed with monitoring — labs suspend so trial credits survive."]
    ]),
    "7": S("Optional dynamic table", [
      ["jordan", "When do I skip stream+task?"],
      ["elena", "When you only need “keep this SELECT fresh” and you’re okay with Snowflake managing refresh. Custom CDC logic you must audit line-by-line → stay stream+task."]
    ])
  }
};

// ——— Lab 06 ———
L["06"] = {
  open: [
    {
      kicker: "Episode 06 · Truck at night",
      title: "Files pause in the bay first",
      panels: [
        ["jordan", "CSV landed. Can I dump it straight into gold for Alex?"],
        ["elena", "No. Truck bay first (<code>FILE_IN</code> stage) → then load dock (<code>BRONZE_LANDING</code>). Gold is a finished product. Snowpipe = bay door that opens when a truck arrives."]
      ]
    }
  ],
  steps: {
    "1": S("What is FILE_IN?", [
      ["alex", "Is FILE_IN the staging layer? Like silver?"],
      ["elena", "No — it’s the <em>file</em> room: stage + file format objects. Medallion staging in dbt is different. Here “stage” means Snowflake’s parking spot for files."]
    ], "Two meanings of “stage” — file parking vs dbt folder. Ask which one."),
    "2": S("Why a file format?", [
      ["jordan", "Can’t COPY guess CSV?"],
      ["elena", "Tell Snowflake how commas and headers work. File format = reading glasses for the file."]
    ]),
    "3": S("Internal stage?", [
      ["alex", "Is this Amazon S3?"],
      ["elena", "Internal stage = parking inside Snowflake’s lot (fine for labs). Prod often uses external stages to your cloud bucket with storage integrations."]
    ]),
    "4": S("Why a bronze table before the file?", [
      ["alex", "Can’t we invent columns while loading?"],
      ["elena", "Dock shelf first — named columns waiting. Then COPY pours file rows into that shape. Empty table ≠ empty story; it’s the landing pad."]
    ]),
    "5": S("Fake a file for the lab", [
      ["jordan", "We don’t have a real partner drop…"],
      ["elena", "We put bytes on the stage to simulate a truck. Same idea: file appears in the bay, then we load the dock."]
    ]),
    "6": S("COPY INTO bronze", [
      ["marcus", "When is Alex allowed to use this data?"],
      ["elena", "After it’s in bronze and then cleaned toward silver/gold. COPY lands raw. It does not mean “board ready.”"]
    ]),
    "7": S("How do I know it worked?", [
      ["alex", "COPY said success — I’m done?"],
      ["elena", "SELECT a few rows from bronze. Interview close: stage → COPY → bronze. Snowpipe is the same path with an automatic door."]
    ])
  }
};

// ——— Lab 07 ———
L["07"] = {
  open: [
    {
      kicker: "Episode 07 · Board panic",
      title: "Alex wants a bigger engine. Elena wants a better question.",
      panels: [
        ["alex", "Query is dying. Buy a bigger warehouse — now!"],
        ["elena", "Maybe later. First we fix the question: stop selecting junk columns, filter early, prove bytes. Bigger engine on a dumb question just burns money faster."]
      ],
      caption: "Fix the question before you buy a louder engine."
    }
  ],
  steps: {
    "0": S("Why turn cache off?", [
      ["alex", "Second run was instant — I’m a genius?"],
      ["elena", "Snowflake remembered the answer (result cache). We turn that off so before/after comparisons are fair — otherwise “fast” is a trick."]
    ]),
    "1": S("Why load so many rows?", [
      ["jordan", "400k feels heavy for a lab…"],
      ["elena", "Tiny tables hide the lesson. We need enough chunks (micro-partitions) so “how much did we read?” is visible. Lab 08 keeps this table."]
    ]),
    "2": S("Why the fat twin table?", [
      ["alex", "Extra PAD columns look fake."],
      ["elena", "They’re fake on purpose — so <code>SELECT *</code> hurts. You’ll feel bytes drop when we pick only useful columns. Then we delete this toy table."]
    ]),
    "3": S("SELECT * is the enemy", [
      ["alex", "SELECT * is shorter to type…"],
      ["elena", "Shorter for you, longer for the engine. You dragged stuffing Marcus never charts. Ask only for columns you need."]
    ]),
    "4": S("Why not YEAR(date)?", [
      ["alex", "YEAR(EVENT_DATE) = 2026 feels natural."],
      ["elena", "Wrapping the date column can stop Snowflake from skipping whole shelves of data. Use a date range instead — same question, friendlier to pruning."]
    ], "Pruning = skipping shelves that can’t match your filter."),
    "5": S("The CTE talk you asked for", [
      ["alex", "Why a CTE? My join already works…"],
      ["elena", "Your join invited a <em>year</em> of events to the party. CTE <code>recent</code> invites only last week, <em>then</em> joins clients. Smaller party, same board answer. This is the habit."]
    ], "Filter first, join second. Say it out loud."),
    "6": S("Numbers not vibes", [
      ["marcus", "“It felt faster” is not a status update."],
      ["elena", "We read bytes from history and partitions from operator stats — or Query Profile pictures. Architects cite numbers."]
    ]),
    "7": S("Who do you Slack to resize?", [
      ["alex", "So every morning I ping you to ALTER SIZE?"],
      ["elena", "Never. Board work uses <code>WH_BANK_BOARD_S</code> — wakes when you run, sleeps when you stop. Daily toy queries stay on XS. I’m not your resize bot."]
    ]),
    "8": S("Cleanup — keep the useful table", [
      ["jordan", "Delete everything?"],
      ["elena", "Delete the fat toy. Keep <code>BIG_EVENTS</code> for clustering next lab. Keep the board warehouse for FinOps story."]
    ])
  }
};

// ——— Lab 08 ———
L["08"] = {
  open: [
    {
      kicker: "Episode 08 · Messy library",
      title: "Last 7 days still opened old shelves",
      panels: [
        ["alex", "I filtered last 7 days — why so much scanning?"],
        ["elena", "Dates were scattered like books on the floor. Clustering re-shelves by date so Snowflake can skip whole shelves. Different tool than “search optimization” (that’s for ID lookups)."]
      ]
    }
  ],
  steps: {
    "1": S("Same session habit", [
      ["alex", "Again with USE ROLE…"],
      ["elena", "Yes. Badge + engine + room. Boring = reliable."]
    ]),
    "2": S("Table from Lab 07", [
      ["jordan", "Did we rebuild 400k?"],
      ["elena", "Prefer the table Lab 07 left you. Only rebuild if you skipped Lab 07. Clustering needs real volume."]
    ]),
    "3": S("What is clustering information?", [
      ["alex", "Looks like scary JSON…"],
      ["elena", "It’s a health report: how mixed are dates across shelves? We glance before/after — you don’t need every field memorized."]
    ]),
    "4": S("CLUSTER BY does what?", [
      ["marcus", "Does this rewrite the table tonight?"],
      ["elena", "It tells Snowflake to maintain better order over time (background work, costs some credits). Worth it when Profile shows date filters still reading the world."]
    ]),
    "5": S("Run the 7-day question again", [
      ["alex", "Should it be instant now?"],
      ["elena", "On a lab it may still be quick either way. The interview sentence is: clustering helps pruning for date windows; we measure partitions/bytes, not vibes."]
    ])
  }
};

// ——— Lab 09 ———
L["09"] = {
  open: [
    {
      kicker: "Episode 09 · Undo",
      title: "Four tools — don’t mix them up",
      panels: [
        ["dev", "I need a prod-like copy to break safely."],
        ["elena", "CLONE = twin in the same account. Time Travel = yesterday’s rows while table still exists. UNDROP = bring back a dropped table. Replication = other region when the building burns — Lab 11."]
      ],
      caption: "Clone ≠ disaster recovery. Say it until it’s boring."
    }
  ],
  steps: {
    "1": S("Why a tiny demo table?", [
      ["alex", "Why not practice undo on prod CLIENTS?"],
      ["elena", "Because undo practice should be boring and safe. Tiny table, same tools. Badge + warehouse + silver room — then we break it on purpose."]
    ]),
    "2": S("Time Travel after DELETE", [
      ["alex", "I deleted the row — it’s gone forever?"],
      ["elena", "Not yet. Ask Snowflake for the table <em>as of a few minutes ago</em>. That’s Time Travel. The trash didn’t leave the building immediately."]
    ]),
    "3": S("UNDROP", [
      ["jordan", "I DROP TABLE by mistake…"],
      ["elena", "UNDROP is the “retrieve from dumpster” for whole tables — if you’re still inside retention. Different tool than Time Travel on a table that’s still there."]
    ]),
    "4": S("CLONE for Dev", [
      ["dev", "Is clone our DR plan?"],
      ["marcus", "No."],
      ["elena", "Clone = Dev’s playground today. DR = other region + failover — different lab."]
    ])
  }
};

// ——— Lab 10 ———
L["10"] = {
  open: [
    {
      kicker: "Episode 10 · Partner",
      title: "Nora wants data — not a USB dump",
      panels: [
        ["nora", "Can you email the ledger every Friday?"],
        ["elena", "We’ll share a <strong>secure window</strong> — live, few columns, you pay your own compute. Friday dump trucks grow legs and walk into the wrong inbox."]
      ]
    }
  ],
  steps: {
    "0": S("Only if CREATE SHARE fails", [
      ["jordan", "Permission denied on CREATE SHARE…"],
      ["elena", "Mayor must allow Elena to create shares. Same privilege-repair habit — skip if Lab 00 already stamped it."]
    ]),
    "1": S("Provider session — why?", [
      ["alex", "Who is the “provider”?"],
      ["elena", "Us — Meridian. We wear Elena’s badge, pick the engine, stand in silver. Nora is the consumer later."]
    ]),
    "2": S("Secure view first", [
      ["sam", "What’s on the share?"],
      ["elena", "Only columns Nora needs. Secure view = she can’t peek at the SQL recipe either. No CLIENTS vault."]
    ]),
    "3": S("Create share — is it a copy?", [
      ["alex", "Is a share a copy of the table?"],
      ["elena", "No — it’s a permission envelope. Nora’s account may read the objects we put inside. Data stays Meridian’s until she queries."]
    ]),
    "4": S("Why grant objects onto the share?", [
      ["jordan", "I created SHARE_… but Nora sees nothing."],
      ["elena", "Empty envelope. GRANT database/schema/view <em>to the share</em> puts the window inside. Create ≠ stocked."]
    ]),
    "5": S("Who pays when Nora queries?", [
      ["marcus", "Do we pay when Nora runs SQL?"],
      ["elena", "Nora’s warehouse pays her scans. That’s why share beats us running Friday CSVs on WH_BANK_XS “as a favor.”"]
    ])
  }
};

// ——— Lab 11 ———
L["11"] = {
  open: [
    {
      kicker: "Episode 11 · Fire drill",
      title: "Share is not a fire escape",
      panels: [
        ["marcus", "We share with Nora — so we’re DR-ready?"],
        ["elena", "If our region dies, her window dies too. Share ≠ secondary. Clone ≠ secondary. Replication + failover + practice = DR."]
      ]
    }
  ],
  steps: {
    "1": S("Session first — why?", [
      ["alex", "Why badge + warehouse before talking DR?"],
      ["elena", "Same habit every lab: know which costume and which engine you’re in. DR talk without a session is just vibes."]
    ]),
    "2": S("What does SHOW replication tell you?", [
      ["marcus", "Board wants numbers."],
      ["elena", "<strong>RPO</strong> = how much data we might lose (lag). This SHOW is “do we even have a secondary yet?” On trial: often empty — that’s honest."]
    ]),
    "3": S("Failover group = what?", [
      ["jordan", "Is that the same as a share?"],
      ["elena", "No. Failover group is the suitcase of objects that can flip to another account/region. Share is Nora’s window — dies if we die."]
    ]),
    "4": S("If org accounts is blocked…", [
      ["dev", "Command fails on my trial."],
      ["elena", "Say so in the interview. Explain the pattern; don’t invent a green checkmark. Trial ≠ production org."]
    ]),
    "5": S("Production pattern in one breath", [
      ["marcus", "So what’s the plan?"],
      ["elena", "Primary account lands data → replicate to secondary → practice promote (RTO) → know lag (RPO). Clone and share are different tools — don’t mix them into this sentence."]
    ])
  }
};

// ——— Lab 12 ———
L["12"] = {
  open: [
    {
      kicker: "Episode 12 · Silent break",
      title: "CI was green. Alex’s tile was empty.",
      panels: [
        ["jordan", "I renamed a column. Tests passed. Why is Looker dead?"],
        ["elena", "You protected the wrong door. Contract the <strong>published mart</strong> Alex uses — not every staging scratch view. And Slim CI needs a fresh map of prod or it compares to a ghost."]
      ]
    }
  ],
  steps: {
    "1": S("What is a source YAML?", [
      ["alex", "Is this SQL?"],
      ["elena", "It’s a name tag: “this Snowflake table is our bronze dock.” dbt doesn’t create bronze here — it points at it."]
    ]),
    "2": S("Why describe txn_events?", [
      ["jordan", "Extra typing…"],
      ["elena", "So humans and tests know which dock table matters. Documentation is part of the contract with future-you."]
    ]),
    "3": S("What is contract enforcement?", [
      ["alex", "Like a legal contract?"],
      ["elena", "A column promise: name + type must match. Break it → CI fails before Alex’s tile goes blank."]
    ]),
    "4": S("Why order_id in the contract?", [
      ["jordan", "It’s obvious…"],
      ["elena", "Obvious until someone renames it. Unique + not_null on the grain is the seatbelt."]
    ]),
    "5": S("Why updated_at in the contract?", [
      ["alex", "That’s the watermark thing from Lab 02?"],
      ["elena", "Yes — if type drifts, incremental MERGE and “last refresh” both break. Put the watermark in the promise, not a wiki."]
    ]),
    "6": S("dbt deps?", [
      ["jordan", "Why install packages?"],
      ["elena", "Slim CI helpers live in packages. deps = download the toolbox before you build."]
    ]),
    "7": S("Slim CI list", [
      ["marcus", "Why not rebuild the world every PR?"],
      ["elena", "Credits and time. First we <em>list</em> what would run — modified models + downstream. Sanity check before spending."]
    ]),
    "8": S("Defer means what?", [
      ["alex", "Defer sounds like procrastination…"],
      ["elena", "It means “reuse prod for things we didn’t change.” Needs a fresh prod manifest. Stale map = false safety."]
    ])
  }
};

// ——— Lab 13 ———
L["13"] = {
  open: [
    {
      kicker: "Episode 13 · Bill shock",
      title: "Finance forwarded the invoice",
      panels: [
        ["marcus", "Who left the lights on all weekend?!"],
        ["elena", "We’ll read the meter (<code>ACCOUNT_USAGE</code>) — it lags a bit — and put a breaker (<code>RM_BANK_LAB</code>) so next weekend can’t melt the budget."]
      ]
    }
  ],
  steps: {
    "1": S("Why ACCOUNTADMIN for billing views?", [
      ["alex", "I thought Elena’s badge does everything…"],
      ["elena", "Bill and breakers are account powers. Daily table building is not. Wear the mayor briefly, then switch back."]
    ]),
    "2": S("Credits by warehouse", [
      ["marcus", "Who left the lights on?"],
      ["elena", "Meter by warehouse — map WH_BANK_XS to a team. Lag 1–3 hours is normal; empty isn’t always “SQL wrong.”"]
    ]),
    "3": S("Top queries = the suspects", [
      ["alex", "Warehouse total is high — then what?"],
      ["elena", "Query history: which SQL burned time. Chargeback fights end with a query id, not a feeling."]
    ]),
    "4": S("Notify vs suspend", [
      ["jordan", "Email at 75% is enough?"],
      ["elena", "Email still lets a runaway finish. Marcus asked for a hard stop — suspend at 100%. Name who resets the monitor."]
    ]),
    "5": S("Why attach the monitor?", [
      ["marcus", "I created RM_BANK_LAB…"],
      ["elena", "Breaker on the wall ≠ wired to the engine. ALTER WAREHOUSE … SET RESOURCE_MONITOR links them."]
    ]),
    "6": S("Smoke — did the breaker stick?", [
      ["alex", "How do I know it worked?"],
      ["elena", "SHOW or describe the warehouse — monitor name should appear. Interview sentence: meters explain, monitors stop."]
    ])
  }
};

// ——— Lab 14 ———
L["14"] = {
  open: [
    {
      kicker: "Episode 14 · No laptop",
      title: "Interview chair — mouth only",
      panels: [
        ["marcus", "(as interviewer) Keep Alex off SSN. What breaks if you skip secondary-role NONE?"],
        ["elena", "I say: job badge + key-ring + window view + hang the extra coat. Context → decision → proof → outcome. If I blank, I don’t get the job."]
      ],
      caption: "Read the coach comic → answer aloud → open “Say this”. Structure: context → decision → verify → outcome."
    }
  ],
  steps: {
    "1": S("Out loud: keep Alex off SSN", [
      ["marcus", "Alex must not see SSN. How?"],
      ["elena", "Not a second secret copy. Give Alex a <em>window</em> view without PII columns + key-ring that can’t open the vault. Proof: FR_ANALYST + secondary roles NONE."]
    ], "Lab 01 — structure first, then prove."),
    "2": S("Out loud: same SQL, two answers", [
      ["alex", "Why doesn’t Sam get a different table?"],
      ["elena", "One shelf, two stickers: masking (column look) + RAP (which rows). Same SELECT; badge changes the answer. Coats off or the demo lies."]
    ], "Lab 03 — policies, not duplicate CSVs."),
    "3": S("Out loud: nightly full rebuild hurts", [
      ["jordan", "Fact table is huge. Full refresh every night?"],
      ["elena", "No — bookmark on <code>updated_at</code>, MERGE by order id. Day-2 proof: new rows + one status change without rewriting history."]
    ], "Lab 02 — watermark = bookmark."),
    "4": S("Out loud: streams vs dbt", [
      ["marcus", "Pick one CDC tool."],
      ["elena", "I won’t. Streams+tasks = Snowflake ops speed into silver. dbt incremental = git-tested marts. Two jobs; don’t force one religion."]
    ], "Lab 05 — who owns latency vs who owns CI."),
    "5": S("Out loud: board query too expensive", [
      ["marcus", "Board SQL is slow and burns credits."],
      ["elena", "Triage: slim columns → sargable filter → filter before join → prove bytes in Profile. Then maybe a board warehouse — not “make XS huge forever.”"]
    ], "Lab 07 — method before muscle."),
    "6": S("Out loud: remote spill", [
      ["alex", "Profile says remote spill. Panic?"],
      ["elena", "Spill = ran out of local RAM for sort/join. Narrow earlier, cluster filter columns, right-size once. Measure again — diagnosis ≠ cure."]
    ], "Lab 08 — layout + SQL before endless upsizing."),
    "7": S("Out loud: Dev wants prod-like QA", [
      ["dev", "Can I have a full copy without double bill day one?"],
      ["elena", "Zero-copy CLONE — twin pointer, same account. Refresh by re-clone. Not DR when a region dies."]
    ], "Lab 09 — clone ≠ fire escape."),
    "8": S("Out loud: Nora wants metrics", [
      ["nora", "Email me the ledger Friday?"],
      ["elena", "Secure share + thin view. You query; you pay your warehouse. No USB dump, no CLIENTS vault on the share."]
    ], "Lab 10 — live window, not Friday CSV."),
    "9": S("Out loud: share vs replicate", [
      ["marcus", "Share covers disaster recovery, right?"],
      ["elena", "No. Share = Nora’s read window (dies if we die). Replicate = secondary region + failover (RPO/RTO). Clone = Dev QA. Three sentences, three tools."]
    ], "Lab 11 — never blur these."),
    "10": S("Out loud: chargeback", [
      ["marcus", "Finance wants spend by team."],
      ["elena", "Meter views by warehouse mapped to teams; query history for disputes. Admit lag. Monitors stop the bleed; meters explain the bill."]
    ], "Lab 13 — after-the-fact vs guardrails."),
    "11": S("Out loud: dropped prod table", [
      ["jordan", "I DROP’d a table. Slack is on fire."],
      ["elena", "Inside retention: UNDROP. Bad UPDATE: Time Travel / AT. Region gone: replication. Typos ≠ geography."]
    ], "Lab 09 — pick the undo that matches the wound."),
    "12": S("Out loud: runaway spend", [
      ["marcus", "Ad hoc warehouses melted the weekend."],
      ["elena", "Resource monitor suspend + auto-suspend + Slim CI. Also cut bytes: incremental + clustering. Guardrails without engineering still leak money."]
    ], "Labs 12+13 — brakes and smaller loads.")
  }
};

// ——— Lab 15 ———
L["15"] = {
  open: [
    {
      kicker: "Episode 15 · 2 a.m.",
      title: "Hope is not an orchestrator",
      panels: [
        ["jordan", "dbt models exist. Overnight gold still depends on my laptop."],
        ["elena", "Something must wake the graph. Tasks for Snowflake CDC. Airflow when files + dbt + Slack share one night story. Don’t wrap every Task in Airflow."]
      ]
    }
  ],
  steps: {
    "1": S("Why a whiteboard DAG?", [
      ["alex", "We don’t even have Airflow installed…"],
      ["elena", "Interviewers care you can <em>draw</em> the night: wait for file → load bronze → dbt silver/gold → test → notify. Tools change; the story stays."]
    ]),
    "2": S("Run the dbt middle", [
      ["jordan", "So Airflow just calls this?"],
      ["elena", "Yes — with retries and alerts. Your hands run the same command Airflow would. Muscle memory > mythology."]
    ]),
    "3": S("Don’t double-orchestrate CDC", [
      ["jordan", "Should Airflow also trigger the Lab 05 task?"],
      ["elena", "Usually no. Task already wakes on stream data. Two bosses writing one table = two truths. One writer per table."]
    ])
  }
};

function buildOpen(lab, o, i) {
  return strip({
    id: `comic-${lab}-open-${i}`,
    kicker: o.kicker,
    title: o.title,
    panels: o.panels,
    caption: o.caption,
    mini: false
  });
}

function buildStep(lab, num, s) {
  return strip({
    id: `comic-${lab}-step-${num}`,
    kicker: `Step ${num} · coach`,
    title: s.title,
    panels: s.panels,
    caption: s.caption,
    mini: true
  });
}

const docs = path.join(__dirname, "..", "docs");
let labsDone = 0;
let stripsTotal = 0;

for (const [lab, cfg] of Object.entries(L)) {
  const file = path.join(docs, `lab-${lab}.html`);
  let html = fs.readFileSync(file, "utf8");

  // Remove all existing comics
  html = html.replace(/\s*<section class="comic-strip[\s\S]*?<\/section>/g, "\n");

  const openHtml = (cfg.open || []).map((o, i) => buildOpen(lab, o, i)).join("\n\n");

  // Insert openers after ba-grid block (figures only — first closing div of ba-grid)
  if (openHtml && html.includes('class="ba-grid"')) {
    html = html.replace(
      /(<div class="ba-grid">[\s\S]*?<\/div>\s*)/,
      `$1\n${openHtml}\n`
    );
  }

  // Insert step comics after each step-head
  html = html.replace(
    /<div class="step-head">\s*<div class="step-num">(\d+)<\/div>\s*<div>\s*<h3>[\s\S]*?<\/h3>[\s\S]*?<\/div>\s*<\/div>/g,
    (full, num) => {
      const s = cfg.steps && cfg.steps[num];
      if (!s) return full;
      stripsTotal++;
      return `${full}\n\n      ${buildStep(lab, num, s)}\n`;
    }
  );

  stripsTotal += (cfg.open || []).length;
  fs.writeFileSync(file, html);
  labsDone++;
  const stepCount = Object.keys(cfg.steps || {}).length;
  console.log(`lab-${lab}: open=${(cfg.open || []).length} stepComics=${stepCount}`);
}

console.log("labs", labsDone, "strip defs ~", stripsTotal);
