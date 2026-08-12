const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const apiKey = 'invalid_key'; // We just want to see if it throws a proper error
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage('Hello');
    console.log(result.response.text());
  } catch (e) {
    console.log('SDK Error:', e.message);
  }
}

test();
