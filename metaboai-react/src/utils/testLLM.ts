// Test utility for LLM functionality
// Use this to verify the LLM is working correctly

import { llmService } from '../services/llmService';

export async function testLLMIntegration(): Promise<void> {
  console.log('🧪 Testing Agricultural Q&A Integration...');
  
  try {
    // Test 1: Model initialization
    console.log('📥 Initializing Q&A model...');
    await llmService.initializeModel();
    
    const modelInfo = llmService.getModelInfo();
    console.log('✅ Model loaded:', modelInfo);
    
    // Test 2: Disease question
    console.log('💬 Testing disease question...');
    const response1 = await llmService.generateResponse(
      "What are the symptoms of early blight?"
    );
    console.log('✅ Disease Response:', response1);
    
    // Test 3: Treatment question with context
    console.log('💬 Testing treatment question with context...');
    const response2 = await llmService.generateResponse(
      "How do I treat this disease?",
      {
        predictions: [{ className: 'Early Blight', probability: 0.85 }],
        plantType: 'Plant',
        season: 'summer'
      }
    );
    console.log('✅ Treatment Response:', response2);
    
    // Test 4: Farming practices question
    console.log('💬 Testing farming practices...');
    const response3 = await llmService.generateResponse(
      "What are good companion plants for vegetables?"
    );
    console.log('✅ Farming Response:', response3);
    
    // Test 5: Conversation history
    console.log('💬 Testing conversation history...');
    const history = llmService.getConversationHistory();
    console.log('✅ Conversation history length:', history.length);
    
    console.log('🎉 All Q&A tests passed!');
    
  } catch (error) {
    console.error('❌ Q&A test failed:', error);
    throw error;
  }
}

// Helper function to run tests in browser console
export function runLLMTests(): void {
  testLLMIntegration()
    .then(() => console.log('✅ LLM integration test completed successfully'))
    .catch(error => console.error('❌ LLM integration test failed:', error));
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).testLLM = runLLMTests;
  
  // Also make auth debugging available
  import('../services/fileAuthService').then(({ fileAuthService }) => {
    (window as any).debugAuth = fileAuthService.debugAuthState;
    (window as any).clearAuth = fileAuthService.clearAllData;
  });
}