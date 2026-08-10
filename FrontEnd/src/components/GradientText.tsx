import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

interface GradientTextProps extends TextProps {
  colors: string[] | readonly [string, string, ...string[]];
  style?: TextStyle | TextStyle[];
}

export function GradientText({ colors, style, children, ...rest }: GradientTextProps) {
  const fallbackColor = colors && colors.length > 0 ? colors[0] : '#ffffff';
  
  return (
    <Text style={[style, { color: fallbackColor }]} {...rest}>
      {children}
    </Text>
  );
}
