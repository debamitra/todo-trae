import React, { useState, useEffect } from 'react';
import './PomodoroModal.css';
import { supabase } from '../supabase';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskText: string;
}

const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose, taskId, taskText }) => {
  const [timeElapsed, setTimeElapsed] = useState(0); // Time in seconds
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Load saved time when modal opens
    const loadSavedTime = async () => {
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('elapsed_time')
          .eq('id', taskId)
          .single();

        if (error) throw error;
        if (data && data.elapsed_time) {
          setTimeElapsed(data.elapsed_time);
        }
      } catch (error) {
        console.error('Error loading saved time:', error);
      }
    };

    if (isOpen) {
      loadSavedTime();
    }
  }, [isOpen, taskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(prevTime => {
          const newTime = prevTime + 1;
          // Save elapsed time every 10 seconds
          if (newTime % 10 === 0) {
            saveElapsedTime();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        // Save elapsed time when cleaning up
        saveElapsedTime();
      }
    };
  }, [isActive]);

  const saveElapsedTime = async () => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ elapsed_time: timeElapsed })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving elapsed time:', error);
    }
  };

  const toggleTimer = () => {
    if (isActive) {
      // Save time when pausing
      saveElapsedTime();
    }
    setIsActive(!isActive);
  };

  const resetTimer = async () => {
    setIsActive(false);
    setTimeElapsed(0);
    // Reset saved time in database
    try {
      const { error } = await supabase
        .from('todos')
        .update({ elapsed_time: 0 })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resetting elapsed time:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Save time when closing modal
  const handleClose = () => {
    if (isActive) {
      setIsActive(false);
    }
    saveElapsedTime();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Focus Time</h2>
          <button onClick={handleClose} className="close-button">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="task-text">{taskText}</p>
          <div className="timer-display">{formatTime(timeElapsed)}</div>
          <div className="timer-controls">
            <button
              onClick={toggleTimer}
              className={`timer-button ${isActive ? 'stop' : 'start'}`}
            >
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={resetTimer} className="timer-button reset">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroModal;