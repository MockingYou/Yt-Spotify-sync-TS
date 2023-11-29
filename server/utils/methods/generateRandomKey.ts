import crypto from "crypto";

const generateRandomKey = () => {
  return crypto.randomBytes(32).toString("hex"); // 32 bytes for a 256-bit key
};

export { generateRandomKey };
