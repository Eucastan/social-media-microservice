import rateLimit from "express-rate-limit";

const parseDuration = (str) => {
  const num = parseInt(str);
  if (str.endsWith("m")) return num * 60 * 1000;
  if (str.endsWith("h")) return num * 60 * 60 * 1000;
  if (str.endsWith("s")) return num * 1000;
  return num; // default milliseconds
};

export default rateLimit({
  max: Number(process.env.API_RATE_LIMIT) || 100,
  windowMs: parseDuration(process.env.API_RATE_WINDOW || "15m"),
  message: {
    error: "Too many requests from this IP. Please try again later.",
  },
});
