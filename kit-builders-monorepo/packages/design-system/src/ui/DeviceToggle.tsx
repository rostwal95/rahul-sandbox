import * as React from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Monitor, TabletSmartphone, Smartphone } from "lucide-react";

export function DeviceToggle({
  value,
  onChange,
}: {
  value: "desktop" | "tablet" | "mobile";
  onChange?: (v: any) => void;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={onChange}
      className="inline-flex rounded-lg border bg-white p-1 shadow-sm"
      aria-label="Preview device"
    >
      <ToggleGroup.Item
        value="desktop"
        className="rounded-md px-2 py-1 data-[state=on]:bg-neutral-100"
      >
        <Monitor className="h-4 w-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="tablet"
        className="rounded-md px-2 py-1 data-[state=on]:bg-neutral-100"
      >
        <TabletSmartphone className="h-4 w-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="mobile"
        className="rounded-md px-2 py-1 data-[state=on]:bg-neutral-100"
      >
        <Smartphone className="h-4 w-4" />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
