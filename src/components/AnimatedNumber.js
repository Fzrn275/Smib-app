// ============================================================
// FILE: src/components/AnimatedNumber.js
// PURPOSE: Reusable count-up number animation.
//          Used in stat boxes across HomeScreen, HelpScreen,
//          and ProfileScreen to give a Web3-style "live" feel.
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { Animated, Text } from 'react-native';

export default function AnimatedNumber({ value, style, duration = 500 }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animValue.setValue(0);
    const listener = animValue.addListener(({ value: v }) => {
      setDisplay(Math.round(v));
    });

    Animated.timing(animValue, {
      toValue:         value,
      duration,
      useNativeDriver: false,
    }).start();

    return () => animValue.removeListener(listener);
  }, [value]);

  return <Text style={style}>{display}</Text>;
}
