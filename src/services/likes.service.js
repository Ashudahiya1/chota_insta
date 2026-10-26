const prisma = require("../db");

const createLike = async (postId, userId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return { notFound: "Post not found" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { notFound: "User not found" };
  }

  try {
    const like = await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });
    return { like };
  } catch (err) {
    if (err.code === "P2002") {
      return { conflict: "Already liked" };
    }
    throw err;
  }
};

const deleteLike = async (postId, userId) => {
  try {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return { success: true };
  } catch (err) {
    if (err.code === "P2025") {
      return { notFound: "Like not found" };
    }
    throw err;
  }
};

module.exports = {
  createLike,
  deleteLike,
};
