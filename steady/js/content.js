// All copy and static action templates live here.
// Tone: plain, warm, zero fluff. No exclamation marks. The AI layer will later
// rephrase actions with context; these are the deterministic fallbacks.

export const emotions = [
  "anxious", "restless", "angry", "sad", "empty", "foggy", "wired", "lonely", "flat",
];

export const moods = [
  "calm", "okay", "content", "tired", "wired", "anxious", "flat", "irritable", "overloaded",
];

const isEvening = () => new Date().getHours() >= 18 || new Date().getHours() < 5;

export const stateCheck = {
  bodyQuestions: [
    {
      key: "muscles",
      label: "Your muscles right now",
      options: [
        { value: "over", text: "Tense, wound up" },
        { value: "under", text: "Heavy, flat" },
        { value: "none", text: "Neither" },
      ],
    },
    {
      key: "head",
      label: "Heart and head",
      options: [
        { value: "over", text: "Racing, buzzing" },
        { value: "under", text: "Slow, foggy" },
        { value: "none", text: "Neither" },
      ],
    },
    {
      key: "senses",
      label: "Sounds, light, skin",
      options: [
        { value: "over", text: "Everything irritates" },
        { value: "under", text: "Numb, a bit bored" },
        { value: "none", text: "Neither" },
      ],
    },
  ],
  discriminator: {
    label: "The deciding question",
    question: "Would more input right now feel better or worse?",
    options: [
      { value: "under", text: "Better" },
      { value: "over", text: "Worse" },
      { value: "none", text: "Don't know" },
    ],
  },
  verdicts: {
    over: {
      title: "You look overloaded",
      body: "Too much got in. The fix is less, not more.",
    },
    under: {
      title: "You look understimulated",
      body: "Not laziness. Your brain is asking for input.",
    },
    mixed: {
      title: "Hard to tell, and that's allowed",
      body: "Mixed signals are still information. Start with the smallest safe thing.",
    },
  },
  actions: {
    over: () => isEvening()
      ? [
          "Phone in the other room. Lie down for 20 minutes. No audio.",
          "Lights low, phone away. Warm shower, then nothing.",
        ]
      : [
          "Phone in the other room. Lie down for 20 minutes. No audio.",
          "Find the quietest room. Sit there for 15 minutes. Nothing playing.",
          "Noise off, sunglasses or hood on. Stare out a window for 10 minutes.",
        ],
    under: () => isEvening()
      ? [
          "Walk around the block. No destination.",
          "One loud song, full volume, and tidy one surface.",
        ]
      : [
          "Put on loud music and do the dishes.",
          "Walk around the block. No destination.",
          "Cold water on your face, then the nearest 10-minute chore.",
        ],
    mixed: () => [
      "Step outside for 5 minutes. Just stand there.",
    ],
  },
};

export const unstick = {
  // Smallest-step suggestions keyed by rough task type. The AI layer will
  // generate task-specific ones later; these cover the common shapes.
  stepHeuristics: [
    { match: /\b(mail|email|reply|message|bericht|antwoord)\b/i, steps: [
      "Open the thread and just read it once",
      "Write one sentence back, send nothing yet",
    ]},
    { match: /\b(call|phone|ring|bel|bellen)\b/i, steps: [
      "Find the number and put it on screen",
      "Write the one sentence you'll open with",
    ]},
    { match: /\b(tax|belasting|form|formulier|admin|invoice|factuur|paperwork)\b/i, steps: [
      "Open the portal and just log in",
      "Find the first document you need",
      "Make the folder it will all live in",
    ]},
    { match: /\b(clean|tidy|dishes|laundry|vacuum|schoonmaken|afwas|was|stofzuigen)\b/i, steps: [
      "Clear one surface, only one",
      "Set a 10-minute timer and start with the easiest spot",
    ]},
    { match: /\b(write|report|essay|doc|post|schrijf|verslag)\b/i, steps: [
      "Open a blank file and write one bad sentence",
      "Write three bullet points of what it should say",
    ]},
    { match: /\b(groceries|shop|boodschappen|kopen|buy|order)\b/i, steps: [
      "Write down the first three things you need",
      "Open the store page, put one thing in the cart",
    ]},
  ],
  genericSteps: [
    "Open the thing it lives in",
    "Find the first thing you need and put it in front of you",
    "Clear the spot where it happens",
    "Write one line: what does done look like",
  ],
  evenSmallerSteps: [
    "Stand up and walk to where it happens",
    "Open it and look at it for one minute. That's all",
    "Do only the first two minutes, then you're free",
  ],
};

export const goOrCancel = {
  categories: [
    { value: "call", text: "A call" },
    { value: "one_on_one", text: "Meeting one person" },
    { value: "group", text: "Group event" },
    { value: "networking", text: "Networking" },
    { value: "family", text: "Family" },
    { value: "other", text: "Something else" },
  ],
  capacityQuestions: [
    "Slept badly the last few nights?",
    "Already had big social stuff this week?",
    "Sensory-heavy days lately?",
    "Sick, or getting sick?",
  ],
  verdicts: {
    capacity_cancel: {
      kicker: "Verdict",
      title: "Your tank is actually empty",
      body: "Cancelling this is maintenance, not avoidance. Cancel guilt-free, then rest like you mean it.",
      cta: "Cancel it, then rest for real",
    },
    genuine_no: {
      kicker: "Verdict",
      title: "This might be a real no",
      body: "Not everything is avoidance. You'd cancel even without the anxiety, and this kind of thing rarely lands for you. Cancelling can be the honest answer.",
      cta: "Cancel it and don't relitigate",
    },
    go: {
      kicker: "Verdict",
      title: "This looks like avoidance",
      body: "You have the capacity. The dread is anxiety talking, and anxiety is a vote for going, not a verdict.",
      cta: "Go for 30 minutes",
      ctaSub: "Leaving after that is allowed. That's the whole deal.",
    },
  },
};

export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
