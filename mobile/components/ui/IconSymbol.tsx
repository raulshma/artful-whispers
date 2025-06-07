// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.bar.fill': 'bar-chart',
  'plus.circle.fill': 'add-circle',
  'book.fill': 'book',
  'person.fill': 'person',
  'bell.fill': 'notifications',
  'clock.fill': 'schedule',
  'moon.fill': 'dark-mode',
  'person.circle.fill': 'account-circle',
  'square.and.arrow.up.fill': 'upload',
  'lock.shield.fill': 'security',
  'doc.text.fill': 'description',
  'trash.fill': 'delete',
  'gearshape.fill': 'settings',
  'magnifyingglass': 'search',
  'location.fill': 'location-on',
  'arrow.clockwise.circle.fill': 'refresh',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Add fallback for unmapped icons
  const mappedName = MAPPING[name];
  if (!mappedName) {
    console.warn(`Icon "${name}" not found in MAPPING. Add it to the MAPPING object.`);
    return <MaterialIcons color={color} size={size} name="help-outline" style={style} />;
  }
  
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
