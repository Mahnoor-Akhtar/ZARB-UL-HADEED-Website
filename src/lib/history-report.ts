import jsPDF from "jspdf";
import personnel from "@/data/personnel.json";

type Person = {
  id: number;
  section: string;
  armyNo: string;
  rank: string;
  trade: string;
  name: string;
  cl: string;
  bty: string;
  remarks: string | null;
};

const PERSONNEL = personnel as Person[];

const CATEGORY_MAP: Record<string, string[]> = {
  Present: ["Office", "Duty", "Standby"],
  Leave: ["P/Lve", "C/Lve", "Weekend", "Sick Lve"],
  Aval: ["Leave Reserve", "Other", "General Aval"],
  Att: ["52 RSTE", "30 CAB", "Arms Br", "Army Camp", "UN Msn", "Arty Cen", "COAS Dte", "PMA"],
  Courses: ["PRT Course", "SCC Screening", "JSC/ MCC/OGS", "ARI(G)", "JNAC", "SNBIC", "ARI(TA)"],
  "OSL/Pris": ["OSL", "Regt Prisoner", "Detained"],
  "Sta Gds": ["ISI Sub Sec Gd", "COM Gd", "PRO Sec", "FG Deg Gd", "GMP", "Ammo Gd"],
  "Unit Gds": ["Guns", "148 SP", "Prisoner", "POL", "MT", "Stores", "Office", "158 Line"],
  "CMH/Sick": ["CMH Gwa", "CMH Kht", "SIQ"],
  "Regt Emp": ["Rnrs", "Ck House", "Complain NCO", "RP", "Store Man", "DR", "Adm/Emg/CO Veh"],
  Trg: ["Guns", "Observer"],
  Sports: ["Rugby", "Volleyball"],
  "Aslt Course": ["Obstacle Trg"],
  DIDO: ["Managers", "Waiters"],
  Working: ["Weapon Maint", "Area Maint"],
  Prot: ["Chinese Team", "Players Pot"],
  "Ex/Cl": ["Remedial Class", "Other"],
  "U/D": ["Awaiting", "Under Investigation"],
};

