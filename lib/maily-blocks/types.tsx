import type { ReactElement } from "react";

export type BlockCommandArgs = {
  editor: any;
  range: any;
};

export interface BlockItem {
  title: string;
  description?: string;
  searchTerms: string[];
  icon?: ReactElement;
  preview?: string;
  command?: (args: BlockCommandArgs) => void;
  render?: (editor: any) => ReactElement | null;
  id?: string;
  commands?: BlockItem[];
}

export interface BlockGroupItem {
  title: string;
  commands: BlockItem[];
}

export interface SignupForm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationId: string;
  isActive: boolean;
  fields: {
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
  }[];
  _count?: {
    submissions: number;
  };
}
