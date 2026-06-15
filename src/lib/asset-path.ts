const OPTIMIZED_HOME_PREFIX = "/home/optimized/";

export function optimizedAssetPath(path: string): string {
  if (!path || !path.startsWith("/home/")) {
    return path;
  }

  if (path.startsWith("/home/optimized/")) {
    return path;
  }

  const match = path.match(/^\/home\/(.+?)(\.(png|jpg|jpeg))$/i);

  if (!match) {
    return path;
  }

  return `${OPTIMIZED_HOME_PREFIX}${match[1]}.webp`;
}
