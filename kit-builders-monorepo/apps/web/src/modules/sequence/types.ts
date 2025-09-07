export type SequenceBlockType = "email" | "wait" | "sms" | "branch";

export interface SequenceBlockBase {
  id: string;
  type: SequenceBlockType;
  label: string;
}

export interface EmailBlock extends SequenceBlockBase {
  type: "email";
  subject: string;
  body: string;
  bodyPlain?: string;
}

export interface WaitBlock extends SequenceBlockBase {
  type: "wait";
  durationHours: number; // simple numeric duration for now
}

export interface SmsBlock extends SequenceBlockBase {
  type: "sms";
  message: string;
  messagePlain?: string;
}

export interface BranchBlock extends SequenceBlockBase {
  type: "branch";
  condition: string; // placeholder DSL / expression
}

export type SequenceBlock = EmailBlock | WaitBlock | SmsBlock | BranchBlock;

export interface SequenceDraft {
  id: string;
  name: string;
  blocks: SequenceBlock[];
  updatedAt: number;
}

export const DEFAULT_BLOCK_LABEL: Record<SequenceBlockType, string> = {
  email: "Email",
  wait: "Wait",
  sms: "SMS",
  branch: "Branch",
};

export function makeBlock(type: SequenceBlockType): SequenceBlock {
  const base = {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    label: DEFAULT_BLOCK_LABEL[type],
  } as const;
  switch (type) {
    case "email":
      return { ...base, subject: "", body: "", bodyPlain: "" } as EmailBlock;
    case "wait":
      return { ...base, durationHours: 24 } as WaitBlock;
    case "sms":
      return { ...base, message: "", messagePlain: "" } as SmsBlock;
    case "branch":
      return {
        ...base,
        condition: "contact.signup_source == 'ad'",
      } as BranchBlock;
  }
}
