// Mobile-optimized ManagementShorts component
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import Card from './Card';
import insights from '../../data/management_shorts.json';
import { managementShortsService, UserStats } from '../../services/managementShortsService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f6fa;
  padding: 16px;
  position: relative;
  overflow: hidden;
`;

const CardStack = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  max-width: 360px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #7f8c8d;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  margin: 0 auto;

  h2 {
    font-size: 20px;
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    line-height: 1.5;
    color: #95a5a6;
  }
`;

const StatsContainer = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  background: white;
  padding: 12px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-width: 200px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StreakBadge = styled.div`
  background: linear-gradient(45deg, #f1c40f, #f39c12);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  margin-bottom: 8px;
`;

const SwipeCounter = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  background: white;
  padding: 12px 24px;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const Counter = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #2c3e50;
  font-size: 16px;
`;

const ManagementShorts: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCards, setLikedCards] = useState<number[]>([]);
  const [dislikedCards, setDislikedCards] = useState<number[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    streak: 0,
    totalCards: 0,
    likedCards: 0,
    dislikedCards: 0,
    lastInteractionDate: new Date().toISOString(),
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    const stats = await managementShortsService.getUserStats();
    setUserStats(stats);
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentCard = insights.insights[currentIndex];
    
    if (direction === 'right') {
      setLikedCards(prev => [...prev, currentCard.id]);
    } else {
      setDislikedCards(prev => [...prev, currentCard.id]);
    }

    setCurrentIndex(prev => prev + 1);
    await loadUserStats();
  };

  const currentCard = insights.insights[currentIndex];

  return (
    <Container>
      <StatsContainer>
        <StreakBadge>
          🔥 {userStats.streak} Day Streak
        </StreakBadge>
        <StatItem>
          <span>📊 Total:</span>
          <span>{userStats.totalCards}</span>
        </StatItem>
        <StatItem>
          <span>❤️ Liked:</span>
          <span>{userStats.likedCards}</span>
        </StatItem>
        <StatItem>
          <span>👎 Disliked:</span>
          <span>{userStats.dislikedCards}</span>
        </StatItem>
      </StatsContainer>

      <CardStack>
        <AnimatePresence>
          {currentCard ? (
            <Card
              key={currentCard.id}
              id={currentCard.id}
              title={currentCard.title}
              summary={currentCard.summary}
              key_takeaway={currentCard.key_takeaway}
              onSwipe={handleSwipe}
            />
          ) : (
            <EmptyState>
              <h2>No more insights for today! 🎉</h2>
              <p>Check back tomorrow for fresh business insights.</p>
              <p>Current Streak: {userStats.streak} days 🔥</p>
            </EmptyState>
          )}
        </AnimatePresence>
      </CardStack>

      <SwipeCounter>
        <Counter>
          <span>❤️</span>
          <span>{likedCards.length}</span>
        </Counter>
        <Counter>
          <span>👎</span>
          <span>{dislikedCards.length}</span>
        </Counter>
      </SwipeCounter>
    </Container>
  );
};

export default ManagementShorts; 