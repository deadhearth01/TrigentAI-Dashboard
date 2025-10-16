/**
 * Test Gemini 2.5 Flash Image generation
 * Tests the real AI image generation with Google GenAI
 */

const { GoogleGenAI } = require('@google/genai');

const API_KEY = 'AQ.Ab8RN6ITcpfrAo9F2j5iRvASpb3TfyoWRY0noc7Py7N41ybeSQ';
const MODEL = 'gemini-2.5-flash-image';

async function testImageGeneration() {
  console.log('\n🎨 TESTING GEMINI 2.5 FLASH IMAGE');
  console.log('='.repeat(50));
  console.log(`📦 Model: ${MODEL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);
  console.log('='.repeat(50) + '\n');

  try {
    // Initialize Google GenAI
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('✅ Google GenAI initialized\n');

    // Test 1: Simple image generation
    console.log('📷 Test 1: Generating "professional team collaboration"');
    console.log('-'.repeat(50));

    const generationConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
    };

    const req = {
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "professional team collaboration in modern office, high quality"
            }
          ]
        }
      ],
      generationConfig
    };

    console.log('📤 Sending request...');
    const startTime = Date.now();
    
    const response = await ai.models.generateContent(req);
    
    const endTime = Date.now();
    console.log(`⏱️  Generation time: ${(endTime - startTime) / 1000}s`);

    console.log('\n📥 Response structure:');
    console.log('Response keys:', Object.keys(response));
    
    if (response.candidates && response.candidates.length > 0) {
      console.log('✅ Found candidates:', response.candidates.length);
      
      const candidate = response.candidates[0];
      console.log('Candidate keys:', Object.keys(candidate));
      
      if (candidate.content && candidate.content.parts) {
        console.log('✅ Found content parts:', candidate.content.parts.length);
        
        for (let i = 0; i < candidate.content.parts.length; i++) {
          const part = candidate.content.parts[i];
          console.log(`\nPart ${i + 1}:`, Object.keys(part));
          
          if (part.inlineData) {
            console.log('✅ Found inline data!');
            console.log('   MIME type:', part.inlineData.mimeType);
            console.log('   Data size:', part.inlineData.data ? part.inlineData.data.length : 0, 'bytes');
            
            if (part.inlineData.data) {
              const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data.substring(0, 50)}...`;
              console.log('   Data URL preview:', dataUrl);
              console.log('\n🎉 SUCCESS! Image generated successfully!');
              console.log('   You can use this data URL in <img> tags');
            }
          }
          
          if (part.text) {
            console.log('📝 Text content:', part.text);
          }
        }
      } else {
        console.log('❌ No content parts found');
      }
    } else {
      console.log('❌ No candidates in response');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 TEST COMPLETE!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

// Run test
testImageGeneration();
