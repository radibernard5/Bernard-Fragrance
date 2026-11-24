class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'notes'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Support simple gte/lte/gt/lt operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsed = JSON.parse(queryStr);

    // Price range maps to variant prices (any variant in range)
    if (parsed.minPrice || parsed.maxPrice) {
      const priceFilter = {};
      if (parsed.minPrice) priceFilter.$lteOrGteMin = Number(parsed.minPrice);
      if (parsed.maxPrice) priceFilter.$lteOrGteMax = Number(parsed.maxPrice);
      delete parsed.minPrice;
      delete parsed.maxPrice;
      // We'll apply as variants.price elemMatch in controller/product query helper if needed
      this._priceRange = {
        min: parsed.minPriceValue,
        max: parsed.maxPriceValue,
      };
    }

    this.filterObj = parsed;
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(this.queryString.limit, 10) || 12, 1), 100);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
