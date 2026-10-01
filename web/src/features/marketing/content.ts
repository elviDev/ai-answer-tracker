/**
 * Landing page copy. Single source for the rendered page, the FAQ/HowTo JSON-LD and llms.txt,
 * so what search engines and LLMs read always matches what people see.
 */

export type FaqItem = { question: string; answer: string };

/** The six measurements taken from every stored answer (mirrors app/analysis.py). */
export const features = [
  {
    title: "Mentions",
    body: "Whether the answer names your brand or any of its aliases, and how many times. Whole words only, so “Notionville” never counts as Notion.",
  },
  {
    title: "Position",
    body: "How early the first mention appears. Being named in the opening sentence and in a closing aside are not the same result.",
  },
  {
    title: "Rank",
    body: "Your place among the competitors you list, ordered by first mention: the order an AI recommends options in.",
  },
  {
    title: "Citations",
    body: "Whether any source the engine cites points to your own domain, the clearest sign an engine relies on you.",
  },
  {
    title: "Competitors",
    body: "How often each rival is mentioned in the same answer, so you see who is gaining ground alongside you.",
  },
  {
    title: "Change",
    body: "Whether the answer differs from the previous run, with a similarity score, so you can date the day a recommendation shifted.",
  },
] as const;

export const engineNames = ["OpenAI", "Claude", "Gemini", "Perplexity", "ChatGPT", "Google AI Overviews"] as const;

export const steps = [
  {
    title: "Add a tracker",
    body: "Enter your brand, a few competitors and a question your customers ask, like “best CRM for startups”.",
  },
  {
    title: "Pick engines and a schedule",
    body: "Choose which AI engines to ask and how often. The worker re-asks on schedule; “Run now” asks immediately.",
  },
  {
    title: "Watch the trend",
    body: "Follow mention rate, rank and citations per engine over time, and read every answer that was given.",
  },
] as const;

export const faqs: FaqItem[] = [
  {
    question: "What does AI Answer Tracker measure?",
    answer:
      "For every answer it records whether your brand is mentioned, how many times, its rank among the competitors you list, whether the answer cites your website, and whether the answer changed since the previous run.",
  },
  {
    question: "Which AI engines are supported?",
    answer:
      "OpenAI (GPT with web search), Anthropic Claude, Google Gemini and Perplexity Sonar through their official APIs, plus ChatGPT, Perplexity and Google AI Overviews scraped with a real browser.",
  },
  {
    question: "Why track AI answers instead of search rankings?",
    answer:
      "More people now ask AI assistants for recommendations instead of scanning search results. If an assistant never names your brand, you are invisible to those buyers even when you rank well in classic search.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. AI Answer Tracker is self-hosted: answers are stored in your own PostgreSQL database and the dashboard is protected by a login.",
  },
  {
    question: "How much does it cost to run?",
    answer:
      "The software is free. Official AI APIs charge per request; with web search enabled, expect a few cents per engine per run. Browser-based engines need no API keys.",
  },
];
