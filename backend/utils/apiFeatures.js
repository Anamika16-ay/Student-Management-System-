/**
 * apiFeatures.js
 * --------------
 * Reusable query-builder for GET /api/students.
 * Encapsulates search / filter / sort / pagination so the controller
 * stays thin and this logic is independently reusable/testable.
 */

class ApiFeatures {
  /**
   * @param {import('mongoose').Query} query - Mongoose query (e.g. Student.find())
   * @param {object} queryParams - req.query
   */
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
    this.filters = {};
  }

  /** Substring, case-insensitive search on `name`. ?search=John */
  search() {
    if (this.queryParams.search) {
      this.query = this.query.find({
        name: { $regex: this.queryParams.search.trim(), $options: 'i' },
      });
    }
    return this;
  }

  /** Exact-match filters on course / semester / department / gender. */
  filter() {
    const allowedFilters = ['course', 'semester', 'department', 'gender'];
    const filters = {};

    allowedFilters.forEach((field) => {
      if (this.queryParams[field]) {
        filters[field] = this.queryParams[field];
      }
    });

    if (Object.keys(filters).length > 0) {
      this.query = this.query.find(filters);
    }
    return this;
  }

  /** ?sortBy=name&sortOrder=asc|desc (default: name asc) */
  sort() {
    const allowedSortFields = ['name', 'createdAt', 'semester'];
    let sortBy = this.queryParams.sortBy;
    if (!allowedSortFields.includes(sortBy)) sortBy = 'name';

    const sortOrder = this.queryParams.sortOrder === 'desc' ? -1 : 1;
    this.query = this.query.sort({ [sortBy]: sortOrder });
    return this;
  }

  /** ?page=1&limit=10 - classic offset pagination, capped at MAX_PAGE_SIZE. */
  paginate() {
    const defaultLimit = parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 10;
    const maxLimit = parseInt(process.env.MAX_PAGE_SIZE, 10) || 100;

    let limit = parseInt(this.queryParams.limit, 10) || defaultLimit;
    limit = Math.min(Math.max(limit, 1), maxLimit);

    let page = parseInt(this.queryParams.page, 10) || 1;
    page = Math.max(page, 1);

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = ApiFeatures;
