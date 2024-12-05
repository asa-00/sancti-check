import axios from 'axios';
import xml2js from 'xml2js';
import logger from "../utils/logger";
import { IUNSanctionedIndividual, IUNSanctionsSearchParams, ISanctionsSearchParams } from '../interfaces/ISanctionedIndividual';

class SanctionService {
  public sanctionedIndividuals: IUNSanctionedIndividual[] = [];

  constructor() {
    this.loadSanctions().catch((error) => console.error('Error loading sanctions:', error));
  }

  async loadSanctions(): Promise<void> {
    try {
      const response = await axios.get('https://scsanctions.un.org/resources/xml/en/consolidated.xml');
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      if (!result.CONSOLIDATED_LIST || !result.CONSOLIDATED_LIST.INDIVIDUALS) {
        throw new Error('Invalid XML structure');
      }

      this.sanctionedIndividuals = result.CONSOLIDATED_LIST.INDIVIDUALS[0].INDIVIDUAL.map(
        this.processIndividual.bind(this)
      );
    } catch (error) {
      console.error('Error loading sanctions:', error);
      throw error;
    }
  }

  private processIndividual(individual: any): IUNSanctionedIndividual {
    return {
      dataId: individual.DATAID?.[0] ?? null,
      firstName: individual.FIRST_NAME?.[0] ?? '',
      secondName: individual.SECOND_NAME?.[0] ?? '',
      thirdName: individual.THIRD_NAME?.[0] ?? '',
      unListType: individual.UN_LIST_TYPE?.[0] ?? null,
      referenceNumber: individual.REFERENCE_NUMBER?.[0] ?? null,
      listedOn: individual.LISTED_ON?.[0] ?? null,
      aliases: individual.INDIVIDUAL_ALIAS?.map((alias: any) => alias.ALIAS_NAME?.[0]) ?? [],
      nationality: individual.NATIONALITY?.[0]?.VALUE?.[0] ?? '',
      dateOfBirth: this.extractDateOfBirth(individual),
      placeOfBirth: this.extractPlaceOfBirth(individual),
    };
  }

  private extractDateOfBirth(individual: any): IUNSanctionedIndividual['dateOfBirth'] {
    const dob = individual.INDIVIDUAL_DATE_OF_BIRTH?.[0];
    return dob
      ? {
          type: dob.TYPE_OF_DATE?.[0] ?? null,
          year: dob.YEAR?.[0] ?? null,
        }
      : null;
  }

  private extractPlaceOfBirth(individual: any): IUNSanctionedIndividual['placeOfBirth'] {
    const placeOfBirth = individual.INDIVIDUAL_PLACE_OF_BIRTH?.[0];
    return placeOfBirth
      ? {
          city: placeOfBirth.CITY?.[0] ?? null,
          stateProvince: placeOfBirth.STATE_PROVINCE?.[0] ?? null,
          country: placeOfBirth.COUNTRY?.[0] ?? null,
        }
      : null;
  }

  searchSanctions(params: IUNSanctionsSearchParams): IUNSanctionedIndividual[] {
    logger.info(`Searching UN with params:`, {...params});
    const results = this.sanctionedIndividuals.filter(this.createFilter.bind(this, params));
    logger.info(`Found ${results.length} matching entities on UN list.`);
    return results;
  }

  private createFilter(params: ISanctionsSearchParams, individual: IUNSanctionedIndividual): boolean {
    const { name, country, dateOfBirth } = params;
    const nameMatches = this.matchesName(individual, name);
    const dobMatches = dateOfBirth ? this.matchesDateOfBirth(individual, dateOfBirth) : true;
   // const birthplaceMatches = birthplace ? this.matchesBirthplace(individual, birthplace) : true;

    return nameMatches && dobMatches;
  }

  private matchesName(individual: IUNSanctionedIndividual, name?: string): boolean {
    const fullName = `${individual.firstName} ${individual.secondName} ${individual.thirdName}`.toLowerCase();
    return (
      (!name || fullName.includes(name.toLowerCase()))
    );
  }

  private matchesDateOfBirth(individual: IUNSanctionedIndividual, dob: string): boolean {
    return individual.dateOfBirth?.year === dob;
  }

  private matchesBirthplace(individual: IUNSanctionedIndividual, birthplace: string): boolean {
    return individual.placeOfBirth?.city?.toLowerCase() === birthplace.toLowerCase();
  }
}

export default new SanctionService();
