export default function imageLoader({ src, width, quality }) {
  // For production, serve images directly without optimization
  return src;
}