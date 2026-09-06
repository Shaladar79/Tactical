/**
 * Tactical
 * Reusable Cover Proximity
 *
 * Determines whether a token has qualifying cover
 * relative to a source point.
 *
 * Initial implementation:
 * - Foundry Walls count as physical cover.
 * - Open doors do not count as cover.
 * - The cover must lie between the source point
 *   and the target.
 * - The target must be within the allowed number
 *   of grid squares from that cover.
 *
 * This file does not resolve attacks, Saves,
 * damage, healing, or other effects.
 */

/* -------------------------------------------- */
/*  Scene Helpers                               */
/* -------------------------------------------- */

/**
 * Get the current scene grid size in pixels.
 *
 * @returns {number}
 */
function getGridSize() {

  return Math.max(
    0,
    Number(
      canvas.scene?.grid?.size
    ) || 0
  );
}

/* -------------------------------------------- */
/*  Geometry Helpers                            */
/* -------------------------------------------- */

/**
 * Calculate the shortest pixel distance from a
 * point to a line segment.
 *
 * @param {object} point
 * @param {number} point.x
 * @param {number} point.y
 *
 * @param {object} segmentStart
 * @param {number} segmentStart.x
 * @param {number} segmentStart.y
 *
 * @param {object} segmentEnd
 * @param {number} segmentEnd.x
 * @param {number} segmentEnd.y
 *
 * @returns {number}
 */
export function getPointToSegmentDistance(
  point,
  segmentStart,
  segmentEnd
) {

  const px =
    Number(point?.x);

  const py =
    Number(point?.y);

  const x1 =
    Number(segmentStart?.x);

  const y1 =
    Number(segmentStart?.y);

  const x2 =
    Number(segmentEnd?.x);

  const y2 =
    Number(segmentEnd?.y);

  if (
    !Number.isFinite(px) ||
    !Number.isFinite(py) ||
    !Number.isFinite(x1) ||
    !Number.isFinite(y1) ||
    !Number.isFinite(x2) ||
    !Number.isFinite(y2)
  ) {
    return Infinity;
  }

  const dx =
    x2 - x1;

  const dy =
    y2 - y1;

  const lengthSquared =
    (dx * dx) +
    (dy * dy);

  if (lengthSquared <= 0) {

    return Math.hypot(
      px - x1,
      py - y1
    );
  }

  const projection =
    (
      ((px - x1) * dx) +
      ((py - y1) * dy)
    ) /
    lengthSquared;

  const t =
    Math.max(
      0,
      Math.min(
        1,
        projection
      )
    );

  const closestX =
    x1 + (t * dx);

  const closestY =
    y1 + (t * dy);

  return Math.hypot(
    px - closestX,
    py - closestY
  );
}

/**
 * Calculate the shortest distance from a point
 * to a segment in grid squares.
 *
 * @returns {number}
 */
export function getPointToSegmentDistanceInSquares(
  point,
  segmentStart,
  segmentEnd
) {

  const gridSize =
    getGridSize();

  if (gridSize <= 0) {
    return Infinity;
  }

  return (
    getPointToSegmentDistance(
      point,
      segmentStart,
      segmentEnd
    ) /
    gridSize
  );
}

/**
 * Determine whether two finite line segments
 * intersect.
 *
 * Endpoint contact counts as intersection.
 *
 * @param {object} a1
 * @param {object} a2
 * @param {object} b1
 * @param {object} b2
 *
 * @returns {boolean}
 */
export function segmentsIntersect(
  a1,
  a2,
  b1,
  b2
) {

  const p = {
    x: Number(a1?.x),
    y: Number(a1?.y)
  };

  const p2 = {
    x: Number(a2?.x),
    y: Number(a2?.y)
  };

  const q = {
    x: Number(b1?.x),
    y: Number(b1?.y)
  };

  const q2 = {
    x: Number(b2?.x),
    y: Number(b2?.y)
  };

  if (
    !Number.isFinite(p.x) ||
    !Number.isFinite(p.y) ||
    !Number.isFinite(p2.x) ||
    !Number.isFinite(p2.y) ||
    !Number.isFinite(q.x) ||
    !Number.isFinite(q.y) ||
    !Number.isFinite(q2.x) ||
    !Number.isFinite(q2.y)
  ) {
    return false;
  }

  const r = {
    x: p2.x - p.x,
    y: p2.y - p.y
  };

  const s = {
    x: q2.x - q.x,
    y: q2.y - q.y
  };

  const cross =
    (v1, v2) =>
      (v1.x * v2.y) -
      (v1.y * v2.x);

  const qMinusP = {
    x: q.x - p.x,
    y: q.y - p.y
  };

  const rCrossS =
    cross(
      r,
      s
    );

  const qMinusPCrossR =
    cross(
      qMinusP,
      r
    );

  const epsilon =
    0.000001;

  /*
   * Collinear segments.
   */
  if (
    Math.abs(rCrossS) < epsilon &&
    Math.abs(qMinusPCrossR) < epsilon
  ) {

    const rLengthSquared =
      (r.x * r.x) +
      (r.y * r.y);

    if (rLengthSquared <= 0) {
      return false;
    }

    const t0 =
      (
        (qMinusP.x * r.x) +
        (qMinusP.y * r.y)
      ) /
      rLengthSquared;

    const q2MinusP = {
      x: q2.x - p.x,
      y: q2.y - p.y
    };

    const t1 =
      (
        (q2MinusP.x * r.x) +
        (q2MinusP.y * r.y)
      ) /
      rLengthSquared;

    const minT =
      Math.min(
        t0,
        t1
      );

    const maxT =
      Math.max(
        t0,
        t1
      );

    return (
      maxT >= 0 &&
      minT <= 1
    );
  }

  /*
   * Parallel but not collinear.
   */
  if (
    Math.abs(rCrossS) < epsilon
  ) {
    return false;
  }

  const t =
    cross(
      qMinusP,
      s
    ) /
    rCrossS;

  const u =
    cross(
      qMinusP,
      r
    ) /
    rCrossS;

  return (
    t >= 0 &&
    t <= 1 &&
    u >= 0 &&
    u <= 1
  );
}

