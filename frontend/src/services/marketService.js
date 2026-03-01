import marketApi from './api';

export const marketService = {
  getOffers: async (filters = {}) => {
    const response = await marketApi.get('/offers', { params: filters });
    return response.data;
  },

  createOffer: async (offerData) => {
    const response = await marketApi.post('/offers/create', offerData);
    return response.data;
  },

  deleteOffer: async (offerId) => {
    const response = await marketApi.delete(`/offers/${offerId}`);
    return response.data;
  },

  getExchangeRates: async () => {
    const response = await marketApi.get('/market/rates');
    return response.data;
  },
};
