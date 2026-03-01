import {disputesApi} from './api';

export const disputeService = {
  openDispute: async (tradeId, reason, evidence) => {
    const formData = new FormData();
    formData.append('tradeId', tradeId);
    formData.append('reason', reason);
    if (evidence) {
      formData.append('evidence', evidence);
    }
    
    const response = await disputesApi.post('/disputes/open', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDispute: async (disputeId) => {
    const response = await disputesApi.get(`/disputes/${disputeId}`);
    return response.data;
  },

  resolveDispute: async (disputeId, resolution) => {
    const response = await disputesApi.post(`/disputes/${disputeId}/resolve`, { resolution });
    return response.data;
  },
};
