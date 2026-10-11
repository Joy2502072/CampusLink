"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { eventBus } from "@/lib/bus";

const SAMPLES = [
  {
    title: "Distributed systems and SRE",
    text: `Role: Distributed Systems and SRE Specialist
We are hiring final-year engineers for our platform team. Minimum CGPA 7.5, no active backlogs. Package: 24 to 34 LPA.
Requirements:
- Strong Golang and Docker experience
- Hands-on Kubernetes and PostgreSQL
Nice to have:
- gRPC, Kafka, Linux internals
Branches: CSE, IT, ECE`,
  },
  {
    title: "GenAI and ML engineer",
    text: `Position: GenAI and ML Engineer
We build retrieval systems for banks. 8.0+ CGPA preferred, up to 1 backlog. 18-26 LPA.
Must have: Python, PyTorch, FastAPI, Docker.
Bonus: HuggingFace, Redis, Terraform.
Branches: CSE, IT`,
  },
  {
    title: "Embedded firmware",
    text: `Title: Firmware Engineer
CGPA of 7.0 or above. Package 12.5 LPA. No backlogs.
Requirements: C, C++, RTOS, ARM, Git
Preferred: Python, Linux
Branches: ECE, EEE, Mech`,
  },
];

const KNOWN_SKILLS = [
  "Golang", "Docker", "Kubernetes", "PostgreSQL", "gRPC", "Kafka", "Linux",
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "AWS", "Python",
  "PyTorch", "HuggingFace", "FastAPI", "TensorFlow", "SQL", "MongoDB",
  "Redis", "Git", "C++", "C", "RTOS", "ARM", "Terraform", "Java", "Rust", "GraphQL"
];

