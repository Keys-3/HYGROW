const axios = require('axios');

async function test() {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'invalid_key';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

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
