import api from './api';

export const transactionService = {
  initiateTrade: async (offerId) => {
    const response = await api.post('/trades/initiate', { offerId });
    return response.data;
  },

  confirmDeposit: async (tradeId, proofData) => {
    const response = await api.post(`/trades/${tradeId}/confirm-deposit`, proofData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  releaseFunds: async (tradeId) => {
    const response = await api.post(`/trades/${tradeId}/release-funds`);
    return response.data;
  },

  getBankAccounts: async () => {
    const response = await api.get('/trades/bank-accounts');
    return response.data;
  },

  addBankAccount: async (accountData) => {
    const response = await api.post('/trades/bank-accounts', accountData);
    return response.data;
  },

  getUserTrades: async () => {
    const response = await api.get('/trades/user');
    return response.data;
  },
};
