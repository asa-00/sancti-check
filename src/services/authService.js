// src/services/authService.js
const axios = require('axios');
const bankIdAuth = async (userInfo) => {
    try {
        const response = await axios.post('https://bankid-api-url.com', userInfo);
        return response.data;
    } catch (error) {
        throw new Error('Failed BankID authentication');
    }
};
module.exports = { bankIdAuth };

const authService = {
    login: async (email, password) => {
      // Authentication logic here
    },
    register: async (userData) => {
      // Registration logic here
    }
  };
  
  module.exports = authService;
  
