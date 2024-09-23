const generateRandomPath = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let path = "";
  for (let i = 0; i < 10; i++) {
    path += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return path;
};

export const getUploadPath = () => {
  const path = generateRandomPath();
  const pathStr = path.match(/.{1,2}/g)?.join("/");
  return pathStr + "/";
};

export const isValidFileName = (fileName: string) => {
  return /^[a-z0-9_.@()-]+\.[^.]+$/i.test(fileName || "");
};

export const correctFileName = (fileNameWoExt: string) => {
  return fileNameWoExt.replace(/\W/g, "_").replace(/_{2,}/g, "_");
};
