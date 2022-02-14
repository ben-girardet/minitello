import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seed() {
  const ben = await prisma.user.create({
    data: {
      username: "ben",
      // this is a hashed version of "twixrox"
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u"
    }
  });
  const kody = await prisma.user.create({
    data: {
      username: "kody",
      // this is a hashed version of "twixrox"
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u"
    }
  });
  await Promise.all(
    getProjects().map(data => {
      return prisma.step.create({data: {
        name: data.name,
        createdById: ben.id,
        order: 0,
        members: {
          create: {
            user: {
              connect: {
                id: ben.id
              }
            },
            role: 'MANAGER'
          }
        }
      }}).then(async (project: any) => {
        if (data.steps?.length) {
          let order = 0;
          for (const stepName of data.steps) {
            await prisma.step.create({data: {
              name: stepName,
              createdById: ben.id,
              order,
              parentStepId: project.id,
              projectId: project.id
            }})
            order += 1;
          }
        }
      });
    })
  );
}

seed();

function getProjects() {
  // shout-out to https://icanhazdadjoke.com/

  return [
    {
      name: "My first project",
      steps: [
        "My first step",
        "My second step"
      ]
    },
    {
      name: "Building Minitello"
    },
  ];
}