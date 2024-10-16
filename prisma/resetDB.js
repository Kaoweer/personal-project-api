require('dotenv').config()
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

async function run(){
  await prisma.$executeRawUnsafe('DROP DATABASE personal_project_db')
  await prisma.$executeRawUnsafe('CREATE DATABASE personal_project_db')
}
console.log("Reset DB...")
run()