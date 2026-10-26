const prisma = require("../db");

const createUser = async (data) => {
  const { username, email, fullname, bio } = data;
  return await prisma.user.create({
    data: {
      username,
      email,
      fullname,
      ...(bio !== undefined && { bio }),
    },
  });
};

const listUsers = async ({ skip, limit, sortBy, order, isPrivate, search, hasPosts }) => {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  if (hasPosts !== undefined) {
    if (hasPosts === true) {
      where.posts = { some: {} };
    } else if (hasPosts === false) {
      where.posts = { none: {} };
    }
  }

  const orderBy = { [sortBy]: order };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
};

const getUserPosts = async (userId, { skip, limit }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { notFound: true };
  }

  const where = { authorId: userId };
  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
};

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  getUserPosts,
  updateUser,
  deleteUser,
};
