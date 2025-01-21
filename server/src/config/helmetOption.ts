import helmet from "helmet";

const helmetOption = () => {
  const connectSrcUrls = ["'self'"];

  switch (process.env.NODE_ENV) {
    case "development":
      connectSrcUrls.push("http://localhost:3001");
      break;
    case "staging":
      connectSrcUrls.push("https://31.220.111.185");
      break;
    case "production":
      connectSrcUrls.push("http://18.175.229.131:3001"); // change to https://gingernanny.com
      break;
    default:
      // If APP_ENV is not set or unknown, just 'self'
      break;
  }

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        // imgSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "*.amazonaws.com"],
        connectSrc: connectSrcUrls,
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
      },
    },
  });
};

export default helmetOption;
