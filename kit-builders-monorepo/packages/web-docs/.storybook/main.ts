
// Using untyped config object (types package not installed); add @storybook/types if stricter typing desired
const config = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react',
    options: {}
  }
} as const;

export default config;
