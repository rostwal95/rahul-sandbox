import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "@kit/design-system";

const meta: Meta<typeof StatCard> = {
  title: "Dashboard/StatCard",
  component: StatCard,
  args: { label: "Subscribers", value: "1,248", delta: "+3.1%" },
};
export default meta;
type Story = StoryObj<typeof StatCard>;
export const Default: Story = {};
export const Warning: Story = {
  args: {
    label: "Deliverability",
    value: "94.7%",
    tone: "warn",
    delta: "-2.1%",
  },
};
