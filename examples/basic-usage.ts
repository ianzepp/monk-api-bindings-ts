import { MonkAPI } from '../src/index.js';

async function main() {
  const monk = new MonkAPI({
    baseUrl: 'http://localhost:9001',
  });

  try {
    const loginResponse = await monk.auth.login({
      tenant: 'my-tenant',
      username: 'user@example.com',
      password: 'password123',
    });

    if (!loginResponse.success) {
      console.error('Login failed:', loginResponse.error);
      return;
    }

    console.log('Logged in successfully!');

    const whoami = await monk.auth.whoami();
    if (whoami.success) {
      console.log('Current user:', whoami.data?.user);
      console.log('Tenant:', whoami.data?.tenant);
    }

    const users = await monk.data.selectAny('users', {
      limit: 10,
      order: 'created_at desc',
    });

    if (users.success) {
      console.log('Users:', users.data);
    }

    const newUser = await monk.data.createOne('users', {
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
    });

    if (newUser.success) {
      console.log('Created user:', newUser.data);
    }

    const multipleUsers = await monk.data.createAll('users', [
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Charlie', email: 'charlie@example.com' },
    ]);

    if (multipleUsers.success) {
      console.log('Created multiple users:', multipleUsers.data);
    }

    if (newUser.success && newUser.data?.id) {
      const updatedUser = await monk.data.updateOne('users', newUser.data.id, {
        age: 31,
      });

      if (updatedUser.success) {
        console.log('Updated user:', updatedUser.data);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
