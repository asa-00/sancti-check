const axios = require('axios');
const xml2js = require('xml2js');

class SanctionService {
    constructor() {
        this.sanctionedIndividuals = [];
        this.loadSanctions().catch(error => console.error('Error loading sanctions:', error));
    }

    async loadSanctions() {
        try {
            const response = await axios.get('https://scsanctions.un.org/resources/xml/en/consolidated.xml');
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(response.data);

            if (!result.CONSOLIDATED_LIST || !result.CONSOLIDATED_LIST.INDIVIDUALS) {
                throw new Error('Invalid XML structure');
            }

            this.sanctionedIndividuals = result.CONSOLIDATED_LIST.INDIVIDUALS[0].INDIVIDUAL.map(this.processIndividual.bind(this));

        } catch (error) {
            console.error('Error loading sanctions:', error);
            throw error;
        }
    }
  
    processIndividual(individual) {
        return {
            dataId: individual.DATAID && individual.DATAID[0] ? individual.DATAID[0] : null,
            firstName: individual.FIRST_NAME && individual.FIRST_NAME[0] ? individual.FIRST_NAME[0] : '',
            secondName: individual.SECOND_NAME && individual.SECOND_NAME[0] ? individual.SECOND_NAME[0] : '',
            thirdName: individual.THIRD_NAME && individual.THIRD_NAME[0] ? individual.THIRD_NAME[0] : '',
            unListType: individual.UN_LIST_TYPE && individual.UN_LIST_TYPE[0] ? individual.UN_LIST_TYPE[0] : null,
            referenceNumber: individual.REFERENCE_NUMBER && individual.REFERENCE_NUMBER[0] ? individual.REFERENCE_NUMBER[0] : null,
            listedOn: individual.LISTED_ON && individual.LISTED_ON[0] ? individual.LISTED_ON[0] : null,
            aliases: individual.INDIVIDUAL_ALIAS && Array.isArray(individual.INDIVIDUAL_ALIAS) ? individual.INDIVIDUAL_ALIAS.map(alias => alias.ALIAS_NAME && alias.ALIAS_NAME[0]) : [],
            nationality: individual.NATIONALITY && individual.NATIONALITY[0] && individual.NATIONALITY[0].VALUE && Array.isArray(individual.NATIONALITY[0].VALUE) ? individual.NATIONALITY[0].VALUE[0] : '',
            dateOfBirth: this.extractDateOfBirth(individual),
            placeOfBirth: this.extractPlaceOfBirth(individual)
        };
    }

    extractDateOfBirth(individual) {
        const dob = individual.INDIVIDUAL_DATE_OF_BIRTH && individual.INDIVIDUAL_DATE_OF_BIRTH[0];
        return dob ? {
            type: dob.TYPE_OF_DATE && dob.TYPE_OF_DATE[0] ? dob.TYPE_OF_DATE[0] : null,
            year: dob.YEAR && dob.YEAR[0] ? dob.YEAR[0] : null
        } : null;
    }

    extractPlaceOfBirth(individual) {
        const placeOfBirth = individual.INDIVIDUAL_PLACE_OF_BIRTH && individual.INDIVIDUAL_PLACE_OF_BIRTH[0];
        return placeOfBirth ? {
            city: placeOfBirth.CITY && placeOfBirth.CITY[0] ? placeOfBirth.CITY[0] : null,
            stateProvince: placeOfBirth.STATE_PROVINCE && placeOfBirth.STATE_PROVINCE[0] ? placeOfBirth.STATE_PROVINCE[0] : null,
            country: placeOfBirth.COUNTRY && placeOfBirth.COUNTRY[0] ? placeOfBirth.COUNTRY[0] : null
        } : null;
    }

    searchSanctions({ firstName, lastName, dob, birthplace }) {
        return this.sanctionedIndividuals.filter(this.createFilter.bind(this, { firstName, lastName, dob, birthplace }));
    }

    createFilter({ firstName, lastName, dob, birthplace }, individual) {
        const nameMatches = this.matchesName(individual, firstName, lastName);
        const dobMatches = dob ? this.matchesDateOfBirth(individual, dob) : true;
        const birthplaceMatches = birthplace ? this.matchesBirthplace(individual, birthplace) : true;

        return nameMatches && dobMatches && birthplaceMatches;
    }

    matchesName(individual, firstName, lastName) {
        const fullName = `${individual.firstName} ${individual.secondName} ${individual.thirdName}`.toLowerCase();
        return fullName.includes(firstName?.toLowerCase()) && fullName.includes(lastName?.toLowerCase());
    }

    matchesDateOfBirth(individual, dob) {
        return individual.dateOfBirth?.year === dob;
    }

    matchesBirthplace(individual, birthplace) {
        return individual.placeOfBirth?.city?.toLowerCase() === birthplace?.toLowerCase();
    }
}

module.exports = new SanctionService();
