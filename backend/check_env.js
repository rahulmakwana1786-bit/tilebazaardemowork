import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log("Email:", process.env.ADMIN_EMAIL_2, "Length:", process.env.ADMIN_EMAIL_2?.length);
console.log("Password:", process.env.ADMIN_PASSWORD_2, "Length:", process.env.ADMIN_PASSWORD_2?.length);
console.log("Expected Password:", "securepassword2", "Length:", "securepassword2".length);
console.log("Match:", process.env.ADMIN_PASSWORD_2 === "securepassword2");
