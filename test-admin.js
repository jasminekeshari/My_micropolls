// Quick test script
const fetch = require('node-fetch');

async function testAdmin() {
  try {
    const response = await fetch('http://localhost:5000/api/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ADMIN-KEY': 'admin123'
      },
      body: JSON.stringify({
        question: 'Test Question?',
        options: ['Yes', 'No']
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdmin();