import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button } from "@kit/design-system";

const schema = z.object({ headline: z.string().min(4) });
const Demo = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { headline: "Grow your audience" },
  });
  return (
    <form className="space-y-3" onSubmit={form.handleSubmit(console.log)}>
      <TextField
        label="Headline"
        {...form.register("headline")}
        error={form.formState.errors.headline?.message}
      />
      <Button type="submit">Save</Button>
    </form>
  );
};
const meta: Meta<typeof Demo> = { title: "Forms/TextField", component: Demo };
export default meta;
type Story = StoryObj<typeof Demo>;
export const Default: Story = {};
