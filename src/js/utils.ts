export function delay(ms) {
  return new Promise(
    (resolve) => setTimeout(resolve, this.isDev ? 10 : ms)
  );
}