const CATEGORY_ORDER = [
  "Present", "Leave", "Aval", "Att", "Courses", "OSL/Pris",
  "Sta Gds", "Unit Gds", "CMH/Sick", "Regt Emp", "Trg", "Sports",
  "Aslt Course", "DIDO", "Working", "Prot", "Ex/Cl", "U/D",
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const assignPerson = (p: Person) => {
  const h = hash(`${p.armyNo}:${p.id}`);
  const cat = CATEGORY_ORDER[h % CATEGORY_ORDER.length];
  const subs = CATEGORY_MAP[cat];
  const sub = subs[(h >>> 4) % subs.length];
  return { cat, sub };
};

const rankName = (p: Person) =>
  [p.rank, p.trade, p.name].filter(Boolean).join(" ");

const sectionBucket = (p: Person) => {
  if (p.section === "Officers") return "Officers";
  if (p.section === "JCOs") return "JCOs";
  return "Sldrs";
};

// Palette matching sample
const GREEN: [number, number, number] = [15, 61, 36];       // dark forest
const GREEN_SOFT: [number, number, number] = [30, 90, 55];  // slightly lighter for accents
const GOLD: [number, number, number] = [200, 165, 60];
const ORANGE: [number, number, number] = [220, 130, 30];
const TEXT: [number, number, number] = [30, 30, 30];
const MUTED: [number, number, number] = [120, 120, 120];
const BORDER: [number, number, number] = [220, 220, 220];
const TABLE_HEAD_BG: [number, number, number] = [235, 244, 238];

export function downloadHistoryReport(user: { rank: string; name: string; armyNo: string }) {
  void user;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;
  let pageNum = 0;

  // Aggregate
  const sectionCounts = { Officers: 0, JCOs: 0, Sldrs: 0 };
  const catCounts: Record<string, number> = {};
  const subDetail: Record<string, { p: Person; sub: string }[]> = {};

  for (const p of PERSONNEL) {
    sectionCounts[sectionBucket(p) as keyof typeof sectionCounts]++;
    const { cat, sub } = assignPerson(p);
    catCounts[cat] = (catCounts[cat] || 0) + 1;
    (subDetail[cat] ||= []).push({ p, sub });
  }
  const total = PERSONNEL.length;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const setFill = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const setDraw = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);

  const pageTopBar = () => {
    // Top-right small caption
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(MUTED);
    doc.text("ZARB-UL-HADEED - PARADE STATE REPORT", pageW - margin, 24, { align: "right" });
    // Thin bottom rule under caption
    setDraw(BORDER);
    doc.setLineWidth(0.4);
    doc.line(margin, 30, pageW - margin, 30);
    setText(TEXT);
  };

  const pageFooter = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setText(MUTED);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 24, { align: "right" });
    setText(TEXT);
  };

  const newPage = (first = false) => {
    if (!first) {
      pageFooter();
      doc.addPage();
    }
    pageNum++;
    y = 40;
    pageTopBar();
    y = 46;
  };

  const ensureSpace = (need: number) => {
    if (y + need > pageH - 50) newPage();
  };

  // ==== Page 1 ====
  newPage(true);

  // Green banner
  const bannerH = 70;
  setFill(GREEN);
  doc.roundedRect(margin, y, pageW - margin * 2, bannerH, 8, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  setText([255, 255, 255]);
  doc.text("ZARB-UL-HADEED", margin + 20, y + 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setText(GOLD);
  doc.text("117 SP REGT. - PARADE STATE REPORT", margin + 20, y + 52);
  // Date right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setText([255, 255, 255]);
  doc.text(dateStr, pageW - margin - 20, y + 42, { align: "right" });
  y += bannerH + 24;
  setText(TEXT);

  // Section heading with gold underline
  const sectionHeading = (text: string) => {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    setText(GREEN);
    doc.text(text, margin, y);
    y += 6;
    setDraw(GOLD);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + 80, y);
    y += 18;
    setText(TEXT);
  };

  const subHeading = (text: string) => {
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setText(TEXT);
    doc.text(text, margin, y);
    y += 14;
  };

  sectionHeading("Strength & Category Analysis");
  subHeading("Personnel Strengths Summary");

  const drawTable = (
    headers: string[],
    rows: (string | number)[][],
    widths: number[],
    boldLastRow = false,
  ) => {
    const rowH = 22;
    const totalW = widths.reduce((a, b) => a + b, 0);
    const x0 = margin;
    ensureSpace(rowH);
    // Header
    setFill(TABLE_HEAD_BG);
    doc.rect(x0, y, totalW, rowH, "F");
    setDraw(BORDER);
    doc.setLineWidth(0.5);
    doc.rect(x0, y, totalW, rowH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setText(GREEN);
    let cx = x0;
    headers.forEach((h, i) => {
      doc.text(h, cx + 10, y + 14);
      // vertical divider
      if (i > 0) {
        doc.line(cx, y, cx, y + rowH);
      }
      cx += widths[i];
    });
    y += rowH;
    setText(TEXT);
    doc.setFont("helvetica", "normal");
    rows.forEach((row, idx) => {
      ensureSpace(rowH);
      const isLast = idx === rows.length - 1;
      if (boldLastRow && isLast) doc.setFont("helvetica", "bold");
      else doc.setFont("helvetica", "normal");
      let x = x0;
      row.forEach((cell, i) => {
        const t = String(cell);
        doc.text(t, x + 10, y + 14);
        if (i > 0) {
          setDraw(BORDER);
          doc.line(x, y, x, y + rowH);
        }
        x += widths[i];
      });
      setDraw(BORDER);
      doc.rect(x0, y, totalW, rowH);
      y += rowH;
    });
    y += 16;
  };

  const usableW = pageW - margin * 2;
  drawTable(
    ["Category / Group", "Count", "Percentage"],
    [
      ["Officers", sectionCounts.Officers, pct(sectionCounts.Officers)],
      ["JCOs", sectionCounts.JCOs, pct(sectionCounts.JCOs)],
      ["Soldiers (Sldrs)", sectionCounts.Sldrs, pct(sectionCounts.Sldrs)],
      ["Total Strength", total, "100%"],
    ],
    [usableW * 0.5, usableW * 0.22, usableW * 0.28],
    true,
  );

  subHeading("Main Categories Strength");
  drawTable(
    ["Category", "Current Count", "% of Total"],
    CATEGORY_ORDER.map((c) => [c, catCounts[c] || 0, pct(catCounts[c] || 0)]),
    [usableW * 0.5, usableW * 0.25, usableW * 0.25],
  );

  // ==== Category-Wise Distribution Details ====
  newPage();
  sectionHeading("Category-Wise Distribution Details");

  const CHUNK = 12;
  const colW = (usableW - 12) / 2; // two columns, 12pt gap
  const cardHeaderH = 22;
  const lineH = 14;
  const cardPadY = 8;
  const gap = 12;

  type Card = { cat: string; label: string; rows: { name: string; sub: string }[]; total: number };
  const cards: Card[] = [];
  for (const cat of CATEGORY_ORDER) {
    const entries = subDetail[cat] || [];
    if (entries.length === 0) continue;
    const parts = Math.ceil(entries.length / CHUNK);
    for (let pi = 0; pi < parts; pi++) {
      const chunk = entries.slice(pi * CHUNK, (pi + 1) * CHUNK);
      const label = parts > 1 ? `${cat} (${pi + 1}/${parts})` : cat;
      cards.push({
        cat,
        label,
        total: entries.length,
        rows: chunk.map((e) => ({ name: rankName(e.p), sub: e.sub })),
      });
    }
  }

  const cardHeight = (c: Card) => {
    // measure wrapped names
    let h = cardHeaderH + cardPadY * 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const nameColW = colW * 0.62 - 20;
    for (const r of c.rows) {
      const lines = doc.splitTextToSize(r.name, nameColW) as string[];
      h += Math.max(lineH, lines.length * lineH);
    }
    return h;
  };

  const drawCard = (c: Card, x: number, yTop: number) => {
    const h = cardHeight(c);
    // header
    setFill(GREEN);
    doc.roundedRect(x, yTop, colW, cardHeaderH, 3, 3, "F");
    // clip bottom rounding by rect
    doc.rect(x, yTop + cardHeaderH - 6, colW, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setText([255, 255, 255]);
    doc.text(c.label, x + 10, yTop + 15);
    setText(ORANGE);
    doc.text(String(c.total), x + colW - 10, yTop + 15, { align: "right" });

    // body
    setText(TEXT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let cy = yTop + cardHeaderH + cardPadY + 10;
    const nameX = x + 10;
    const subX = x + colW * 0.62;
    const nameColW = colW * 0.62 - 20;
    for (const r of c.rows) {
      const lines = doc.splitTextToSize(r.name, nameColW) as string[];
      doc.text(lines, nameX, cy);
      doc.text(r.sub, subX, cy);
      cy += Math.max(lineH, lines.length * lineH);
    }
    return h;
  };

  // Layout cards 2-up
  for (let i = 0; i < cards.length; i += 2) {
    const left = cards[i];
    const right = cards[i + 1];
    const hL = cardHeight(left);
    const hR = right ? cardHeight(right) : 0;
    const rowH = Math.max(hL, hR);
    ensureSpace(rowH + 12);
    drawCard(left, margin, y);
    if (right) drawCard(right, margin + colW + gap, y);
    y += rowH + 16;
  }

  pageFooter();
  doc.save(`personnel-history-${new Date().toISOString().slice(0, 10)}.pdf`);
}
