import { AddressType } from "../enums";
import { Country } from "./Country";
import { User } from "./User";

export interface Address {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  zipCode: string;
  countryId: string;
  country: Country;
  latitude?: number;
  longitude?: number;
  type: AddressType;
  isDeleted: boolean;
  userId?: string;
  user?: User;
}
