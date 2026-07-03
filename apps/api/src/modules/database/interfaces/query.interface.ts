export type QueryParams = {
  skip: number;
  limit: number;
  filter?: object;
  sort?: object;
  textSearch?: string;
};

export type ResponseQuery<T> = {
  items: Array<T>;
  total: number;
  size: number;
  page: number;
  offset: number;
};
