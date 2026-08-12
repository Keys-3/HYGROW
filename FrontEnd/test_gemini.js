const axios = require('axios');

async function test() {
  const apiKey = 'invalid_key';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/this-model-does-not-exist:generateContent';
  
  try {
    const response = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, {
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      system_instruction: { parts: [{ text: 'You are an AI' }] }
    });
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

test();
