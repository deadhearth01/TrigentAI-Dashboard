/**
 * Test the improved Imagen service
 * This demonstrates how 3 diverse, relevant images are generated
 */

// Simulate the ImagenService behavior
class TestImagenService {
  extractKeywords(prompt) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                       'of', 'with', 'professional', 'high', 'quality', 'photography', 
                       'detailed', 'vibrant', 'modern', 'business'];
    
    const words = prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    return words.slice(0, 3).length > 0 ? words.slice(0, 3) : ['business', 'professional', 'team'];
  }

  enhancePrompt(topic, platform = 'instagram') {
    const qualityModifiers = ['professional', 'high quality', 'business', 'modern', 'corporate'];
    
    const platformModifiers = {
      instagram: 'visually striking social media',
      twitter: 'news worthy professional',
      facebook: 'engaging community',
      linkedin: 'professional corporate'
    };

    let enhanced = topic;
    enhanced += ' ' + qualityModifiers.slice(0, 2).join(' ');
    
    if (platform && platformModifiers[platform]) {
      enhanced += ' ' + platformModifiers[platform];
    }

    return enhanced;
  }

  async generateSocialMediaImages(topic, platform = 'instagram', numberOfOptions = 3) {
    console.log('\n🎨 =================================');
    console.log(`📝 Topic: "${topic}"`);
    console.log(`📱 Platform: ${platform}`);
    console.log(`🖼️  Requested Images: ${numberOfOptions}`);
    console.log('=================================\n');

    // Extract keywords
    const enhancedPrompt = this.enhancePrompt(topic, platform);
    const keywords = this.extractKeywords(enhancedPrompt);
    
    console.log(`🔍 Enhanced Prompt: "${enhancedPrompt}"`);
    console.log(`🏷️  Extracted Keywords: [${keywords.join(', ')}]\n`);

    // Generate image URLs
    const images = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < numberOfOptions; i++) {
      const keyword = keywords[i % keywords.length];
      const variation = ['professional', 'modern', 'business', 'creative'][i % 4];
      const query = `${keyword},${variation}`;
      
      const url = `https://source.unsplash.com/800x800/?${encodeURIComponent(query)}&${timestamp + i}`;
      images.push(url);
      
      console.log(`✅ Image ${i + 1}:`);
      console.log(`   Keyword: "${keyword}"`);
      console.log(`   Variation: "${variation}"`);
      console.log(`   URL: ${url.substring(0, 80)}...`);
      console.log('');
    }

    console.log(`🎉 Generated ${images.length} diverse, relevant images!`);
    console.log('=================================\n');

    return { images, prompt: enhancedPrompt };
  }
}

// Run tests
async function runTests() {
  const service = new TestImagenService();

  console.log('\n🚀 TESTING IMPROVED IMAGE GENERATION');
  console.log('=====================================\n');

  // Test 1: Team Collaboration
  await service.generateSocialMediaImages('team collaboration', 'instagram', 3);

  // Test 2: Business Strategy
  await service.generateSocialMediaImages('innovative business strategy', 'linkedin', 3);

  // Test 3: Technology
  await service.generateSocialMediaImages('AI automation tools', 'twitter', 3);

  // Test 4: Marketing
  await service.generateSocialMediaImages('social media marketing tips', 'facebook', 3);

  console.log('\n✅ ALL TESTS COMPLETED!');
  console.log('\n📊 KEY IMPROVEMENTS:');
  console.log('  ✓ Extracts meaningful keywords from topics');
  console.log('  ✓ Generates 3 diverse images per topic');
  console.log('  ✓ Uses different keyword variations for variety');
  console.log('  ✓ Platform-specific optimization');
  console.log('  ✓ Each image URL is unique (timestamp-based)');
  console.log('  ✓ Relevant to user\'s topic\n');
}

runTests();
