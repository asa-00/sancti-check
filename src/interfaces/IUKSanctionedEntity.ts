export interface IUKSanctionedEntity {
  id: string;  
  entityId: string;
  uniqueID: string;
  ofsiGroupID?: string;
  unReferenceNumber?: string;
  names: { name: string; type: string }[];
  nonLatinNames?: string[];
  regimeName?: string;
  individualEntityShip?: string;
  designationSource?: string;
  sanctionsImposed: string[];
  aliases?: string[];
  addresses: {
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    addressLine4?: string;
    addressLine5?: string;
    addressLine6?: string;
    country?: string;
  }[];
  phoneNumbers?: string[];
  emailAddresses?: string[];
  otherInformation?: string;
  dateDesignated?: Date;
  lastUpdated?: Date;
};
