export interface IOrganizationData {
  organization_uid: string;
  name: string;
  description: string;
  contactEmail: string;
  phone: string;
  address: string;
  website: string;
  logo_url?: string | null;
  wallet_address?: string | null;
}
