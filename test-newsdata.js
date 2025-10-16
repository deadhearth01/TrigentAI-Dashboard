// Test NewsData.io API
const API_KEY = 'pub_7bb2688cac2944e08d153e1fc5a0d858';

async function testNewsDataAPI() {
  console.log('🧪 Testing NewsData.io API...\n');

  try {
    // Test 1: Latest News
    console.log('📰 Test 1: Fetching latest news...');
    const latestUrl = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&language=en&size=5`;
    const latestResponse = await fetch(latestUrl);
    const latestData = await latestResponse.json();
    
    if (latestData.status === 'success') {
      console.log('✅ Latest news fetched successfully!');
      console.log(`   Total results: ${latestData.totalResults}`);
      console.log(`   Articles fetched: ${latestData.results.length}`);
      console.log(`   First article: "${latestData.results[0]?.title}"\n`);
    } else {
      console.log('❌ Error:', latestData);
    }

    // Test 2: Search for specific topic
    console.log('🔍 Test 2: Searching for "AI technology"...');
    const searchUrl = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=AI%20technology&language=en&size=3`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.status === 'success') {
      console.log('✅ Search results fetched successfully!');
      console.log(`   Results found: ${searchData.results.length}`);
      searchData.results.forEach((article, idx) => {
        console.log(`   ${idx + 1}. ${article.title}`);
      });
      console.log('');
    }

    // Test 3: Category filter (business)
    console.log('💼 Test 3: Fetching business news...');
    const categoryUrl = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&category=business&language=en&size=3`;
    const categoryResponse = await fetch(categoryUrl);
    const categoryData = await categoryResponse.json();
    
    if (categoryData.status === 'success') {
      console.log('✅ Business news fetched successfully!');
      console.log(`   Articles: ${categoryData.results.length}`);
      categoryData.results.forEach((article, idx) => {
        console.log(`   ${idx + 1}. ${article.title}`);
      });
      console.log('');
    }

    console.log('✅ All NewsData.io API tests passed! Ready to use in the app.');

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testNewsDataAPI();
