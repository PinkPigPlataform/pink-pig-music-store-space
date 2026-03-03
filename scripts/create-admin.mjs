import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function question(q) {
  return new Promise((resolve) => rl.question(q, resolve))
}

async function main() {
  console.log('\n🐷 Create Admin — Pink Pig Store\n')

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Error: MONGODB_URI not set')
    process.exit(1)
  }

  const name = await question('Nome do admin: ')
  const email = await question('Email: ')
  const password = await question('Senha (min 8 caracteres): ')
  rl.close()

  if (!name || !email || password.length < 8) {
    console.error('Dados inválidos')
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB_NAME)
    const collection = db.collection('admins')

    const existing = await collection.findOne({ email })
    if (existing) {
      console.error(`\nAdmin com email "${email}" já existe.`)
      process.exit(1)
    }

    const hashed = await bcrypt.hash(password, 12)

    await collection.insertOne({
      name,
      email,
      password: hashed,
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log(`\n✅ Admin criado com sucesso!`)
    console.log(`   Email: ${email}`)
    console.log(`   Role:  super_admin`)
    console.log('\nAcesse: /admin/login\n')
  } finally {
    await client.close()
  }
}

main().catch(console.error)
