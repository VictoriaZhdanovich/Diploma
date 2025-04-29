import bcrypt from 'bcrypt';

async function hashPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Захешированный пароль для "${password}": ${hashedPassword}`);
}

hashPassword('12345!').catch(console.error);