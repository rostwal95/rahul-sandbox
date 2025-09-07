import type { Meta, StoryObj } from "@storybook/react";
import { ProgressChecklist } from "@kit/design-system";

const meta: Meta<typeof ProgressChecklist> = {
  title: "Dashboard/ProgressChecklist",
  component: ProgressChecklist,
  args: {
    steps: [
      { key: "profile", label: "Profile", done: true },
      { key: "page", label: "Create Page", done: false },
      { key: "email", label: "Create Email", done: false },
      { key: "publish", label: "Publish", done: false },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof ProgressChecklist>;
export const Default: Story = {};
export const ThreeDone: Story = {
  args: {
    steps: [
      { key: "profile", label: "Profile", done: true },
      { key: "page", label: "Create Page", done: true },
      { key: "email", label: "Create Email", done: true },
      { key: "publish", label: "Publish", done: false },
    ],
  },
};
