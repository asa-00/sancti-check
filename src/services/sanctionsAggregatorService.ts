import UnSanctionService from './unSanctionsService';
import OfacSanctionService from './ofacSanctionsService';
import { ISanctionsSearchParams } from '../interfaces/ISanctionedIndividual';

class SanctionAggregatorService {
  async searchAggregatedSanctions(params: ISanctionsSearchParams) {
    try {
      // Fetch results from both services
      const [unResults, ofacResults] = await Promise.all([
        UnSanctionService.searchSanctions(params),
        OfacSanctionService.searchSanctions(params),
      ]);

      // Determine if the individual/entity is sanctioned
      const sanctioned = unResults.length > 0 || ofacResults.length > 0;

      // Identify lists where matches occurred
      const lists = [];
      if (unResults.length > 0) lists.push('UN Sanction List');
      if (ofacResults.length > 0) lists.push('OFAC Sanction List');

      // Aggregate results into a unified format
      const results = [
        ...unResults.map((res) => ({
          name: `${res.firstName} ${res.secondName} ${res.thirdName}`.trim(),
          country: res.placeOfBirth?.country || 'Unknown',
          dateOfBirth: res.dateOfBirth?.year || 'Unknown',
          matchQuality: res.matchQuality,
          source: 'UN',
        })),
        ...ofacResults.map((res) => ({
          name: res.name,
          country: res.addresses?.[0] || 'Unknown',
          dateOfBirth: 'Not Available',
          matchQuality: res.matchQuality,
          source: 'OFAC',
        })),
      ];

      return { sanctioned, lists, results };
    } catch (error) {
      console.error('Error aggregating sanctions:', error.message);
      throw new Error('Failed to aggregate sanction search results');
    }
  }
}

export default new SanctionAggregatorService();
