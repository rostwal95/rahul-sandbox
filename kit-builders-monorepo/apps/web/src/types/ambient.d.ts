// Temporary ambient module declarations for unresolved workspace packages
// Remove once proper type declarations are emitted or packages updated.

declare module "@kit/email-templates" {
  export const WelcomeEmail: React.ComponentType<{ name?: string }>;
}

declare module "@react-email/components" {
  export function render(el: React.ReactElement): string;
  export const Button: React.ComponentType<any>;
  export const Container: React.ComponentType<any>;
  export const Section: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
}
