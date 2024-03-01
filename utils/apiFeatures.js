class APIFeatures {
  constructor(query, queryObject, userID) {
    // this will automatically called
    this.queryObject = queryObject;
    this.query = query;
    this.userID = userID;
  }
  filter() {
    const queryObject = Object.keys(this.queryObject).reduce((acc, cur) => {
      const excludeFields = ['page', 'sort', 'limit', 'fields'];
      const operatorSign = ['gte', 'gt', 'lte', 'lt'];
      if (!excludeFields.includes(cur)) {
        const queryStr = JSON.stringify(this.queryObject[cur]);
        const pattern = new RegExp(operatorSign.join('|'));
        if (
          typeof this.queryObject[cur] === 'object' &&
          pattern.test(queryStr)
        ) {
          // match the exact operationSign (\b) and do replacement multiple times (g)
          const newQuery = queryStr.replace(
            new RegExp(`\\b(${operatorSign.join('|')})\\b`, 'g'),
            (match) => {
              return `$${match}`;
            },
          );
          acc[cur] = JSON.parse(newQuery);
        } else {
          acc[cur] = this.queryObject[cur];
        }
      }
      return acc;
    }, {});
    this.query.find({ ...queryObject });
    return this;
  }
  sort() {
    if (this.queryObject.sort) {
      this.query = this.query.sort(this.queryObject.sort);
    }
    return this;
  }
  paging() {
    const { page, limit } = this.queryObject;
    if (!isNaN(page) && !isNaN(limit)) {
      const skipValue = (+page - 1) * +limit;
      this.query = this.query.skip(skipValue).limit(+limit);
    }
    return this;
  }
}

module.exports = APIFeatures;
