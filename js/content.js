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

// Flow 5: the knowing-doing gap. The barrier decides the strategy; the
// target supplies specifics. Willpower is never the plan.
export const sabotage = {
  targets: [
    { value: "sleep", text: "Going to bed earlier" },
    { value: "alcohol", text: "Drinking less" },
    { value: "water", text: "Drinking more water" },
    { value: "move", text: "Moving my body" },
    { value: "food", text: "Eating real meals" },
    { value: "screen", text: "Less scrolling" },
    { value: "other", text: "Something else" },
  ],
  contexts: [
    { value: "evening", text: "In the evening" },
    { value: "afterwork", text: "Right after work" },
    { value: "stress", text: "When stress is high" },
    { value: "flat", text: "When I'm bored or flat" },
    { value: "social", text: "Around other people" },
    { value: "allday", text: "All day, low-key" },
  ],
  barriers: [
    { value: "cue", text: "I just forget in the moment" },
    { value: "energy", text: "No energy left by the time it matters" },
    { value: "metime", text: "It feels like giving up my only me-time" },
    { value: "pull", text: "The pull of the other thing is too strong" },
    { value: "friction", text: "Starting feels like too much hassle" },
    { value: "ambivalence", text: "Honestly, part of me doesn't want to" },
  ],
  strategies: {
    cue: {
      title: "Not weakness — a missing cue",
      body: "Willpower never got a chance: by the time you remember, the moment is gone. The fix is a louder cue, not more discipline.",
      plans: {
        water: { ifthen: "When I sit down in my usual spot, I drink from the bottle that's already there.", prep: "Fill a bottle and put it in your spot" },
        sleep: { ifthen: "When the wind-down alarm goes, I start — no negotiation, no one-more-thing.", prep: "Set a daily wind-down alarm, label it kindly" },
        alcohol: { ifthen: "When I open the fridge after dinner, I take whatever is at eye level.", prep: "Put the alternative drink at eye level" },
        generic: { ifthen: "When my reminder goes, I do the two-minute version. Nothing more is owed.", prep: "Set one alarm for the exact moment it should happen" },
      },
    },
    energy: {
      title: "Not willpower — an empty tank",
      body: "Evening-you runs on fumes and shouldn't be trusted with decisions. Move the deciding and the prep to a time when there's still fuel.",
      plans: {
        sleep: { ifthen: "I decide bedtime at dinner, not at midnight: alarm set, things laid out, before the fuel runs out.", prep: "Set tonight's wind-down alarm right now" },
        water: { ifthen: "Most of the water happens before five, while there's still momentum.", prep: "Fill tomorrow's big bottle and put it out tonight" },
        alcohol: { ifthen: "The decision happens early: if nothing is cold by evening, tired-me won't fix that.", prep: "Take tonight's drinks out of the fridge" },
        generic: { ifthen: "Earlier-me sets everything up; evening-me only follows the arrows.", prep: "Do one piece of prep right now, while you're here" },
      },
    },
    metime: {
      title: "Not sabotage — protest",
      body: "If this is where your only free time dies, of course you fight it. The me-time is legitimate. Don't cancel it — re-home it.",
      plans: {
        sleep: { ifthen: "At wind-down time I keep doing the exact same fun thing — in bed, lights low. The me-time comes along.", prep: "Put your charger by the bed, deal sealed" },
        alcohol: { ifthen: "Same chair, same hour, fancy glass — the ritual stays, only the liquid changes.", prep: "Put tomorrow's ritual drink in the fridge" },
        screen: { ifthen: "Scrolling gets a protected slot earlier in the evening, guilt-free, with an end mark.", prep: "Pick tonight's slot and set its end alarm" },
        generic: { ifthen: "The me-time goes on the calendar before the should-do, protected instead of stolen.", prep: "Block 30 guilt-free minutes for tomorrow, now" },
      },
    },
    pull: {
      title: "A habit loop, not a character flaw",
      body: "In the moment, the pull always wins — so stop fighting in the moment. Rig the room beforehand: one step harder for it, one step easier for the swap.",
      plans: {
        alcohol: { ifthen: "Out of the fridge, out of sight; the alternative cold and in front. The lazy option becomes the good option.", prep: "Do the swap now: drinks to the back, alternative in the fridge" },
        screen: { ifthen: "The phone sleeps outside the bedroom; something analog takes its place on the nightstand.", prep: "Move the charger out of the bedroom" },
        sleep: { ifthen: "The phone sleeps outside the bedroom; the bed stops being a feed-reader.", prep: "Move the charger out of the bedroom" },
        generic: { ifthen: "One step of friction gets added to the pull; one step gets removed from the should.", prep: "Make one of those two moves right now" },
      },
    },
    friction: {
      title: "The first step is too expensive",
      body: "Not laziness — the start cost is just too high for a tired brain. Shrink the step until it's nearly free, and only ever commit to that.",
      plans: {
        water: { ifthen: "The bar is one glass when I stand up. A glass, not a regime.", prep: "Drink one glass of water now. That's the whole step" },
        sleep: { ifthen: "Wind-down lite: teeth brushed and phone charging by the alarm. Whatever happens after is allowed.", prep: "Set that one alarm now" },
        move: { ifthen: "The commitment is shoes on and out the door. Coming straight back is permitted.", prep: "Put the shoes by the door" },
        generic: { ifthen: "Only the two-minute version exists. Anything beyond it is a bonus, not the deal.", prep: "Do the two-minute version once, right now" },
      },
    },
    ambivalence: {
      title: "Half of you isn't on board",
      body: "Plans built on a hidden no collapse quietly. So don't sign a life sentence — run a short experiment and judge it on data, not vibes.",
      plans: {
        generic: { ifthen: "Three days, honest trial, then a real re-decision. Permission to quit is part of the deal.", prep: "Set one reminder for the re-decide moment, three days out" },
      },
    },
  },
  outcomes: {
    did: "It happened. No streak to protect — tonight is just tonight, again.",
    partly: "Partly counts. The plan held some weight, and that's data.",
    not: "No verdict. When a plan doesn't happen, the plan was too big or the cue missed — those are fixable, you aren't broken.",
  },
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