/* -------------------------------------------- */
/*  Wall Helpers                                */
/* -------------------------------------------- */

/**
 * Get wall endpoints from a Foundry Wall
 * placeable.
 *
 * @param {Wall} wall
 *
 * @returns {object|null}
 */
export function getWallSegment(
  wall
) {

  const coordinates =
    wall?.document?.c ??
    wall?.document?.coords ??
    null;

  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 4
  ) {
    return null;
  }

  const x1 =
    Number(coordinates[0]);

  const y1 =
    Number(coordinates[1]);

  const x2 =
    Number(coordinates[2]);

  const y2 =
    Number(coordinates[3]);

  if (
    !Number.isFinite(x1) ||
    !Number.isFinite(y1) ||
    !Number.isFinite(x2) ||
    !Number.isFinite(y2)
  ) {
    return null;
  }

  return {
    start: {
      x: x1,
      y: y1
    },

    end: {
      x: x2,
      y: y2
    }
  };
}

/**
 * Determine whether a Foundry Wall currently
 * counts as physical cover.
 *
 * Open doors do not count.
 *
 * @param {Wall} wall
 *
 * @returns {boolean}
 */
export function wallQualifiesAsCover(
  wall
) {

  if (!wall?.document) {
    return false;
  }

  const document =
    wall.document;

  const doorType =
    Number(
      document.door
    ) || 0;

  const doorState =
    Number(
      document.ds
    ) || 0;

  /*
   * A wall with an open door does not provide
   * qualifying cover.
   */
  if (
    doorType !== 0 &&
    doorState ===
      CONST.WALL_DOOR_STATES.OPEN
  ) {
    return false;
  }

  return Boolean(
    getWallSegment(
      wall
    )
  );
}

/* -------------------------------------------- */
/*  Cover Search                                */
/* -------------------------------------------- */

/**
 * Find qualifying cover walls for a token.
 *
 * A wall qualifies when:
 *
 * 1. It is valid physical cover.
 * 2. It intersects the line from the source point
 *    to the token center.
 * 3. The token center is within the allowed cover
 *    distance from that wall.
 *
 * @param {object} options
 *
 * @param {object} options.source
 * Source/blast-center point.
 *
 * @param {Token} options.token
 * Token checking for cover.
 *
 * @param {number} options.maxDistance
 * Maximum distance from cover in grid squares.
 *
 * @returns {object[]}
 */
export function getQualifyingCover({
  source = null,
  token = null,
  maxDistance = 1
} = {}) {

  if (
    !canvas?.ready ||
    !source ||
    !token?.center
  ) {
    return [];
  }

  const coverDistance =
    Math.max(
      0,
      Number(maxDistance) || 0
    );

  const tokenCenter = {
    x: Number(token.center.x),
    y: Number(token.center.y)
  };

  if (
    !Number.isFinite(Number(source.x)) ||
    !Number.isFinite(Number(source.y)) ||
    !Number.isFinite(tokenCenter.x) ||
    !Number.isFinite(tokenCenter.y)
  ) {
    return [];
  }

  const walls =
    canvas.walls?.placeables ??
    [];

  const qualifyingCover =
    [];

  for (const wall of walls) {

    if (
      !wallQualifiesAsCover(
        wall
      )
    ) {
      continue;
    }

    const segment =
      getWallSegment(
        wall
      );

    if (!segment) {
      continue;
    }

    /*
     * Cover must be positioned between the source
     * point and the target.
     */
    const blocksSourceLine =
      segmentsIntersect(
        source,
        tokenCenter,
        segment.start,
        segment.end
      );

    if (!blocksSourceLine) {
      continue;
    }

    const distance =
      getPointToSegmentDistanceInSquares(
        tokenCenter,
        segment.start,
        segment.end
      );

    if (
      distance >
      coverDistance
    ) {
      continue;
    }

    qualifyingCover.push({
      type:
        "wall",

      wall,

      distance,

      segment
    });
  }

  return qualifyingCover;
}

/**
 * Determine whether a token has qualifying cover
 * relative to a source point.
 *
 * @param {object} options
 *
 * @param {object} options.source
 * Source/blast-center point.
 *
 * @param {Token} options.token
 *
 * @param {number} options.maxDistance
 * Maximum allowed distance from cover, measured
 * in grid squares.
 *
 * @returns {boolean}
 */
export function hasQualifyingCover({
  source = null,
  token = null,
  maxDistance = 1
} = {}) {

  return (
    getQualifyingCover({
      source,
      token,
      maxDistance
    }).length > 0
  );
}
