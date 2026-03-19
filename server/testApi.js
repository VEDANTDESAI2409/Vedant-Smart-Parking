const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/cities', { name: 'Test City A 5' });
    console.log('SUCCESS', res.data);
  } catch (err) {
    console.error('ERROR', err.response ? err.response.data : err.message);
  }
})();
