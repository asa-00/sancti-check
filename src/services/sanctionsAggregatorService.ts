import unSanctionService from './unSanctionsService';
import ofacSanctionService from './ofacSanctionsService';
import euSanctionService from './euSanctionsService';
import ukSanctionService from './ukSantionsService';
import { HighQualityResultModel } from '../models/HighQualityResult';
import logger from "../utils/logger";

class SanctionsAggregatorService {
  async aggregateSanctions(params: any) {
    try {
      const [unResults, ofacResults, euResults, ukResults] = await Promise.all([
        unSanctionService.searchSanctions(params),
        ofacSanctionService.searchSanctions(params),
        euSanctionService.searchSanctions(params),
        ukSanctionService.searchSanctions(params),
      ]);

      const results = [
        ...this.mapResults(unResults, 'UN'),
        ...this.mapResults(ofacResults, 'OFAC'),
        ...this.mapResults(euResults, 'EU'),
        ...this.mapResults(ukResults, 'UK'),
      ];

      const aggregatedScore = this.calculateAggregatedScore(results);

      // Save high-quality results to the database
      if (aggregatedScore >= 80) {
        await this.saveHighQualityResults(results);
      }

      return { results, aggregatedScore };
    } catch (error) {
      logger.error('Error aggregating sanctions:', error.message);
      throw error;
    }
  }

  private mapResults(results: any[], source: string) {
    return results.map((res) => ({
      name: res.name || `${res.firstName} ${res.secondName} ${res.thirdName}`,
      country: res.placeOfBirth?.country || res.addresses?.[0]?.country || 'Unknown',
      dateOfBirth: res.dateOfBirth?.year || 'Unknown',
      matchQuality: res.matchQuality,
      score: res.score,
      source: source,
      isReviewed: false,
      reviewedBy: null,
      reviewComment: null,
    }));
  }

  private calculateAggregatedScore(results: any[]) {
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return results.length ? totalScore / results.length : 0;
  }

  private async saveHighQualityResults(results: any[]) {
    const highQualityResults = results.filter(result => result.matchQuality === 'High');

    const bulkOps = highQualityResults.map(result => ({
      updateOne: {
        filter: {
          name: result.name,
          country: result.country,
          dateOfBirth: result.dateOfBirth,
          source: result.source,
        },
        update: { $setOnInsert: result },
        upsert: true,
      }
    }));

    if (bulkOps.length > 0) {
      try {
        await HighQualityResultModel.bulkWrite(bulkOps);
        logger.info('High-quality results saved successfully.');
      } catch (error) {
        logger.error('Error saving high-quality results:', error.message);
      }
    }
  }
}

export default new SanctionsAggregatorService();