// Test the role update functionality
const testRoleUpdate = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/users/update-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        username: 'admin',
        roles: ['ROLE_ADMIN', 'ROLE_USER']
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run this in browser console:
// testRoleUpdate().then(console.log);