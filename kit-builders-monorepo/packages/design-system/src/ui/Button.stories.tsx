import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
};
export default meta;
type S = StoryObj<typeof Button>;

export const Solid: S = { args: { children: 'Click me', variant: 'solid' } };
export const Outline: S = { args: { children: 'Click me', variant: 'outline' } };
