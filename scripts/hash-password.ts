import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Password hashing function matching the one in auth-client.ts
async function hashPassword(password: string): Promise<string> {
  // Generate a secure random salt
  const salt = randomBytes(16).toString("hex");

  // Only attempt to hash if we have a password and salt
  if (!password || !salt) {
    throw new Error("Password and salt are required for hashing");
  }

  // Hash the password with the salt
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;

  // Return the hashed password with salt
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  const password = "password123";
  const hashedPassword = await hashPassword(password);
  console.log(`Password: ${password}`);
  console.log(`Hashed: ${hashedPassword}`);
}

main().catch(console.error);
