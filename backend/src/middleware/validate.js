// validate({ body, query, params }) checks the request with Zod schemas.
// Unknown fields are removed, so nobody can sneak in extra data (like a "user" field).
export const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.body) req.body = schemas.body.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};
