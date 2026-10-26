const prisma = require("../db");

const createPost = async (data) => {
  const { imageUrl, authorId, caption, location } = data;
  return await prisma.post.create({
    data: {
      imageUrl,
      authorId,
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

  const orderBy =
    sortBy === "likes"
      ? [{ likes: { _count: order } }, { createdAt: "desc" }]
      : { [sortBy]: order };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
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

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });
};

const getPostLikes = async (postId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return { notFound: true };
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    orderBy: {
      user: {
        username: "asc",
      },
    },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
    },
  });

  return { users: likes.map((l) => l.user) };
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
  getPostLikes,
  updatePost,
  deletePost,
};
