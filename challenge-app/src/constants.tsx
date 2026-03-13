
import { Challenge, ChallengeCategory } from './types';

export const CHALLENGES: Challenge[] = [
  // Active
  { id: 1, text: "Сделай 20 приседаний", emoji: "💪", category: 'Active' },
  { id: 2, text: "5 минут интенсивной планки", emoji: "⚡", category: 'Active' },
  { id: 3, text: "Прогуляйся в быстром темпе 10 минут", emoji: "🚶‍♂️", category: 'Active' },
  
  // Rest / Recovery
  { id: 4, text: "Просто полежи 5 минут с закрытыми глазами", emoji: "🛌", category: 'Rest', mysteryReveal: "Иногда ничегонеделание — самая продуктивная вещь, которую ты можешь сделать для своего мозга." },
  { id: 5, text: "Сделай себе чашку вкусного чая, не отвлекаясь на телефон", emoji: "🍵", category: 'Rest' },
  { id: 6, text: "Послушай одну любимую песню от начала до конца", emoji: "🎵", category: 'Rest' },

  // Mindfulness / Mental
  { id: 7, text: "Напиши 3 вещи, за которые ты благодарен сегодня", emoji: "📝", category: 'Mindfulness' },
  { id: 8, text: "Сделай 5 глубоких вдохов и выдохов", emoji: "🧘", category: 'Mindfulness', mysteryReveal: "Дыхание — это единственный мост между твоим разумом и телом. Теперь ты спокойнее." },
  { id: 9, text: "Посмотри в окно 2 минуты, замечая детали", emoji: "🪟", category: 'Mindfulness' },

  // Productivity
  { id: 10, text: "Удали 10 ненужных писем или фото", emoji: "🗑️", category: 'Productivity' },
  { id: 11, text: "Запиши главную цель на завтра", emoji: "🎯", category: 'Productivity' },
  { id: 12, text: "Разбери одну полку или ящик", emoji: "🧹", category: 'Productivity' }
];

export const PHRASES = [
  "Твой темп — правильный темп.",
  "Слушай себя внимательнее, чем других.",
  "Маленькое действие лучше большой идеи.",
  "Тишина — это тоже ответ.",
  "Завтра будет новый шанс, но сегодня — единственный момент."
];

export const SILENT_DAY_CHALLENGE: Challenge = {
  id: 0,
  text: "Сегодня — день тишины. Просто будь собой без планов.",
  emoji: "☁️",
  category: 'Rest'
};
