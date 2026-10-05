import axios from '../api/axios';

const friendService = {
  getFriends: async () => (await axios.get('/Friends')).data,
  getRequests: async (direction) => (await axios.get('/Friends/requests', { params: { direction } })).data,
  sendRequest: async (username) => (await axios.post('/Friends/requests', { username })).data,
  acceptRequest: async (id) => (await axios.post(`/Friends/requests/${id}/accept`)).data,
  declineRequest: async (id) => (await axios.post(`/Friends/requests/${id}/decline`)).data,
  removeFriend: async (userId) => (await axios.delete(`/Friends/${userId}`)).data,
};

export default friendService;
