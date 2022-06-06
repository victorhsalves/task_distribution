import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient()

// A `main` function so that you can use async/await
async function main() {
  // const areas = await prisma.aREAS.findMany()
  // console.log(areas)

  // await prisma.aREAS.create({
  //   data:{
  //     name: 'PÓS VENDAS'
  //   }
  // })

  const ret = await prisma.area.findFirst({
    where:{
      name:'CALL CENTER'
    }
  })
  console.log(ret)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
