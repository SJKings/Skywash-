import { Text as RNText, type TextProps } from 'react-native';
import { colors, fonts, type FontWeight } from '@/theme';

type Props = TextProps & {
  size?: number;
  weight?: FontWeight;
  color?: string;
  lineHeight?: number;
};

/**
 * Text in Archivo. Custom fonts need one family per weight (fontWeight alone
 * doesn't select them on Android), so pick the weight with `weight`.
 */
export function Text({ size = 15, weight = 400, color = colors.ink, lineHeight, style, ...rest }: Props) {
  return (
    <RNText
      style={[
        { fontFamily: fonts[weight], fontSize: size, color },
        lineHeight ? { lineHeight: size * lineHeight } : null,
        style,
      ]}
      {...rest}
    />
  );
}
