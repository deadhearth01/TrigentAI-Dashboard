// Test Firebase SDK Integration
import { firebaseService, auth, db, storage, analytics } from './lib/firebase.ts';

console.log('🔥 Testing Firebase Integration...\n');

// Test 1: Check Firebase Service
console.log('1. Firebase Service Configuration:');
console.log('   ✓ Is Configured:', firebaseService.isConfigured());

// Test 2: Check Auth
console.log('\n2. Firebase Auth:');
console.log('   ✓ Auth initialized:', !!auth);
console.log('   ✓ Current User:', auth?.currentUser || 'No user signed in');

// Test 3: Check Firestore
console.log('\n3. Firebase Firestore:');
console.log('   ✓ Firestore initialized:', !!db);

// Test 4: Check Storage
console.log('\n4. Firebase Storage:');
console.log('   ✓ Storage initialized:', !!storage);

// Test 5: Check Analytics
console.log('\n5. Firebase Analytics:');
console.log('   ✓ Analytics initialized:', !!analytics);

console.log('\n✅ Firebase SDK integration test complete!');
console.log('\nYour Firebase Configuration:');
console.log('   Project ID: trigentai');
console.log('   Auth Domain: trigentai.firebaseapp.com');
console.log('   Storage Bucket: trigentai.firebasestorage.app');
