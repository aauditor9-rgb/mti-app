# Step-by-step: building MTI Maktab with no coding experience

Written for someone who has never shipped software. Follow it in order. Nothing here
assumes you can code — Claude Code writes the code, you direct it and check the result.

Realistic timeline: **3–6 months** of evenings to a pilot you'd let one madrasah use.
Realistic budget to that point: **£150–400 total**.

---

## Stage 0 — Before you touch a computer (1 evening)

Decide three things and write them down:

1. **Who is the first madrasah?** Ideally yours, or one where you know the head. You need
   one real user who will tolerate bugs and tell you the truth.
2. **What is the smallest useful version?** My recommendation: pupils, classes,
   attendance register, and parents seeing their child's attendance. Nothing else.
   Everything in the designs comes later.
3. **Are you holding real pupil data, or fake data, for the first 3 months?** Use fake
   data. It removes every legal obligation while you learn. Only go live with real
   children's data once Stage 8 is done.

---

## Stage 1 — Accounts (1–2 hours)

Sign up in this order. Use the same email for all of them. Turn on two-factor
authentication on every single one.

| # | Service | What it's for | Cost now |
|---|---|---|---|
| 1 | **GitHub** (github.com) | Stores your code. Like Google Drive for software. | Free |
| 2 | **Anthropic** (claude.ai) | Claude Code — this is what writes the software. Get the **Max** plan; Pro will run out mid-session and frustrate you. | £90–100/mo |
| 3 | **Supabase** (supabase.com) | Your database — where pupils, classes and attendance actually live. | Free |
| 4 | **Vercel** (vercel.com) | Puts the app on the internet at a real web address. | Free |

**Critical:** when you create the Supabase project it asks for a *region*. Choose
**London (eu-west-2)**. You cannot change it afterwards, and UK children's data should
sit in the UK.

Leave Stripe, Resend, Twilio, Sentry and PostHog until Stage 7. You don't need them yet.

---

## Stage 2 — Get Claude Code running on your machine (1–2 hours)

You need three pieces of software installed. On a Mac, open **Terminal**
(Applications → Utilities → Terminal). On Windows, install **Windows Terminal** from the
Microsoft Store first.

Install, in order:

1. **Node.js** — download the "LTS" version from nodejs.org and run the installer.
2. **Git** — git-scm.com, run the installer, accept every default.
3. **Claude Code** — in Terminal, type:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
   then
   ```
   claude
   ```
   and sign in with your Anthropic account when it asks.

**If any of this fails**, don't debug it yourself. Copy the entire error message, paste
it into claude.ai in the browser, and ask "I'm on [Mac/Windows], this failed, what do I
do?" This is the correct way to handle every error you will ever hit.

Also install **VS Code** (code.visualstudio.com). You won't write code in it, but you'll
want to look at files, and Claude Code can run inside it.

---

## Stage 3 — Set up the project folder (30 minutes)

1. Make a folder on your computer called `mti-maktab`.
2. Unzip this handoff bundle **inside** it, into a subfolder called `design`.
3. Open Terminal, and type `cd ` (with the space), then drag the `mti-maktab` folder onto
   the Terminal window and press Enter. You are now "inside" that folder.
4. Type `claude` and press Enter.

You're now talking to Claude Code, and it can see your files.

---

## Stage 4 — The first session (1 evening)

Paste this, exactly:

> Read design/README.md, design/TECH_STACK.md and design/PARITY.md in full. Then explain
> back to me, in plain English and in no more than 20 lines, what we are building and
> what the first five things to build are. Do not write any code yet.

Read what it says. If it has misunderstood something, correct it now — it is far cheaper
than correcting it in three weeks.

Then:

> Scaffold the Next.js + TypeScript + Tailwind + Drizzle + Supabase project described in
> TECH_STACK.md. Set up the design tokens from README.md as CSS variables. Then show me
> how to run it locally.

It will tell you to type `npm run dev` and open `localhost:3000` in your browser. That
blank-ish page is your app. That's the moment it becomes real.

**Ground rules for every session from here:**

- **One thing per session.** "Build the attendance register" — not "build attendance,
  fees and reports".
- **Always look at the result in the browser** before saying yes. You are the designer;
  you already know what it should look like — it's in the prototypes.
