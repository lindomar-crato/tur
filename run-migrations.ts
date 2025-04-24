import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema";

neonConfig.webSocketConstructor = ws;

async function main() {
  // Use a URL do banco de dados do Replit
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });
  
  // Cria a tabela usando o próprio esquema
  await db.execute(/*sql*/`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'usuario',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      client_number TEXT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      dob DATE,
      cpf TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipcode TEXT,
      occupation TEXT,
      income NUMERIC,
      marital_status TEXT,
      spouse_name TEXT,
      spouse_dob DATE,
      spouse_cpf TEXT,
      spouse_occupation TEXT,
      spouse_income NUMERIC,
      has_children BOOLEAN DEFAULT false,
      preferences TEXT,
      observations TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS child_names (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id),
      name TEXT NOT NULL,
      dob DATE,
      gender TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS client_wishes (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id),
      wish TEXT NOT NULL,
      priority TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      cnpj TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipcode TEXT,
      observations TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS stores (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipcode TEXT,
      observations TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS client_stores (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id),
      store_id INTEGER REFERENCES stores(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS tourism_agencies (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipcode TEXT,
      observations TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS consultants (
      id SERIAL PRIMARY KEY,
      agency_id INTEGER REFERENCES tourism_agencies(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      commission_rate NUMERIC,
      observations TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      cnpj TEXT,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipcode TEXT,
      observations TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      supplier_id INTEGER REFERENCES suppliers(id),
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price NUMERIC,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      destination TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      price NUMERIC,
      capacity INTEGER,
      description TEXT,
      status TEXT DEFAULT 'planejada',
      agency_id INTEGER REFERENCES tourism_agencies(id),
      consultant_id INTEGER REFERENCES consultants(id),
      image TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS trip_clients (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER REFERENCES trips(id),
      client_id INTEGER REFERENCES clients(id),
      status TEXT DEFAULT 'confirmado',
      payment_status TEXT DEFAULT 'pendente',
      payment_amount NUMERIC,
      payment_date DATE,
      observations TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS trip_seats (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER REFERENCES trips(id),
      seat_number TEXT NOT NULL,
      status TEXT DEFAULT 'disponivel',
      client_id INTEGER REFERENCES clients(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS trip_products (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER REFERENCES trips(id),
      product_id INTEGER REFERENCES products(id),
      price NUMERIC,
      quantity INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS trip_suppliers (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER REFERENCES trips(id),
      supplier_id INTEGER REFERENCES suppliers(id),
      service_description TEXT,
      cost NUMERIC,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS deals (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id),
      trip_id INTEGER REFERENCES trips(id),
      title TEXT NOT NULL,
      amount NUMERIC,
      stage TEXT DEFAULT 'lead',
      status TEXT DEFAULT 'aberto',
      probability INTEGER DEFAULT 50,
      expected_close_date DATE,
      user_id INTEGER REFERENCES users(id),
      agency_id INTEGER REFERENCES tourism_agencies(id),
      consultant_id INTEGER REFERENCES consultants(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      user_id INTEGER REFERENCES users(id),
      scheduled_date TIMESTAMP,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  // Criar um administrador padrão
  await db.execute(/*sql*/`
    INSERT INTO users (name, email, password, role) 
    VALUES ('Admin', 'admin@example.com', '$2b$10$eoQJ./xzI7DmZCGCVbHsBeHB2HQGf6WZ.g1OT9KbGTJBjJsCVxd9G', 'admin')
    ON CONFLICT (email) DO NOTHING;
  `);
  
  console.log('Database schema created successfully');
  
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});