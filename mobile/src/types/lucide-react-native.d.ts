/**
 * Global type patch for lucide-react-native.
 *
 * The upstream LucideProps interface extends SvgProps from react-native-svg,
 * which does NOT include a top-level `color` property.  Every call-site in
 * this project passes `color` as a convenience shorthand, so we augment the
 * module here to avoid hundreds of TS2322 errors.
 */
import type { ColorValue } from 'react-native';

declare module 'lucide-react-native' {
    interface LucideProps {
        color?: ColorValue;
        fill?: ColorValue;
    }
}
