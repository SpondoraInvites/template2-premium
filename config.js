/* ============================================================
   GILDED ENVELOPE TEMPLATE — CLIENT CONFIG
   ------------------------------------------------------------
   Everything a client personalises lives in this one object.
   Fill it in, save, deploy. No other file needs editing.
   ============================================================ */

const INVITE_CONFIG = {
  /* ---------- Couple ---------- */
  couple: {
    name1: "Mehjabin Karim",
    name2: "Arman Hossain",
    initials: "M&A",            // wax seal + hero crest monogram
    hashtag: "#MehjabinAndArman",
  },

  /* ---------- Ceremony / occasion ---------- */
  // Wedding datetime — local time. Countdown, calendar links and the
  // displayed date all derive from this one value.
  weddingDateTime: "2027-02-12T18:00:00+06:00",
  dateDisplay: "Friday, 12 February 2027",
  city: "Dhaka, Bangladesh",

  /* ---------- Opening blessing ---------- */
  // Any one-line blessing, or replace with a quote. Leave "" to hide.
  blessing: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  /* ---------- Envelope intro ---------- */
  // The sealed envelope guests see on load. Tap the wax seal → the flap
  // opens, the letter rises and the invitation unfolds.
  intro: {
    enabled: true,          // false → land straight on the hero
    oncePerSession: false,  // true → the envelope only seals them once per
                            // browser session (revisits in the same tab
                            // session skip straight to the hero)
  },

  /* ---------- Families / welcome ---------- */
  welcome: {
    eyebrow: "Together with their families",
    parents1: "Daughter of Mr. Anwar Karim & Mrs. Rubaba Karim",
    parents2: "Son of Mr. Shahid Hossain & Mrs. Farhana Hossain",
    inviteLine:
      "request the honour of your presence at their wedding celebration, as they begin a beautiful new chapter together.",
  },

  /* ---------- Countdown ---------- */
  countdownNote: "until we say \u201CYes\u201D \u2014 In Shaa Allah",

  /* ---------- Events ---------- */
  // Each event becomes one card. Add or remove entries freely.
  // "mapQuery" is what gets searched on Google Maps (name or lat,lng).
  // For the calendar button to work, each event needs date (YYYY-MM-DD),
  // start/end (HH:MM, 24h, venue local time) and a timezone.
  events: [
    {
      tag: "Wedding Ceremony",
      name: "Akd & Reception",
      tagline: "followed by dinner & blessings",
      date: "Friday, 12 February 2027",
      time: "6:00 PM onwards",
      venue: "The Ruby Hall, Pan Pacific Sonargaon",
      address: "107 Kazi Nazrul Islam Ave, Dhaka 1215",
      mapQuery: "Pan Pacific Sonargaon Dhaka",
      calDate: "2027-02-12",
      calStart: "18:00",
      calEnd: "23:00",
      calTz: "Asia/Dhaka",
    },
  ],

  /* ---------- Venue / map ---------- */
  // Shown in the map section (usually your main event).
  venue: {
    name: "The Ruby Hall, Pan Pacific Sonargaon",
    address: "107 Kazi Nazrul Islam Ave, Dhaka 1215",
    mapQuery: "Pan Pacific Sonargaon Dhaka",
    mapZoom: 15,
  },

  /* ---------- Closing ---------- */
  closing: "We can\u2019t wait to celebrate with you",
  credit: "Crafted with \u2665 \u2014 Your Studio Name",

  /* ---------- Bangla (বাংলা) ----------
     Mirror of the client-visible content, shown when the visitor switches
     to Bangla via the EN/বাং toggle (top-right). Objects merge over the
     English values above key by key — any field you omit falls back to its
     English value. Arrays (events) replace wholesale. Delete this whole
     block to hide the toggle and ship an English-only invite.
     Tip: write numerals (dates, times, addresses) in Bangla digits here —
     generated numerals (countdown, footer date) convert automatically. */
  bn: {
    couple: {
      name1: "মেহজাবিন করিম",
      name2: "আরমান হোসেন",
    },
    dateDisplay: "শুক্রবার, ১২ ফেব্রুয়ারি ২০২৭",
    city: "ঢাকা, বাংলাদেশ",

    welcome: {
      eyebrow: "উভয় পরিবারের আন্তরিক আমন্ত্রণে",
      parents1: "কন্যা — জনাব আনোয়ার করিম ও মিসেস রুবাবা করিম",
      parents2: "পুত্র — জনাব শাহিদ হোসেন ও মিসেস ফারহানা হোসেন",
      inviteLine:
        "আপনাদের সৌভাগ্য ও আশীর্বাদে তাঁরা শুরু করতে যাচ্ছে জীবনের নতুন অধ্যায় — সেই আয়োজনে আপনাদের আন্তরিক আমন্ত্রণ।",
    },

    countdownNote: "একসাথে \u201Cহ্যাঁ\u201D বলার সেই মুহূর্ত পর্যন্ত — ইনশাআল্লাহ",

    events: [
      {
        tag: "বিবাহ অনুষ্ঠান",
        name: "আকদ ও রিসেপশন",
        tagline: "এরপর ডিনার ও দোয়া",
        date: "শুক্রবার, ১২ ফেব্রুয়ারি ২০২৭",
        time: "সন্ধ্যা ৬টা থেকে",
        venue: "দ্য রুবি হল, প্যান প্যাসিফিক সোনারগাঁও",
        address: "১০৭ কাজী নজরুল ইসলাম এভিনিউ, ঢাকা ১২১৫",
        mapQuery: "Pan Pacific Sonargaon Dhaka",
        calDate: "2027-02-12",
        calStart: "18:00",
        calEnd: "23:00",
        calTz: "Asia/Dhaka",
      },
    ],

    venue: {
      name: "দ্য রুবি হল, প্যান প্যাসিফিক সোনারগাঁও",
      address: "১০৭ কাজী নজরুল ইসলাম এভিনিউ, ঢাকা ১২১৫",
    },

    closing: "আপনাদের সঙ্গে উদ্‌যাপনে অধীর আগ্রহে অপেক্ষায় আছি",
    credit: "\u2665 দিয়ে নির্মিত — Your Studio Name",
  },
};

/* Export for reuse; safe to ignore in the browser. */
if (typeof module !== "undefined") {
  module.exports = INVITE_CONFIG;
}
