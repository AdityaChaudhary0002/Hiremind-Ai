export const DAILY_TIPS = [
    "When answering system design questions, always start by clarifying constraints and requirements.",
    "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
    "Think out loud during coding interviews. Your thought process is as important as the solution.",
    "Don't optimize prematurely. Start with a brute-force solution, then refine.",
    "Ask clarifying questions before jumping into code.",
    "Handling edge cases shows attention to detail. Always verify inputs.",
    "Understand the trade-offs of the data structures you choose (Time vs. Space complexity).",
    "Communication is key. If you're stuck, explain what you're thinking.",
    "Mock interviews reduce anxiety. Practice makes perfect.",
    "Review your resume thoroughly. Be prepared to explain every bullet point.",
    "Research the company's tech stack and values before the interview.",
    "Prepare a few questions to ask the interviewer at the end.",
    "Clean code matters. Use meaningful variable names and consistent formatting.",
    "Understand the difference between TCP and UDP for networking questions.",
    "Know your Big O notation. It's the standard language of efficiency.",
    "For frontend roles, understand the DOM, event bubbling, and closures.",
    "For backend roles, understand database indexing, CAP theorem, and RESTful principles.",
    "Be honest if you don't know an answer. Explain how you would find out.",
    "A positive attitude can compensate for minor technical gaps.",
    "Rest well before the interview. A sharp mind is your best tool."
];

export const getRandomTip = () => {
    return DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
};
