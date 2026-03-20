// Script para verificar tablas en Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFiles = ['.env.production', '.env'];
let supabaseUrl = null;
let supabaseAnonKey = null;

for (const envFile of envFiles) {
  try {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const envVars = {};
      envContent.split('\n').forEach(line => {
        const match = line.match(/^(\w+)=(.*)$/);
        if (match) {
          envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      });
      supabaseUrl = supabaseUrl || envVars.VITE_SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL;
      supabaseAnonKey = supabaseAnonKey || envVars.VITE_SUPABASE_ANON_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
  } catch (err) {
    // Continue to next file
  }
}

// Si no encontró en archivos .env, usar valores hardcodeados del proyecto
if (!supabaseUrl) {
  console.log('⚠️  No se encontraron variables de entorno en .env');
  console.log('Usando valores del proyecto (debes verificar que sean correctos)...\n');
  supabaseUrl = 'https://eyqumoiygfbfvxvzupgy.supabase.co';
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5cXVtb2l5Z2ZiZnZ4dnp1cGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxODc2ODMsImV4cCI6MjA1NDc2MzY4M30.Lsoev-rVP12MQFFNWw4fWOZKxbTeaTFedo2fBcmIj8c';
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenciales de Supabase no configuradas');
  process.exit(1);
}

console.log('🔍 Verificando tablas en Supabase (dashboard-2026)...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    const expectedTables = ['menu', 'orders', 'reservations'];

    for (const table of expectedTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`   ❌ Tabla "${table}": ERROR - ${error.message}`);
        } else {
          console.log(`   ✅ Tabla "${table}": accesible (${count || 0} registros)`);
        }
      } catch (err) {
        console.log(`   ❌ Tabla "${table}": ${err.message}`);
      }
    }

    console.log('\n✅ Verificación completa!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

await checkTables();
