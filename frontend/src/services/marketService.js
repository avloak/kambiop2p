import api from './api';

export const marketService = {
  getOffers: async (filters = {}) => {
    const response = await api.get('/offers', { params: filters });
    return response.data;
  },

  createOffer: async (offerData) => {
    const response = await api.post('/offers/create', offerData);
    return response.data;
  },

  deleteOffer: async (offerId) => {
    const response = await api.delete(`/offers/${offerId}`);
    return response.data;
  },

  getExchangeRates: async () => {
    const response = await api.get('/market/rates');
    return response.data;
  },
};
