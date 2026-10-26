const parsePagination = (query) => {
  const pageRaw = query.page !== undefined ? query.page : "1";
  const limitRaw = query.limit !== undefined ? query.limit : "10";

  const positiveIntRegex = /^[1-9]\d*$/;
  if (!positiveIntRegex.test(String(pageRaw)) || !positiveIntRegex.test(String(limitRaw))) {
    return { error: "page and limit must be positive integers" };
  }

  const page = parseInt(pageRaw, 10);
  let limit = parseInt(limitRaw, 10);
  if (limit > 50) {
    limit = 50;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const formatPaginationMeta = (total, page, limit) => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
};

module.exports = {
  parsePagination,
  formatPaginationMeta,
};
