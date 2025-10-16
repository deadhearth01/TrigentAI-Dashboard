/**
 * Test script for Imagen 4.0 API
 * Tests the new image generation service with different parameters
 */

const API_KEY = 'AIzaSyCd0-T1nLAEABtWXvfPDr4IBPt1o7syugg';

async function testImagenAPI() {
  console.log('🎨 Testing Imagen 4.0 API\n');
  console.log('='.repeat(50));
  
  // Test 1: Standard model with 3 images
  console.log('\n📷 Test 1: Standard model (imagen-4.0-generate-001) - 3 images');
  console.log('-'.repeat(50));
  
  try {
    const model = 'imagen-4.0-generate-001';
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/trigentai-dashboard/locations/us-central1/publishers/google/models/${model}:predict`;
    
    const requestBody = {
      instances: [
        {
          prompt: "Professional business team collaboration in modern office, high quality, corporate photography style"
        }
      ],
      parameters: {
        sampleCount: 3,
        aspectRatio: "1:1",
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult"
      }
    };
    
    console.log('📤 Sending request to:', endpoint);
    console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('📊 Response data:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      
      if (data.predictions && data.predictions.length > 0) {
        console.log(`🎉 Generated ${data.predictions.length} images!`);
        data.predictions.forEach((pred, index) => {
          const imageSize = pred.bytesBase64Encoded ? pred.bytesBase64Encoded.length : 0;
          console.log(`   Image ${index + 1}: ${imageSize} bytes (base64)`);
        });
      }
    } else {
      console.log('❌ FAILED');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  // Test 2: Fast model with 1 image
  console.log('\n📷 Test 2: Fast model (imagen-4.0-fast-generate-001) - 1 image');
  console.log('-'.repeat(50));
  
  try {
    const model = 'imagen-4.0-fast-generate-001';
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/trigentai-dashboard/locations/us-central1/publishers/google/models/${model}:predict`;
    
    const requestBody = {
      instances: [
        {
          prompt: "Social media post image: innovative technology startup, vibrant colors, modern design"
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1"
      }
    };
    
    console.log('📤 Sending request to:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('📊 Generated images:', data.predictions?.length || 0);
    } else {
      console.log('❌ FAILED');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  // Test 3: Alternative endpoint structure (if first fails)
  console.log('\n📷 Test 3: Alternative endpoint structure - generateContent');
  console.log('-'.repeat(50));
  
  try {
    const model = 'imagen-4.0-generate-001';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: "Professional business team collaboration in modern office"
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95
      }
    };
    
    console.log('📤 Sending request to:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('📊 Response:', JSON.stringify(data, null, 2).substring(0, 300) + '...');
    } else {
      console.log('❌ FAILED (Expected - this endpoint likely doesn\'t support images)');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Testing Complete!');
  console.log('='.repeat(50));
}

// Run tests
testImagenAPI().catch(console.error);
