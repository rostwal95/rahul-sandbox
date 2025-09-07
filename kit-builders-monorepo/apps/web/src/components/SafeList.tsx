"use client";
import React from "react";

export interface SafeListProps<T = any> {
  items: any;
  loading?: boolean;
  error?: any;
  render: (item: T, idx: number) => React.ReactNode;
  keyFn?: (item: T, idx: number) => React.Key;
  empty?: React.ReactNode;
  className?: string;
  unexpectedLabel?: string;
  showJsonOnUnexpected?: boolean;
  maxJsonHeight?: number;
  container?: "div" | "fragment";
  // Table row mode: when true, component will emit <tr> rows and use <tr><td> wrappers for states
  row?: boolean;
  rowColSpan?: number;
  errorLabel?: string;
  loadingLabel?: string;
  // When true, this list is used directly inside a <select> and must only emit <option> elements
  asOptions?: boolean;
}

// Generic defensive list renderer to DRY up repeated patterns (loading/error/unexpected shape/empty states)
export function SafeList<T = any>({
  items,
  loading,
  error,
  render,
  keyFn,
  empty = <div className="text-sm text-zinc-500">None</div>,
  className,
  unexpectedLabel = "Unexpected response shape",
  showJsonOnUnexpected = true,
  maxJsonHeight = 160,
  container = "div",
  row = false,
  rowColSpan = 1,
  errorLabel = "Failed to load",
  loadingLabel = "Loading…",
  asOptions = false,
}: SafeListProps<T>) {
  // Loading / error states
  const optionState = (label: string) => (
    <option disabled value="">
      {label}
    </option>
  );
  if (error) {
    return row ? (
      <tr>
        <td colSpan={rowColSpan} className="p-2 text-red-600 text-sm">
          {errorLabel}
        </td>
      </tr>
    ) : asOptions ? (
      optionState(errorLabel)
    ) : (
      <div className="text-red-600 text-sm">{errorLabel}</div>
    );
  }
  if (loading) {
    return row ? (
      <tr>
        <td colSpan={rowColSpan} className="p-2 text-sm text-zinc-500">
          {loadingLabel}
        </td>
      </tr>
    ) : asOptions ? (
      optionState(loadingLabel)
    ) : (
      <div className="text-sm text-zinc-500">{loadingLabel}</div>
    );
  }
  if (!Array.isArray(items)) {
    if (items == null) {
      return row ? (
        <tr>
          <td colSpan={rowColSpan} className="p-2 text-sm text-zinc-500">
            —
          </td>
        </tr>
      ) : asOptions ? (
        optionState("—")
      ) : (
        <div className="text-sm text-zinc-500">—</div>
      );
    }
    const unexpected = (
      <div className="text-amber-600 text-xs">
        {unexpectedLabel}
        {showJsonOnUnexpected && (
          <pre
            className="mt-1 p-2 bg-zinc-100 rounded text-[10px] overflow-auto"
            style={{ maxHeight: maxJsonHeight }}
          >
            {JSON.stringify(items, null, 2)}
          </pre>
        )}
      </div>
    );
    return row ? (
      <tr>
        <td colSpan={rowColSpan} className="p-2">
          {unexpected}
        </td>
      </tr>
    ) : asOptions ? (
      optionState(unexpectedLabel)
    ) : (
      unexpected
    );
  }
  if (items.length === 0) return <>{empty}</>;
  const content = items.map((it, i) => (
    <React.Fragment key={keyFn ? keyFn(it, i) : i}>
      {render(it, i)}
    </React.Fragment>
  ));
  if (row) return <>{content}</>;
  if (container === "fragment") return <>{content}</>;
  return <div className={className}>{content}</div>;
}

export function safeArray<T = any>(val: any): T[] {
  return Array.isArray(val) ? val : [];
}
export function useSafeArray<T = any>(val: any): T[] {
  return safeArray<T>(val);
}
