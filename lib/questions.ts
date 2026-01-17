import { OnboardingQuestion } from '@/types';

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // Section A: Pain Awareness (Questions 1-4)
  {
    number: 1,
    section: 'pain',
    text: 'What is the dull and persistent dissatisfaction you\'ve learned to live with? Not the deep suffering but what you\'ve learned to tolerate.',
    placeholder: 'The dissatisfaction I tolerate is...',
  },
  {
    number: 2,
    section: 'pain',
    text: 'What do you complain about repeatedly but never actually change? Write down the three complaints you\'ve voiced most often in the past year.',
    placeholder: '1.\n2.\n3.',
  },
  {
    number: 3,
    section: 'pain',
    text: 'For each complaint: What would someone who watched your behavior (not your words) conclude that you actually want?',
    placeholder: 'Based on my behavior, I actually want...',
  },
  {
    number: 4,
    section: 'pain',
    text: 'What truth about your current life would be unbearable to admit to someone you deeply respect?',
    placeholder: 'The unbearable truth is...',
  },

  // Section B: Anti-Vision (Questions 5-11)
  {
    number: 5,
    section: 'anti-vision',
    text: 'If absolutely nothing changes for the next five years, describe an average Tuesday. Where do you wake up? What does your body feel like? What\'s the first thing you think about? Who\'s around you? What do you do between 9am and 6pm? How do you feel at 10pm?',
    placeholder: 'On an average Tuesday in 5 years...',
  },
  {
    number: 6,
    section: 'anti-vision',
    text: 'Now do it but for ten years. What have you missed? What opportunities closed? Who gave up on you? What do people say about you when you\'re not in the room?',
    placeholder: 'In 10 years, I\'ve missed...',
  },
  {
    number: 7,
    section: 'anti-vision',
    text: 'You\'re at the end of your life. You lived the safe version. You never broke the pattern. What was the cost? What did you never let yourself feel, try, or become?',
    placeholder: 'The cost of playing it safe was...',
  },
  {
    number: 8,
    section: 'anti-vision',
    text: 'Who in your life is already living the future you just described? Someone five, ten, twenty years ahead on the same trajectory? What do you feel when you think about becoming them?',
    placeholder: 'The person living this future is... and I feel...',
  },
  {
    number: 9,
    section: 'anti-vision',
    text: 'What identity would you have to give up to actually change? ("I am the type of person who...") What would it cost you socially to no longer be that person?',
    placeholder: 'I am the type of person who... and it would cost me...',
  },
  {
    number: 10,
    section: 'anti-vision',
    text: 'What is the most embarrassing reason you haven\'t changed? The one that makes you sound weak, scared, or lazy rather than reasonable?',
    placeholder: 'The embarrassing truth is...',
  },
  {
    number: 11,
    section: 'anti-vision',
    text: 'If your current behavior is a form of self-protection, what exactly are you protecting? And what is that protection costing you?',
    placeholder: 'I\'m protecting... and it\'s costing me...',
  },

  // Section C: Vision (Questions 12-14)
  {
    number: 12,
    section: 'vision',
    text: 'Forget practicality for a minute. If you could snap your fingers and be living a different life in three years, not what\'s realistic, what you actually want? What does an average Tuesday look like? Same level of detail as q5.',
    placeholder: 'On my ideal Tuesday in 3 years...',
  },
  {
    number: 13,
    section: 'vision',
    text: 'What would you have to believe about yourself for that life to feel natural rather than forced? Write the identity statement: "I am the type of person who..."',
    placeholder: 'I am the type of person who...',
  },
  {
    number: 14,
    section: 'vision',
    text: 'What is one thing you would do this week if you were already that person?',
    placeholder: 'This week I would...',
  },

  // Section D: Synthesis (Questions 15-22)
  {
    number: 15,
    section: 'synthesis',
    text: 'After today, what feels most true about why you\'ve been stuck?',
    placeholder: 'The truth about why I\'m stuck is...',
  },
  {
    number: 16,
    section: 'synthesis',
    text: 'What is the actual enemy? Name it clearly. Not circumstances. Not other people. The internal pattern or belief that has been running the show.',
    placeholder: 'The actual enemy is...',
  },
  {
    number: 17,
    section: 'synthesis',
    text: 'Write a single sentence that captures what you refuse to let your life become. This is your anti-vision compressed. It should make you feel something when you read it.',
    placeholder: 'I refuse to...',
  },
  {
    number: 18,
    section: 'synthesis',
    text: 'Write a single sentence that captures what you\'re building toward, knowing it will evolve. This is your vision MVP.',
    placeholder: 'I am building toward...',
  },
  {
    number: 19,
    section: 'synthesis',
    text: 'One-year lens: What would have to be true in one year for you to know you\'ve broken the old pattern? One concrete thing.',
    placeholder: 'In one year, this must be true...',
  },
  {
    number: 20,
    section: 'synthesis',
    text: 'One-month lens: What would have to be true in one month for the one-year lens to remain possible?',
    placeholder: 'In one month, this must be true...',
  },
  {
    number: 21,
    section: 'synthesis',
    text: 'Daily lens: What are 2-3 actions you can timeblock tomorrow that the person you\'re becoming would simply do?',
    placeholder: '1.\n2.\n3.',
  },
  {
    number: 22,
    section: 'synthesis',
    text: 'Constraints: What am I not willing to sacrifice to achieve my vision from the ground up?',
    placeholder: 'I will not sacrifice...',
  },
];

export const DAY_INTERRUPT_QUESTIONS = [
  'What am I avoiding right now by doing what I\'m doing?',
  'If someone filmed the last two hours, what would they conclude I want from my life?',
  'Am I moving toward the life I hate or the life I want?',
  'What\'s the most important thing I\'m pretending isn\'t important?',
  'What did I do today out of identity protection rather than genuine desire? (Hint: it\'s most things you do)',
  'When did I feel most alive today? When did I feel most dead?',
];

export const BONUS_QUESTIONS = [
  'What would change if I stopped needing people to see me as [the identity you wrote in question 10]?',
  'Where in my life am I trading aliveness for safety?',
  'What\'s the smallest version of the person I want to become that I could be tomorrow?',
];
