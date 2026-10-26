const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function main() {
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createManyAndReturn({ data: users });
  const userMap = new Map(createdUsers.map((u) => [u.username, u.id]));

  const postsData = posts.map(({ author, ...rest }) => ({
    ...rest,
    authorId: userMap.get(author),
  }));

  const createdPosts = await prisma.post.createManyAndReturn({ data: postsData });
  const postMap = new Map(
    createdPosts.map((p) => {
      const parts = p.imageUrl.split("/");
      const key = parts[parts.indexOf("seed") + 1];
      return [key, p.id];
    })
  );

  const likesData = likes.map((l) => ({
    userId: userMap.get(l.user),
    postId: postMap.get(l.post),
  }));

  const createdLikes = await prisma.like.createManyAndReturn({ data: likesData });

  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
