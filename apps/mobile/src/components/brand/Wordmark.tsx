import { StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';

type WordmarkProps = {
  fontSize?: number;
};

export function Wordmark({ fontSize = 40 }: WordmarkProps) {
  const dotSize = fontSize * 0.2;
  const textStyle = [
    styles.text,
    { fontSize, letterSpacing: -fontSize * 0.04, lineHeight: fontSize },
  ];

  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel="catch pin">
      <Text style={textStyle}>catch p</Text>
      <View style={styles.iWrap}>
        <Text style={textStyle}>{'ı'}</Text>
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              top: -dotSize * 0.3,
              marginLeft: -dotSize / 2,
            },
          ]}
        />
      </View>
      <Text style={textStyle}>n</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  text: {
    fontFamily: BrandFonts.soraExtraBold,
    color: Brand.ink,
  },
  iWrap: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    left: '50%',
    backgroundColor: Brand.gold,
  },
});
