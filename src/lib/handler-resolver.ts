export const handlerPath = (context: string) => {
  return `${context.split(process.cwd())[1]?.substring(1).replace(/\\/g, '/')}`;
};

export const generatePath = (context: string) => {
  const path = `${context
    .split(process.cwd())[1]
    ?.substring(1)
    .replace(/\\/g, '/')}`;
  const apiRoute = path.replace(/(.*?)functions/, '');
  return "${self:custom.apiPrefix,''}" + apiRoute;
};
