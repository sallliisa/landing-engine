import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'

const prisma = new PrismaClient();

const main = async () => {
  try {
    // // Create Developer RoleGroup
    // const developerGroup = await prisma.roleGroup.create({
    //   data: {
    //     name: "Developer",
    //   },
    // });

    // // Create Developer Role within Developer RoleGroup
    // const developerRole = await prisma.role.create({
    //   data: {
    //     name: "Developer",
    //     role_group_id: developerGroup.id,
    //     // You might want to add permissions here later
    //     permissions: {
    //       create: [],
    //     },
    //   },
    // });

    // // Create Super Admin User
    // const superAdmin = await prisma.user.create({
    //   data: {
    //     name: "Super Admin",
    //     email: "dev",
    //     password: await bcrypt.hash("devcid", 10),
    //     role_id: developerRole.id,
    //   },
    // });

    // create instance of CompanyProfile
    const companyProfile = await prisma.companyProfile.create({ })

    console.log();
  } catch (error) {
    throw error;
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
