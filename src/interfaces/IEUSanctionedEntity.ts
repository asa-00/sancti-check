export interface IEUSanctionedEntity extends Document {
    id: string;
    euReferenceNumber: string;
    name: string;
    aliases: string[];
    citizenship: string[]; // Ensure this matches your schema definition
    birthdates: {
      date: Date | null;
      city?: string;
      country?: string;
    }[];
    regulations: {
      numberTitle: string;
      publicationDate: Date | null;
      url: string;
    }[];
    lastUpdated: Date;
  }
  