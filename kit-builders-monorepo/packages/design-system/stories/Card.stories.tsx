import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@kit/design-system";
import { Mail, LayoutTemplate } from "lucide-react";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  args: {
    title: "Landing Pages",
    subtitle: "Build & publish",
    icon: <LayoutTemplate className="size-5 text-zinc-600" />,
    ctaLabel: "Open Studio",
  },
};
export default meta;
type Story = StoryObj<typeof Card>;
export const Primary: Story = {};
export const Hovered: Story = { parameters: { pseudo: { hover: true } } };
export const EmailDesigner: Story = {
  args: {
    title: "Email Designer",
    subtitle: "Compose & send",
    icon: <Mail className="size-5 text-zinc-600" />,
    ctaLabel: "Open Designer",
    variant: "secondary",
  },
};
