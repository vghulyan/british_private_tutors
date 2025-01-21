import { Address } from "./Address";

export interface Country {
  id: string;
  name: string;
  code: string;
  dialingCode: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  addresses: Address[];
}