- **When something is wrong, describe it as a user would.** "The attendance percentage on
  the class page says 94% but the register only has 12 of 15 marked" is a perfect bug
  report. You do not need to know why.
- **End every session with:** "Commit this to git with a clear message." That's your
  save point. If tomorrow goes badly you can always go back.

---

## Stage 5 — Connect the database (1 evening)

Ask Claude Code:

> Connect this project to my Supabase database. Walk me through exactly which values to
> copy from the Supabase dashboard and where to put them, step by step, assuming I have
> never done this before.

It will have you copy two or three long strings from Supabase into a file called
`.env.local`. Those are passwords — never paste them into a chat, a screenshot, or
GitHub. Claude Code knows to keep that file out of git; if you're ever unsure, ask it to
confirm `.env.local` is in `.gitignore`.

Then:

> Create the database tables for madrasah, pupil, guardian, class and staff, with
> row-level security as described in TECH_STACK.md. Then seed them with the fake data
> from the prototype so I have something to look at.

---

## Stage 6 — Build the core, one screen at a time (6–10 weeks)

Follow the build order in `TECH_STACK.md`. One item per session:

1. Pupils, guardians, classes, staff (the spine)
2. Attendance register — mark, submit, locked with a submit time
3. The parent view of attendance
4. Iḥsān points and auto-awards
5. Concerns and safeguarding
6. Admissions and enrolment

For each one, the prompt shape is the same:

> Build the [X] screen. Match `design/Madrassa Portal.dc.html` — open it and follow the
> layout, colours, spacing and copy exactly. Use the real database, not mock data. When
> you're done, tell me what to click to test it.

Then click it. Then compare it side by side with the prototype in another browser tab.

**Do not skip the invariants.** Once attendance works, say:

> Write unit tests for the eight invariants listed at the bottom of design/README.md.

Those eight rules are the bugs that already bit us once in the prototype. Tests stop them
coming back when you're six screens deeper and can't remember why it mattered.

---

## Stage 7 — Put it on the internet (1 evening)

> Push this project to a new private GitHub repository, then walk me through deploying it
> to Vercel, step by step.

Roughly 20 minutes of clicking. At the end you have a real web address you can send to
someone. Keep it private/password-protected until Stage 8.

This is also when you add the extra services, and only if you need them: **Resend**
(emails to parents), **Stripe** (fees), **Sentry** (tells you when the app breaks for
someone else — add this one, it's free and it's your smoke alarm).

---

## Stage 8 — Before a single real child's record goes in

Non-negotiable, and none of it is coding:

1. **Register with the ICO** as a data controller — ico.org.uk, about £52/year. It's an
   online form, takes 15 minutes.
2. **Write a privacy notice** for parents saying what you store and why. Claude can draft
   it; a solicitor should glance at it.
3. **Write a Data Processing Agreement** with the madrasah — you're processing data on
   their behalf.
4. **Do a DPIA** (Data Protection Impact Assessment). Required because you're processing
   children's data and safeguarding records. The ICO publishes a template.
5. **Ask Claude Code to audit the safeguarding tables**: append-only, role-gated to DSL
   only, every read and write logged, attachments private. Get it to show you the
   evidence, not just claim it.
6. **Turn on database backups** in Supabase (Pro plan) and test restoring one.

If you skip these, one incident ends the project. This stage is more important than any
feature.

---

## Stage 9 — Pilot (4–8 weeks)

One madrasah. One term. Sit in the room while a teacher takes the register on it for the
first time — you'll learn more in that ten minutes than in a month of building.

Keep a single list of everything they hit. Fix in order of how often it bites, not how
annoying it is to you.

---

## When you get stuck

- **An error message** → paste the whole thing into Claude Code and ask what to do.
- **It built the wrong thing** → "Undo that, I meant [describe it as a user]."
- **It's gone in circles twice** → stop, start a fresh session, re-explain from scratch.
  A confused session doesn't recover.
- **You've broken something and don't know what** → "Show me the last few commits and
  help me revert to the last working one."
- **You don't understand a word it used** → ask. "Explain what a migration is like I'm
  not a developer." It's a genuinely good teacher and you'll need this vocabulary.

## What to expect of yourself

You will not understand the code, and you don't need to. Your job is: know what the
product should do, look hard at what comes back, describe what's wrong in plain words,
and refuse to go live until Stage 8 is done. That's the actual work. The typing is the
easy part now.
