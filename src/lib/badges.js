import { Sprout, Compass, Map, Swords, Sparkles, Heart, Flame, Star, Trophy, Crown } from 'lucide-react';

export const BADGE_DEFINITIONS = [
  // Total Quests Tier
  {
    id: 'quest_1',
    label: 'First Step',
    description: 'Complete your very first mission.',
    icon: Sprout,
    color: '#78C850', // Grass green
    shape: 'shield',
    evaluate: (quests, courage) => quests.length >= 1
  },
  {
    id: 'quest_10',
    label: 'Dedicated Explorer',
    description: 'Complete 10 total missions.',
    icon: Compass,
    color: '#48C0A0', // Teal
    shape: 'shield',
    evaluate: (quests, courage) => quests.length >= 10
  },
  {
    id: 'quest_50',
    label: 'World Walker',
    description: 'Complete 50 total missions.',
    icon: Map,
    color: '#28A060', // Deep green
    shape: 'shield',
    evaluate: (quests, courage) => quests.length >= 50
  },

  // Rarity: Rare Tier
  {
    id: 'rare_1',
    label: 'Shiny Discovery',
    description: 'Complete 1 Rare mission.',
    icon: Star,
    color: '#6890F0', // Water blue
    shape: 'hexagon',
    evaluate: (quests, courage) => quests.filter(q => q.rarity?.toLowerCase() === 'rare').length >= 1
  },
  {
    id: 'rare_10',
    label: 'Treasure Hunter',
    description: 'Complete 10 Rare missions.',
    icon: Trophy,
    color: '#3860C0', // Deep blue
    shape: 'hexagon',
    evaluate: (quests, courage) => quests.filter(q => q.rarity?.toLowerCase() === 'rare').length >= 10
  },

  // Rarity: Epic/Legendary Tier
  {
    id: 'epic_1',
    label: 'Heroic Deed',
    description: 'Complete 1 Epic or Legendary mission.',
    icon: Swords,
    color: '#9F7AEA', // Purple
    shape: 'circle',
    evaluate: (quests, courage) => quests.filter(q => ['epic', 'legendary'].includes(q.rarity?.toLowerCase())).length >= 1
  },
  {
    id: 'epic_5',
    label: 'Myth Walk',
    description: 'Complete 5 Epic or Legendary missions.',
    icon: Crown,
    color: '#ECC94B', // Gold
    shape: 'circle',
    evaluate: (quests, courage) => quests.filter(q => ['epic', 'legendary'].includes(q.rarity?.toLowerCase())).length >= 5
  },

  // Social/Courage Tier
  {
    id: 'courage_20',
    label: 'Kind Soul',
    description: 'Send Courage 20 times in the Tavern.',
    icon: Heart,
    color: '#F08030', // Orange
    shape: 'circle',
    evaluate: (quests, courage) => courage >= 20
  },
  {
    id: 'courage_50',
    label: 'Tavern Regular',
    description: 'Send Courage 50 times in the Tavern.',
    icon: Flame,
    color: '#E05030', // Red-Orange
    shape: 'circle',
    evaluate: (quests, courage) => courage >= 50
  },
  {
    id: 'courage_100',
    label: 'Beacon of Hope',
    description: 'Send Courage 100 times in the Tavern.',
    icon: Sparkles,
    color: '#E53E3E', // Red
    shape: 'circle',
    evaluate: (quests, courage) => courage >= 100
  }
];
