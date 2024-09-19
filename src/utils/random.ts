export const randomString = (
  length = 10,
  chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) => {
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

export const generateOTP = () => {
  return randomString(5, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
};
