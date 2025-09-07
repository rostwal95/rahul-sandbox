import type { Meta, StoryObj } from "@storybook/react";
import { BlocksPalette } from "@kit/design-system";
import { useState } from "react";

const meta: Meta<typeof BlocksPalette> = {
  title: "Editors/BlocksPalette",
  component: BlocksPalette,
};
export default meta;
type Story = StoryObj<typeof BlocksPalette>;
export const Default: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: "1", type: "hero", label: "Hero" },
      { id: "2", type: "testimonial", label: "Testimonial" },
      { id: "3", type: "pricing", label: "Pricing" },
      { id: "4", type: "cta", label: "CTA" },
    ]);
    return (
      <BlocksPalette
        items={items}
        onReorder={setItems}
        onInsert={(t) => alert("insert " + t)}
      />
    );
  },
};
