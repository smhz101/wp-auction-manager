import axios from 'axios';

const api = axios.create({
  headers: {
    'X-WP-Nonce': window?.wpamData?.nonce ?? '',
  },
});

export default api;
