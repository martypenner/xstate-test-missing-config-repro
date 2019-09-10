export const makeFakePromise = new Promise((resolve, reject) =>
  setTimeout(() => resolve(), 2000)
);