export default function NewDrivePage() {
  const router = useRouter();
  const [sampleIdx, setSampleIdx] = useState(0);
  const [rawText, setRawText] = useState(SAMPLES[0].text);
  const [isParsed, setIsParsed] = useState(false);

  // Extracted values
  const [role, setRole] = useState("Distributed Systems and SRE Specialist");
  const [minCgpa, setMinCgpa] = useState("7.5");
  const [ctc, setCtc] = useState("24 to 34");
  const [backlogs, setBacklogs] = useState("0");
  const [branches, setBranches] = useState<string[]>(["CSE", "IT", "ECE"]);
  const [mustHaves, setMustHaves] = useState<string[]>(["Golang", "Docker", "Kubernetes", "PostgreSQL"]);
  const [niceToHaves, setNiceToHaves] = useState<string[]>(["gRPC", "Kafka", "Linux"]);
  const [customInput, setCustomInput] = useState("");

  const handleNextSample = () => {
    const nextIdx = (sampleIdx + 1) % SAMPLES.length;
    setSampleIdx(nextIdx);
    setRawText(SAMPLES[nextIdx].text);
    setIsParsed(false);
  };

  const handleExtract = () => {
    const text = rawText;
    setIsParsed(true);

    // 1. Role extraction
    const roleMatch = text.match(/^\s*(?:role|title|position)\s*[:—–-]\s*(.+)$/im);
    const parsedRole = roleMatch ? roleMatch[1].trim() : text.split("\n")[0].trim().slice(0, 80);

    // 2. CGPA extraction
    const cgpaMatch = text.match(/(?:cgpa|gpa)\D{0,14}?(\d{1,2}(?:\.\d{1,2})?)/i) ||
                      text.match(/(\d{1,2}(?:\.\d{1,2})?)\s*\+?\s*(?:cgpa|gpa)/i);
    const parsedCgpa = cgpaMatch ? cgpaMatch[1] : "7.0";

    // 3. CTC extraction
    const ctcMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:to|-|—|–)\s*(\d+(?:\.\d+)?)\s*lpa/i);
    const parsedCtc = ctcMatch ? `${ctcMatch[1]} to ${ctcMatch[2]}` : "18 to 28";

    // 4. Backlogs extraction
    const hasNoBacklogs = /no\s+(?:active\s+)?backlogs?/i.test(text);
    const backMatch = text.match(/(\d+)\s+backlogs?/i);
    const parsedBack = hasNoBacklogs ? "0" : backMatch ? backMatch[1] : "0";

    // 5. Branches extraction
    const brMatches: string[] = [];
    ["CSE", "IT", "ECE", "EEE", "Mech", "Civil"].forEach((b) => {
      if (new RegExp(`\\b${b}\\b`, "i").test(text)) {
        brMatches.push(b);
      }
    });

    // 6. Skills extraction
    const foundMust: string[] = [];
    const foundNice: string[] = [];
    const reqIndex = text.search(/preferred|nice\s*to\s*have|bonus|good\s*to\s*have|plus/i);

    KNOWN_SKILLS.forEach((sk) => {
      const re = new RegExp(`\\b${sk.replace("+", "\\+")}\\b`, "i");
      if (re.test(text)) {
        const pos = text.search(re);
        if (reqIndex !== -1 && pos >= reqIndex) {
          foundNice.push(sk);
        } else {
          foundMust.push(sk);
        }
      }
    });

    setRole(parsedRole);
    setMinCgpa(parsedCgpa);
    setCtc(parsedCtc);
    setBacklogs(parsedBack);
    setBranches(brMatches.length > 0 ? brMatches : ["CSE", "IT"]);
    setMustHaves(foundMust.length > 0 ? foundMust : ["Full Stack", "Problem Solving"]);
    setNiceToHaves(foundNice.length > 0 ? foundNice : ["Cloud"]);
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const v = customInput.trim();
    if (!v) return;
    if (!mustHaves.includes(v)) {
      setMustHaves([...mustHaves, v]);
    }
    setCustomInput("");
  };

  const removeMust = (sk: string) => {
    setMustHaves(mustHaves.filter((x) => x !== sk));
  };

  const removeNice = (sk: string) => {
    setNiceToHaves(niceToHaves.filter((x) => x !== sk));
  };

  const handlePublish = () => {
    eventBus.publish({
      type: "DRIVE_ANNOUNCED",
      title: "Drive published",
      data: { role, company: "Apex Cloud", mustHavesCount: mustHaves.length },
    });
    router.push("/recruiter");
  };

  return (
    <AppShell>
      <div className="space-y-8" id="s-jd">
        {/* Sub-Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <div className="text-[12px] font-mono text-ink-3">
              Recruiter portal · Job Description Studio
            </div>
            <h1 className="text-[18px] font-semibold text-ink tracking-tight mt-0.5">
              Natural Language JD Parser & Competency Extractor
            </h1>
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/recruiter"
              className="px-3.5 py-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              Candidate ranking
            </Link>
            <Link
              href="/recruiter/drives/new"
              className="px-3.5 py-1.5 rounded-full bg-surface border border-line-strong font-medium text-ink shadow-xs"
            >
              JD studio
            </Link>
            <Link
              href="/recruiter/pipeline"
              className="px-3.5 py-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-surface/60 transition-colors"
            >
              Pipeline
            </Link>
          </div>
        </div>

        {/* ===================== 06 JD EXTRACTOR SECTION ===================== */}
        <section className="space-y-3">
          <div className="sec-h flex items-baseline gap-3">
            <span className="sec-n font-mono text-[12px] text-ink-3">06</span>
            <h2 className="sec-t font-display text-[24px] font-semibold tracking-tight text-ink">
              Job description extractor
            </h2>
          </div>
          <p className="text-[14px] text-ink-2 max-w-[70ch]">
            Paste natural language JD text or load a sample. Word boundary regex matches requirements into structured
            criteria and extracts competency chips with zero manual data entry.
          </p>

          <div className="jd-grid grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: Raw JD Input & Sample Switcher */}
            <div className="card">
              <div className="head-row flex items-center justify-between gap-2 mb-3">
                <h3 className="text-[15px] font-semibold text-ink">Raw job description</h3>
                <span className="chip" id="jdName">
                  Sample {sampleIdx + 1} of {SAMPLES.length}
                </span>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setIsParsed(false);
                }}
                className={`jd w-full h-[320px] font-mono text-[13px] leading-relaxed p-3.5 rounded-[12px] border border-line bg-surface-2 text-ink resize-none focus:outline-none ${
                  isParsed ? "parsed" : ""
                }`}
                aria-label="Job description text"
              />

              <div className="row-btns flex gap-2 flex-wrap mt-3">
                <button
                  type="button"
                  onClick={handleNextSample}
                  className="btn btn-ghost sm"
                >
                  Load another sample
                </button>
                <button
                  type="button"
                  onClick={handleExtract}
                  className="btn btn-primary sm"
                >
                  Extract requirements
                </button>
              </div>
            </div>

            {/* Right Column: Extracted Structured Fields & Chips */}
            <div className="card" id="jdOut">
              <div className="head-row flex items-center justify-between gap-2 mb-3">
                <h3 className="text-[15px] font-semibold text-ink">Extracted requirements</h3>
                <span className={`chip ${isParsed ? "pri" : "warn"}`} id="jdBy">
                  Parsed by: {isParsed ? "Dynamic NLP Engine" : "Ready to parse"}
                </span>
              </div>

              <div className="fields grid grid-cols-2 gap-3 mb-3">
                <div className="fld col-span-2">
                  <label htmlFor="fRole">Role title</label>
                  <input
                    className="inp"
                    id="fRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Enter role title"
                  />
                </div>

                <div className="fld">
                  <label htmlFor="fCgpa">Minimum CGPA</label>
                  <input
                    className="inp mono"
                    id="fCgpa"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                  />
                </div>

                <div className="fld">
                  <label htmlFor="fCtc">Package (LPA)</label>
                  <input
                    className="inp mono"
                    id="fCtc"
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                  />
                </div>

                <div className="fld">
                  <label htmlFor="fBack">Max backlogs</label>
                  <input
                    className="inp mono"
                    id="fBack"
                    value={backlogs}
                    onChange={(e) => setBacklogs(e.target.value)}
                  />
                </div>

                <div className="fld">
                  <label>Eligible branches</label>
                  <div className="chips flex flex-wrap gap-1.5 min-h-[36px] items-center">
                    {branches.map((b) => (
                      <span key={b} className="chip">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Must Have Chips */}
              <h4 className="h4 text-[12px] font-semibold text-ink-3 my-2">Must-have competencies</h4>
              <div className="chips flex flex-wrap gap-2 min-h-[32px] mb-3" id="chMust">
                {mustHaves.map((sk) => (
                  <span key={sk} className="chip sk pri">
                    {sk}
                    <button
                      type="button"
                      onClick={() => removeMust(sk)}
                      aria-label={`Remove ${sk}`}
                      className="ml-1 opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Nice to Have Chips */}
              <h4 className="h4 text-[12px] font-semibold text-ink-3 my-2">Nice-to-have competencies</h4>
              <div className="chips flex flex-wrap gap-2 min-h-[32px] mb-4" id="chNice">
                {niceToHaves.map((sk) => (
                  <span key={sk} className="chip sk ok">
                    {sk}
                    <button
                      type="button"
                      onClick={() => removeNice(sk)}
                      aria-label={`Remove ${sk}`}
                      className="ml-1 opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Skill Input */}
              <div className="fld mb-4">
                <label htmlFor="addSk">Add a custom skill and press Enter</label>
                <input
                  className="inp"
                  id="addSk"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="e.g. Terraform, GraphQL, Rust"
                />
              </div>

              <div className="row-btns flex gap-2">
                <button
                  type="button"
                  onClick={handlePublish}
                  className="btn btn-primary"
                  id="jdPub"
                >
                  Publish drive to students
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
