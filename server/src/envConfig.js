import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carga el archivo .env desde la raíz del proyecto
dotenv.config({ path: resolve(__dirname, '../.env') }); // Ajusta '../' según sea necesario

export default {
  ...process.env
};