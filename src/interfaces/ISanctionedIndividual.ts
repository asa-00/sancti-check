export interface IUNSanctionedIndividual {
  dataId: string | null;
  firstName: string;
  secondName: string;
  thirdName: string;
  unListType: string | null;
  referenceNumber: string | null;
  listedOn: string | null;
  aliases: string[];
  nationality: string;
  dateOfBirth: {
    type: string | null;
    year: string | null;
  } | null;
  placeOfBirth: {
    city: string | null;
    stateProvince: string | null;
    country: string | null;
  } | null;
}
export interface ISanctionsSearchParams {
  userId?: string;
  name?: string;
  firstName?: string;     
  lastName?: string;       
  placeOfBirth?: {
    country?: string;         
  };
  dateOfBirth?: {
    year?: string;          
  };
}

export interface ISanctionedEntity {
  userId?: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  placeOfBirth: {
    city: string;
    stateProvince: string;
    country: string;
  };

  dateOfBirth: {
    typeOfDate: string;
    year: string;
  };

  matchQuality: string;
  score: number;

}

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
}

