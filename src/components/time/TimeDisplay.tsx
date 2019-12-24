import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

const getDisplayTime = (hours: number, minutes: number, seconds: number) => {
  const displayHours = hours ? `${hours}:` : '';
  const displayMinutes = Math.floor(Math.log10(minutes || 1))
    ? `${minutes}:`
    : `0${minutes}:`;
  const displaySeconds = Math.floor(Math.log10(seconds || 1))
    ? `${seconds}`
    : `0${seconds}`;
  return `${displayHours}${displayMinutes}${displaySeconds}`;
};

export const TimeDisplay = ({
  timeElapsed,
  fontSize,
  color,
}: {
  timeElapsed: number;
  fontSize?: number;
  color?: string;
}) => {
  const hours = Math.floor(timeElapsed / 3600);
  const remainingTimeForMinutes = timeElapsed - hours * 3600;
  const minutes = Math.floor(remainingTimeForMinutes / 60);
  const seconds = remainingTimeForMinutes - minutes * 60;
  const displayTime = getDisplayTime(hours, minutes, seconds);
  const actualFontSize = fontSize || 12;
  const actualColor = color || 'white';
  return (
    <Text style={{fontSize: actualFontSize, color: actualColor}}>
      {displayTime}
    </Text>
  );
};
