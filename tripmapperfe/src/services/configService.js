import axios from '../api/axios';

const configService = {
  getMapApiKey: async () => {
    const response = await axios.get('/Config/map-api-key');
    return response.data.mapApiKey;
  },
};

export default configService;