export interface AsyncResponse<T = any> {
  status?: number;
  success?: boolean;
  data?: T;
  error?: string;
}
export enum ServiceTypes {
  creditService = "Credit Service",
  cashService = "Cash Service",
}

export enum ClaimStatus {
  PROCESSED = "Processed",
  CHECKED = 'Checked',
  APPROVED = 'Approved',
  REQUESTED = 'Requested',
  AUTHORIZED = 'Authorized'

}
export enum Status {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}
export enum PaymentStatus {
  REQUESTED = "Requested",
  PROCESSED = 'Processed',
  CHECKED = 'Checked',
  APPROVED = 'Approved',
  AUTHORIZED = 'Authorized'
}
export type StatusVaule = "ACTIVE" | "PENDING" | "DISABLED";
type Gender = "Male " | " Femail";
type UserType = "Payer";

export type ButtonClickHandler = (event: MouseEvent) => void;

export enum MemberStatus {
  ACTIVE,
  DEACTIVATED,
}

export interface Pagination {
  page: number;
  limit: number;
  search?: string;
}

export interface Client {
  id: string;
  IDImage?: string;
  IDImageNumber?: string;
  activationDate: string;
  occupationType: string;
  income: string;
  image?: string;
  organization: string;
  payableBalance: number;
  totalBalance: number;
  user: User;
}

interface Permissions {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permissions[];
}

export interface User {
  userUuid: string;
  email: string;
  roleName: string;
  title: string;
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  gender: Gender;
  mobilePhone: string;
  userStatus: Status;
  roles: Role[];
  userType: UserType;
  payerUuid: string;
  privileges: string[];
}
