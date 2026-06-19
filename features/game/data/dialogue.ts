import type { CustomerPersonality, OrderComplexity } from "@/features/game/types";

export const CUSTOMER_NAMES = [
  "Alex", "Jordan", "Sam", "Riley", "Casey", "Morgan", "Taylor", "Quinn",
  "Jamie", "Drew", "Avery", "Blake", "Cameron", "Dakota", "Emery", "Finley",
];

export const GREETINGS: Record<CustomerPersonality, string[]> = {
  patient: [
    "Take your time — I'm in no rush.",
    "Smells amazing in here!",
    "I'll wait for a good pizza.",
  ],
  impatient: [
    "I'm on my lunch break — hurry please!",
    "How long is the wait?",
    "I've got places to be.",
  ],
  picky: [
    "Please get every topping exactly right.",
    "I'm very particular about my pizza.",
    "Last place messed up my order.",
  ],
  generous: [
    "Whatever you recommend is fine!",
    "I tip well for great service.",
    "Surprise me with something good.",
  ],
  quiet: [
    "...",
    "One pizza, please.",
    "Thanks.",
  ],
};

export const ORDER_TEMPLATES: Record<OrderComplexity, string[]> = {
  simple: [
    "pepperoni pizza",
    "sausage pizza please",
    "a mushroom pizza",
    "plain cheese pizza",
  ],
  moderate: [
    "pepperoni and mushroom pizza",
    "sausage with extra cheese",
    "onion and olive pizza",
    "ham and bell pepper",
  ],
  complex: [
    "half mushroom, half onion, no cheese on the mushroom side",
    "left half pepperoni, right half sausage",
    "top half veggie, bottom half meat lovers",
    "quarter olive, quarter onion, rest plain cheese",
  ],
};

export const REVIEW_COMMENTS = {
  great: ["Best pizza in town!", "Perfect order, will be back.", "Chef's kiss."],
  good: ["Pretty good, minor wait.", "Solid pizza, thanks!", "Nice crust."],
  okay: ["Decent but took a while.", "Close enough.", "Could be faster."],
  bad: ["Wrong toppings.", "Waited forever.", "Not what I ordered."],
};
