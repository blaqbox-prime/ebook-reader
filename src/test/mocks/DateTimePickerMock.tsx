import * as React from 'react';

/**
 * Lives outside any `jest.mock()` factory on purpose. NativeWind's babel plugin
 * injects a `_ReactNativeCSSInterop` import into any component-shaped function
 * it finds; when that function sits inline in a `jest.mock` factory,
 * babel-plugin-jest-hoist rejects the injected binding as an out-of-scope
 * reference. Keeping the component in its own module avoids the collision.
 */
export const DateTimePicker = (props: Record<string, unknown>) =>
  React.createElement('DateTimePicker', props, null);

export default DateTimePicker;
