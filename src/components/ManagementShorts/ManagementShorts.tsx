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
  background: #f5f6fa;
  padding: 20px;
`;

const CardStack = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 500px;
  margin: 0 auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
`;

const StatsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const StreakBadge = styled.div`
  background: linear-gradient(45deg, #f1c40f, #f39c12);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SwipeCounter = styled.div`
  position: fixed;
  bottom: 20px;
  display: flex;
  gap: 20px;
  background: white;
  padding: 10px 20px;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Counter = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #2c3e50;
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
    await loadUserStats(); // Refresh stats after each swipe
  };

  const currentCard = insights.insights[currentIndex];

  return (
    <Container>
      <StatsContainer>
        <StatItem>
          <StreakBadge>
            🔥 {userStats.streak} Day Streak
          </StreakBadge>
        </StatItem>
        <StatItem>
          <span>📊 Total Cards:</span>
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