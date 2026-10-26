const postsService = require("../services/posts.service");
const { parsePagination, formatPaginationMeta } = require("../utils/pagination");

const create = async (req, res) => {
  const { imageUrl, authorId, caption, location } = req.body;
  if (!imageUrl || !authorId) {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  const parsedAuthorId = parseInt(authorId, 10);
  if (isNaN(parsedAuthorId)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const post = await postsService.createPost({
      imageUrl,
      authorId: parsedAuthorId,
      caption,
      location,
    });
    return res.status(201).json(post);
  } catch (err) {
    if (err.code === "P2003" || err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

const list = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { sortBy = "createdAt", order = "desc", location, search, from, to } = req.query;

  const allowedSortBy = ["createdAt", "updatedAt"];
  if (!allowedSortBy.includes(sortBy)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt" });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const isInvalidDate = (d) => isNaN(Date.parse(d));
  if ((from !== undefined && isInvalidDate(from)) || (to !== undefined && isInvalidDate(to))) {
    return res.status(400).json({ error: "from and to must be valid dates" });
  }

  try {
    const { posts, total } = await postsService.listPosts({
      skip: pagination.skip,
      limit: pagination.limit,
      sortBy,
      order,
      location,
      search,
      from,
      to,
    });

    return res.status(200).json({
      data: posts,
      meta: formatPaginationMeta(total, pagination.page, pagination.limit),
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { caption, location } = req.body;
  const updateData = {};
  if (caption !== undefined) updateData.caption = caption;
  if (location !== undefined) updateData.location = location;

  try {
    const updatedPost = await postsService.updatePost(id, updateData);
    return res.status(200).json(updatedPost);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

const remove = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    await postsService.deletePost(id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
