const prisma = require("../db");

const createPost = async (data) => {
  const { imageUrl, caption, location } = data;
  return await prisma.post.create({
    data: {
      imageUrl,
      ...(caption !== undefined && { caption }),
      ...(location !== undefined && { location }),
    },
  });
};

const listPosts = async ({ skip, limit, sortBy, order, location, search, from, to }) => {
  const where = {};

  if (location) {
    where.location = {
      equals: location,
      mode: "insensitive",
    };
  }

  if (search) {
    where.caption = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lt = new Date(to);
  }

  const orderBy = { [sortBy]: order };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
  });
};

const updatePost = async (id, data) => {
  return await prisma.post.update({
    where: { id },
    data,
  });
};

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id },
  });
};

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
