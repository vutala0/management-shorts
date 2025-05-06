import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import styled from 'styled-components';
import { managementShortsService } from '../../services/managementShortsService';

interface CardProps {
  id: number;
  title: string;
  summary: string;
  key_takeaway: string;
  onSwipe: (direction: 'left' | 'right') => void;
}

const CardContainer = styled(motion.div)`
  position: absolute;
  width: 90%;
  max-width: 400px;
  height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: grab;
  user-select: none;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 15px;
  color: #2c3e50;
`;

const CardSummary = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #34495e;
  margin-bottom: 20px;
  flex-grow: 1;
`;

const KeyTakeaway = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #3498db;
  margin-top: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    transform: scale(1.1);
  }
`;

const SwipeIndicator = styled(motion.div)<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 20px;
  ${props => props.direction === 'left' ? 'left: 20px' : 'right: 20px'};
  font-size: 24px;
  color: ${props => props.direction === 'left' ? '#e74c3c' : '#2ecc71'};
`;

const Card: React.FC<CardProps> = ({ id, title, summary, key_takeaway, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
      await managementShortsService.saveUserPreference({
        cardId: id,
        action: 'like',
        timestamp: Date.now(),
      });
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
      await managementShortsService.saveUserPreference({
        cardId: id,
        action: 'dislike',
        timestamp: Date.now(),
      });
    }
    setIsDragging(false);
    setDragDirection(null);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(true);
    setDragDirection(info.offset.x > 0 ? 'right' : 'left');
  };

  const handleShare = async () => {
    try {
      const result = await managementShortsService.shareCard(id);
      if (result === 'copied') {
        alert('Card content copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing card:', error);
      alert('Failed to share card');
    }
  };

  return (
    <CardContainer
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isDragging && dragDirection && (
        <SwipeIndicator
          direction={dragDirection}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {dragDirection === 'right' ? '👍' : '👎'}
        </SwipeIndicator>
      )}
      <CardTitle>{title}</CardTitle>
      <CardSummary>{summary}</CardSummary>
      <KeyTakeaway>
        <strong>Key Takeaway:</strong> {key_takeaway}
      </KeyTakeaway>
      <ActionButtons>
        <ActionButton onClick={() => onSwipe('left')}>👎</ActionButton>
        <ActionButton onClick={handleShare}>📤</ActionButton>
        <ActionButton onClick={() => onSwipe('right')}>👍</ActionButton>
      </ActionButtons>
    </CardContainer>
  );
};

export default Card; 