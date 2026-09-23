/**
 * The Artwork's GPS trace at a glance.
 *
 * The stored `miniMapSvg` is the same mark the Route Card shows, reduced to a
 * thumbnail so the summary and the review name the Artwork with the drawing
 * rather than with words alone. Authored in Sanity, so it is trusted markup —
 * the Route Card renders it the same way with `set:html`.
 */
export interface RouteThumbnailProps {
  miniMapSvg: string | null;
  routeTitle: string;
}

export default function RouteThumbnail({ miniMapSvg, routeTitle }: RouteThumbnailProps) {
  if (!miniMapSvg) {
    return (
      <span className="route-thumbnail route-thumbnail--placeholder" aria-hidden="true">
        <span className="route-thumbnail-label">gps trace</span>
      </span>
    );
  }

  return (
    <span
      className="route-thumbnail"
      role="img"
      aria-label={`${routeTitle} route trace`}
      dangerouslySetInnerHTML={{ __html: miniMapSvg }}
    />
  );
}
