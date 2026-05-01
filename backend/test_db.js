import dotenv from 'dotenv';
dotenv.config();

import * as db from './utils/db.js';

async function test() {
  const userId = 'c70ccd04-b603-4eba-b191-c259cc046294';
  try {
    console.log('Testing createProfile...');
    const profile = await db.createProfile(userId);
    console.log('Created Profile:', profile);
  } catch (err) {
    if (err.code === '23505') {
       console.log('Profile already exists, skipping create');
    } else {
       console.error('createProfile Error:', err);
    }
  }

  try {
    console.log('Testing getProfile...');
    const profile = await db.getProfile(userId);
    console.log('Profile:', profile);
  } catch (err) {
    console.error('getProfile Error:', err);
  }
}

test();
