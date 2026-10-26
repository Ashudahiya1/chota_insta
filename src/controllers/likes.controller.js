const likesService = require("../services/likes.service");

const create = async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { userId } = req.body;
  if (userId === undefined || userId === null || userId === "") {
    return res.status(400).json({ error: "userId is required" });
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const result = await likesService.createLike(postId, parsedUserId);
    if (result.notFound) {
      return res.status(404).json({ error: result.notFound });
    }
    if (result.conflict) {
      return res.status(409).json({ error: result.conflict });
    }
    return res.status(201).json(result.like);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const remove = async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(postId) || isNaN(userId)) {
    return res.status(404).json({ error: "Like not found" });
  }

  try {
    const result = await likesService.deleteLike(postId, userId);
    if (result.notFound) {
      return res.status(404).json({ error: result.notFound });
    }
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  remove,
};
