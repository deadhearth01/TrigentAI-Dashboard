const { GoogleGenAI } = require('@google/genai');

async function testNewAPIKey() {
  console.log('🧪 Testing new API key with Gemini 2.5 Flash Image...\n');
  
  const apiKey = 'AIzaSyBGQz6G6DYIZptWtJiK5JnqwoGxonBrGKo';
  console.log('🔑 API Key format:', apiKey.substring(0, 10) + '...');
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash-image';
    
    console.log('🎨 Attempting to generate image with model:', model);
    console.log('📝 Prompt: "A professional business team collaborating in a modern office"\n');
    
    const generationConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
    };

    const req = {
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'A professional business team collaborating in a modern office' }
          ]
        }
      ],
      config: generationConfig,
    };

    const streamingResp = await ai.models.generateContentStream(req);
    
    console.log('✅ Stream started, waiting for response...\n');
    
    let imageFound = false;
    for await (const chunk of streamingResp) {
      console.log('📦 Received chunk:', JSON.stringify(chunk, null, 2));
      
      if (chunk.candidates?.[0]?.content?.parts) {
        for (const part of chunk.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            console.log('🎉 IMAGE DATA RECEIVED!');
            console.log('📏 Image data length:', part.inlineData.data.length);
            console.log('🖼️  MIME type:', part.inlineData.mimeType);
            imageFound = true;
            break;
          }
        }
      }
      
      if (imageFound) break;
    }
    
    if (!imageFound) {
      console.log('❌ No image data found in response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401')) {
      console.log('\n⚠️  Still getting 401 OAuth error - API key may not support image generation');
    }
  }
}

testNewAPIKey();
