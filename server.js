const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// If a Railway Volume is mounted, point DATA_DIR at it so results survive
// redeploys. Otherwise this falls back to local (ephemeral) storage.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "results.json");

const SEED_RESULTS = [
  { id: "seed-1", name: "پگاه", emoji: "💛", tops: [2, 7, 9], kind: "manual",
    motor: "رابطه و مفید بودن. رگهٔ ۷ کمی بازیگوشی، تنوع و معاشرت اضافه می‌کند و رگهٔ ۹ هم نرمش و صلح‌طلبی.",
    strength: "گرم، حامی، آدم‌جمع‌کن.",
    risk: "گاهی آن‌قدر روی بقیه تمرکز می‌کند که نیاز خودش عقب بیفتد.",
    quote: "همه خوبن؟ چیزی لازم ندارین؟ خب حالا برم به کار واحالم هم بکنیم؟",
    submittedAt: "2026-08-01T08:00:00.000Z" },
  { id: "seed-2", name: "هادی", emoji: "🏆", tops: [3, 6, 4, 5], kind: "manual",
    motor: "نتیجه و موفقیت. رگهٔ ۶ باعث می‌شود برنامه و ریسک را هم جدی بگیرد؛ رگه‌های ۴ و ۵ نشان می‌دهند فقط سطح عملکرد برایش مهم نیست.",
    strength: "مؤثر، هدفمند و قابل‌اتکا.",
    risk: "بیش از حد خودش را با عملکرد تعریف می‌کند.",
    quote: "هدف چیه؟ برنامه چیه؟ کی شروع کنیم؟",
    submittedAt: "2026-08-01T08:05:00.000Z" },
  { id: "seed-3", name: "سمیرا", emoji: "😊", tops: [2, 3], kind: "manual",
    motor: "رابطه و حمایت. کمک به دیگران پررنگ است، اما نتیجه هم برایش مهم است.",
    strength: "مهربان، در دسترس و انگیزه‌دهنده.",
    risk: "«مفید بودن» را با داشتن ارزش نزد دیگران یکی می‌گذارد.",
    quote: "بذار کمکت کنم... ولی حالا کار داریم و حساب‌وکتاب بدیم.",
    submittedAt: "2026-08-01T08:10:00.000Z" },
  { id: "seed-4", name: "صدرا", emoji: "🌱", tops: [7, 6], kind: "manual",
    motor: "تجربه، آزادی و تنوع. چیزهای تازه و حس حرکت جذاب‌اند؛ رگهٔ ۶ کنار ۷ یک صدای دوم می‌پرسد «ولی مطمئنی؟»",
    strength: "خوش‌انرژی، منعطف و فرصت‌بین.",
    risk: "تکرار و محدودیت خسته‌کننده می‌شود یا گزینه‌های زیاد تمرکز را سخت می‌کند.",
    quote: "بریم یه جای جدید! صبر کن، اول Reviews رو ببینیم.",
    submittedAt: "2026-08-01T08:15:00.000Z" },
  { id: "seed-5", name: "نغمه", emoji: "🦑", tops: [2, 5, 7], kind: "manual",
    motor: "سه انگیزهٔ تقریباً هم‌قدرت: آدم‌ها، فهم و استقلال ذهنی، و تجربه و تنوع. بسته به موقعیت کاملاً متفاوت دیده می‌شود.",
    strength: "انعطاف بالا و ترکیب احساس، فکر و تجربه.",
    risk: "دشوار است بگوید کدام انگیزه بنیادی‌تر است.",
    quote: "انتخاب بین این سه تا؟ هر سه رو می‌خوام، نه ممکن نیست!",
    submittedAt: "2026-08-01T08:20:00.000Z" },
  { id: "seed-6", name: "پویا", emoji: "🐬", tops: [5, 2, 6, 9], kind: "manual",
    motor: "فهمیدن، تحلیل‌کردن و دانستن. قبل از تصمیم دوست دارد مسئله را بفهمد، داده جمع کند و مقایسه کند.",
    strength: "کنجکاوی و دید چندزاویه؛ ممکن است تحقیقش تبدیل به یک پروژهٔ مستقل شود.",
    risk: "چک‌کردن بیش از حد؛ نمرات هنوز به هم نزدیک‌اند.",
    quote: "قبل از اینکه جواب بدم، فقط بذار این Reddit thread و اسپردشیت رو یه چک بزنم.",
    submittedAt: "2026-08-01T08:25:00.000Z" },
  { id: "seed-7", name: "نسترن", emoji: "🐢", tops: [4, 5, 9], kind: "manual",
    motor: "ترکیب اصالت، هویت و عمق شخصی از یک طرف، و استقلال فکری و عمق فهم از طرف دیگر.",
    strength: "عمق. رگهٔ ۹ هم کمی آرامش‌طلبی به ترکیب اضافه می‌کند.",
    risk: "زیادی در دنیای درونی و تحلیل شخصی فرو رود؛ خواسته یا مخالفت را دیرتر مطرح کند.",
    quote: "نه فقط می‌خوام بفهمم؛ می‌خوام بفهمم چرا این‌طوری معنی می‌ده.",
    submittedAt: "2026-08-01T08:30:00.000Z" },
  { id: "seed-8", name: "رویا", emoji: "🌷", tops: [2, 9], kind: "manual",
    motor: "مراقبت از آدم‌ها و این‌که فضا آرام و بدون تنش بماند.",
    strength: "آرام‌کننده؛ پشت ظاهر آرام، تحلیل زیادی در جریان است.",
    risk: "برای جلوگیری از تنش، خواسته یا مخالفت خودش را دیرتر مطرح می‌کند.",
    quote: "همه آروم باشین... درستش می‌کنیم... فقط لطفاً دعوا نکنیم.",
    submittedAt: "2026-08-01T08:35:00.000Z" },
  { id: "seed-9", name: "سلمان", emoji: "💊", tops: [1, 5, 6], kind: "manual",
    motor: "درست انجام‌دادن کار. استاندارد مهم است، دقت و اطمینان قبل از اقدام لازم است، و باید قابل‌اعتماد و دقیق بود.",
    strength: "مسئولیت‌پذیری، دقت و ساختار قوی.",
    risk: "سخت‌گیری زیاد به خود یا دیگران؛ بررسی بیش از حد یا حساسیت به اشتباه.",
    quote: "باشه انجامش می‌دیم؛ ولی چرا اول درست انجامش ندیم؟",
    submittedAt: "2026-08-01T08:40:00.000Z" }
];

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_RESULTS, null, 2), "utf-8");
  }
}

function readResults() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : SEED_RESULTS;
  } catch (e) {
    return SEED_RESULTS;
  }
}

function writeResults(list) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/results", (req, res) => {
  res.json(readResults());
});

app.post("/api/results", (req, res) => {
  const { name, counts } = req.body || {};

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "نام لازم است" });
  }
  if (!counts || typeof counts !== "object") {
    return res.status(400).json({ error: "امتیازها نامعتبر است" });
  }

  const safeCounts = {};
  for (let t = 1; t <= 9; t++) {
    const v = Number(counts[t]);
    safeCounts[t] = Number.isFinite(v) && v >= 0 ? Math.round(v) : 0;
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim().slice(0, 40),
    counts: safeCounts,
    kind: "quiz",
    submittedAt: new Date().toISOString()
  };

  const list = readResults();
  list.push(entry);
  writeResults(list);

  res.status(201).json(entry);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`نه‌چهره من در حال اجراست روی پورت ${PORT}`);
});
