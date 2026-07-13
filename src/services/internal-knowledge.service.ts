/**
 * Lightweight internal knowledge base used as a fallback when the external
 * AI service is unavailable (missing/invalid API key, network failure,
 * timeout, or an error response). Each handler owns one topic and is
 * self-contained, so adding support for a new question is just adding a
 * new entry to `knowledgeHandlers`.
 */

interface KnowledgeHandler {
  canHandle(message: string): boolean;
  respond(message: string): string;
}

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatWeekday(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

const daysInWeekHandler: KnowledgeHandler = {
  canHandle: (message) => /how many days\b.*\bweek/.test(message),
  respond: () => "There are 7 days in a week.",
};

const monthsInYearHandler: KnowledgeHandler = {
  canHandle: (message) => /how many months\b.*\byear/.test(message),
  respond: () => "There are 12 months in a year.",
};

const dayNameHandler: KnowledgeHandler = {
  canHandle: (message) =>
    /what day is it|today.?s day|day of the week|what.?s today.?s day/.test(message),
  respond: () => `Today is ${formatWeekday()}.`,
};

const dateHandler: KnowledgeHandler = {
  canHandle: (message) =>
    /today.?s date|current date|what.?s the date|what is the date/.test(message),
  respond: () => `Today's date is ${formatToday()}.`,
};

const ageHandler: KnowledgeHandler = {
  canHandle: (message) => /how old are you/.test(message),
  respond: () =>
    "I'm a virtual assistant, so I don't have an age — but I'm always here to help!",
};

const MATH_EXPRESSION_PATTERN = /(-?\d+(?:\.\d+)?)\s*([+\-*/x])\s*(-?\d+(?:\.\d+)?)/;

function normalizeMathExpression(message: string): string {
  return message
    .replace(/divided by/g, "/")
    .replace(/multiplied by/g, "*")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/times/g, "*");
}

function evaluateMathExpression(message: string): string | null {
  const match = normalizeMathExpression(message).match(MATH_EXPRESSION_PATTERN);
  if (!match) {
    return null;
  }

  const [, leftRaw, operator, rightRaw] = match;
  const left = Number(leftRaw);
  const right = Number(rightRaw);

  switch (operator) {
    case "+":
      return `The answer is ${left + right}.`;
    case "-":
      return `The answer is ${left - right}.`;
    case "*":
    case "x":
      return `The answer is ${left * right}.`;
    case "/":
      return right === 0 ? "I can't divide by zero." : `The answer is ${left / right}.`;
    default:
      return null;
  }
}

const mathHandler: KnowledgeHandler = {
  canHandle: (message) => MATH_EXPRESSION_PATTERN.test(normalizeMathExpression(message)),
  respond: (message) => evaluateMathExpression(message) ?? "I couldn't compute that.",
};

const knowledgeHandlers: KnowledgeHandler[] = [
  daysInWeekHandler,
  monthsInYearHandler,
  dayNameHandler,
  dateHandler,
  ageHandler,
  mathHandler,
];

export function getInternalResponse(message: string): string | null {
  const normalized = message.trim().toLowerCase();
  const handler = knowledgeHandlers.find((candidate) => candidate.canHandle(normalized));
  return handler ? handler.respond(normalized) : null;
}
