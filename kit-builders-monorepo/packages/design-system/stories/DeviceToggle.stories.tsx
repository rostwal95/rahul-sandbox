import type { Meta, StoryObj } from "@storybook/react";
import { DeviceToggle } from "@kit/design-system";

const meta: Meta<typeof DeviceToggle> = {
  title: "Editors/DeviceToggle",
  component: DeviceToggle,
  args: { value: "desktop" },
};
export default meta;
type Story = StoryObj<typeof DeviceToggle>;
export const Desktop: Story = {};
export const Tablet: Story = { args: { value: "tablet" } };
export const Mobile: Story = { args: { value: "mobile" } };
