// Test the role update functionality with a simpler approach
const testRoleUpdateSimple = async () => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // Log the request we're about to make
    console.log('Sending request with token:', token ? token.substring(0, 20) + '...' : 'no token');
    
    // Make the request
    const response = await fetch('http://localhost:8080/api/users/update-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        username: 'admin',
        roles: ["ROLE_ADMIN", "ROLE_USER"]
      })
    });
    
    // Log the response status
    console.log('Response status:', response.status);
    
    // Parse and return the response
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run this in browser console:
// testRoleUpdateSimple().then(console.log);