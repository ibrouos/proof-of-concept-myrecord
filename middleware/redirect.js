/**
 * Prepends BASE_URL to relative res.redirect() calls.
 * Required when running behind a path prefix or for CAS service URL validation.
 * No-op when BASE_URL is not set.
 */
const redirectMiddleware = (req, res, next) => {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) return next();

  const originalRedirect = res.redirect.bind(res);

  res.redirect = (arg1, arg2) => {
    let status, url;
    if (typeof arg1 === "number") {
      status = arg1;
      url = arg2;
    } else {
      status = 302;
      url = arg1;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = baseUrl.replace(/\/$/, "") + url;
    }
    originalRedirect(status, url);
  };

  next();
};

export default redirectMiddleware;
