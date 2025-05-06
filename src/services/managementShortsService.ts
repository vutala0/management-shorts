import insights from '../data/management_shorts.json';

export interface UserPreference {
  cardId: number;
  action: 'like' | 'dislike';
  timestamp: number;
}

export interface UserStats {
  streak: number;
  totalCards: number;
  likedCards: number;
  dislikedCards: number;
  lastInteractionDate: string;
}

class ManagementShortsService {
  private readonly API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

  async saveUserPreference(preference: UserPreference): Promise<void> {
    try {
      await fetch(`${this.API_BASE_URL}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });
    } catch (error) {
      console.error('Error saving preference:', error);
      // Fallback to local storage if API fails
      this.savePreferenceLocally(preference);
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/stats`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return this.getLocalStats();
    }
  }

  async shareCard(cardId: number): Promise<string> {
    const card = insights.insights.find(insight => insight.id === cardId);
    if (!card) throw new Error('Card not found');

    const shareText = `Check out this business insight from Aspiro:\n\n${card.title}\n\n${card.summary}\n\nKey Takeaway: ${card.key_takeaway}\n\nLearn more at aspiro.app`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.title,
          text: shareText,
        });
        return 'shared';
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    
    // Fallback to clipboard
    await navigator.clipboard.writeText(shareText);
    return 'copied';
  }

  private savePreferenceLocally(preference: UserPreference): void {
    const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
    preferences.push(preference);
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }

  private getLocalStats(): UserStats {
    const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
    const likedCards = preferences.filter((p: UserPreference) => p.action === 'like').length;
    const dislikedCards = preferences.filter((p: UserPreference) => p.action === 'dislike').length;
    
    return {
      streak: this.calculateStreak(preferences),
      totalCards: preferences.length,
      likedCards,
      dislikedCards,
      lastInteractionDate: new Date().toISOString(),
    };
  }

  private calculateStreak(preferences: UserPreference[]): number {
    if (preferences.length === 0) return 0;

    const dates = preferences
      .map(p => new Date(p.timestamp).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    let currentDate = new Date(dates[0]);

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i]);
      const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  }
}

export const managementShortsService = new ManagementShortsService(); 