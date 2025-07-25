// import prisma from '$lib/utils/prisma.js';
// import { success } from '$lib/utils/response.js';

// export async function POST({request}) {
//   const sections = await prisma.section.findMany({
//     where: {
//       section_type_code: 'data-list',
//     },
//     include: {
//       childSectionGroups: {
//         include: {
//           sections: true
//         }
//       }
//     },
//   });

//   for (const section of sections) {
//     const newContent = await prisma.content.create({
//       data: {
//         title: section.name,
//         order: 1,
//         section: {
//           connect: {
//             id: section.id,
//           },
//         },
//       },
//     });
//     console.log(`- Created content ${newContent.id} with order 1`);

//     if (section.childSectionGroups[0].order === 1) {
//       const updatedSectionGroup = await prisma.sectionGroup.update({
//         where: {
//           id: section.childSectionGroups[0].id,
//         },
//         data: {
//           order: 2,
//         },
//       });
//       console.log(`- Updated section group ${updatedSectionGroup.id} order from 1 to 2`);
//     }
//   }
//   return success({message: `Found ${sections.length} sections with type 'data-list'`, sections})
// }