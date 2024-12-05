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

export interface IUNSanctionsSearchParams {
  name?: string;
  firstName?: string;
  lastName?: string;
  country: string;
  dob?: string;
  birthplace?: string;
  address?: string[]
}

/* export interface ISanctionsSearchParams {
  name?: string;
  country: string;
  dateOfBirth?: string;
} */

export interface ISanctionsSearchParams {
  firstName?: string;     
  lastName?: string;       
  placeOfBirth?: {
    country?: string;         
  };
  dateOfBirth?: {
    year?: string;          
  };
}