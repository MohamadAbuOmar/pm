import { createUser } from '../src/lib/auth';

async function setupAdmin() {
  try {
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.TEST_ADMIN_PASS || 'Admin123!';
    
    console.log('Creating admin user...');
    const user = await createUser(email, password, true);
    console.log('Admin user created successfully:', { id: user.id, email: user.email });
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

setupAdmin();
