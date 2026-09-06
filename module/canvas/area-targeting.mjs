/**
 * Tactical
 * Reusable Area Targeting
 *
 * Provides generic canvas point selection and
 * token collection for radius-based effects.
 *
 * This file does not resolve damage, healing,
 * Saves, statuses, or other effect logic.
 */

const AREA_FILTERS = new Set([
  "all",
  "friendly",
  "hostile",
  "neutral"
]);

/* -------------------------------------------- */
/*  Filter Helpers                              */
/* -------------------------------------------- */

/**
 * Determine whether a token matches an area
 * targeting disposition filter.
 *
 * @param {Token} token
 * @param {string} filter
 *
 * @returns {boolean}
 */
export function tokenMatchesAreaFilter(
  token,
  filter = "all"
) {

  if (!token?.document) {
    return false;
  }

  const normalizedFilter =
    String(filter || "all")
      .toLowerCase();

  if (!AREA_FILTERS.has(normalizedFilter)) {
    return false;
  }

  if (normalizedFilter === "all") {
    return true;
  }

  const disposition =
    token.document.disposition;

  if (normalizedFilter === "friendly") {

    return disposition ===
      CONST.TOKEN_DISPOSITIONS.FRIENDLY;
  }

  if (normalizedFilter === "hostile") {

    return disposition ===
      CONST.TOKEN_DISPOSITIONS.HOSTILE;
  }

  if (normalizedFilter === "neutral") {

    return disposition ===
      CONST.TOKEN_DISPOSITIONS.NEUTRAL;
  }

  return false;
}

/* -------------------------------------------- */
/*  Distance Helpers                            */
/* -------------------------------------------- */

/**
 * Calculate the distance between a scene point
 * and a token center in grid squares.
 *
 * Token inclusion is based on the token's center.
 *
 * @param {object} center
 * @param {number} center.x
 * @param {number} center.y
 * @param {Token} token
 *
 * @returns {number}
 */
export function getTokenDistanceFromPoint(
  center,
  token
) {

  const gridSize =
    Number(
      canvas.scene?.grid?.size
    ) || 0;

  if (gridSize <= 0) {
    return Infinity;
  }

  const tokenCenter =
    token?.center;

  if (!tokenCenter) {
    return Infinity;
  }

  const dx =
    Number(tokenCenter.x) -
    Number(center?.x);

  const dy =
    Number(tokenCenter.y) -
    Number(center?.y);

  const pixelDistance =
    Math.hypot(
      dx,
      dy
    );

  return pixelDistance / gridSize;
}

/* -------------------------------------------- */
/*  Token Collection                            */
/* -------------------------------------------- */

/**
 * Get every canvas token inside a radius.
 *
 * Radius is measured in grid squares from the
 * selected point to each token's center.
 *
 * @param {object} options
 * @param {object} options.center
 * @param {number} options.center.x
 * @param {number} options.center.y
 * @param {number} options.radius
 * @param {string} options.filter
 *
 * @returns {Token[]}
 */
export function getTokensInArea({
  center = null,
  radius = 0,
  filter = "all"
} = {}) {

  if (!canvas?.ready) {
    return [];
  }

  if (
    !center ||
    !Number.isFinite(Number(center.x)) ||
    !Number.isFinite(Number(center.y))
  ) {
    return [];
  }

  const areaRadius =
    Math.max(
      0,
      Number(radius) || 0
    );

  const normalizedFilter =
    String(filter || "all")
      .toLowerCase();

  if (!AREA_FILTERS.has(normalizedFilter)) {

    console.warn(
      `Tactical | Invalid area targeting filter: ${filter}`
    );

    return [];
  }

  const tokens =
    canvas.tokens?.placeables ?? [];

  return tokens.filter(
    token => {

      if (
        !tokenMatchesAreaFilter(
          token,
          normalizedFilter
        )
      ) {
        return false;
      }

      const distance =
        getTokenDistanceFromPoint(
          center,
          token
        );

      return distance <= areaRadius;
    }
  );
}

/* -------------------------------------------- */
/*  Pointer Helpers                             */
/* -------------------------------------------- */

/**
 * Convert a PIXI pointer event into canvas-local
 * scene coordinates.
 *
 * @param {object} event
 *
 * @returns {{x: number, y: number} | null}
 */
function getCanvasPointFromEvent(event) {

  if (!event) {
    return null;
  }

  try {

    if (
      typeof event.getLocalPosition ===
      "function"
    ) {

      const point =
        event.getLocalPosition(
          canvas.stage
        );

      return {
        x: Number(point.x),
        y: Number(point.y)
      };
    }

    if (
      event.global &&
      canvas.stage?.toLocal
    ) {

      const point =
        canvas.stage.toLocal(
          event.global
        );

      return {
        x: Number(point.x),
        y: Number(point.y)
      };
    }
  }
  catch (error) {

    console.error(
      "Tactical | Failed to determine canvas point.",
      error
    );
  }

  return null;
}

/* -------------------------------------------- */
/*  Area Selection                              */
/* -------------------------------------------- */

/**
 * Allow the user to select an area center on
 * the canvas and return every matching token.
 *
 * Left-click:
 * Select center.
 *
 * Escape:
 * Cancel.
 *
 * Right-click:
 * Cancel.
 *
 * @param {object} options
 * @param {number} options.radius
 * Radius in grid squares.
 *
 * @param {string} options.filter
 * Supported:
 * all
 * friendly
 * hostile
 * neutral
 *
 * @returns {Promise<object>}
 */
export async function selectAreaTargets({
  radius = 0,
  filter = "all"
} = {}) {

  if (!canvas?.ready) {

    ui.notifications.warn(
      "Tactical | The canvas must be ready to select an area."
    );

    return {
      cancelled: true,
      center: null,
      radius: 0,
      filter: "all",
      tokens: []
    };
  }

  const gridSize =
    Number(
      canvas.scene?.grid?.size
    ) || 0;

  if (gridSize <= 0) {

    ui.notifications.warn(
      "Tactical | This scene does not have a valid grid size."
    );

    return {
      cancelled: true,
      center: null,
      radius: 0,
      filter: "all",
      tokens: []
    };
  }

  const areaRadius =
    Math.max(
      0,
      Number(radius) || 0
    );

  const normalizedFilter =
    String(filter || "all")
      .toLowerCase();

  if (!AREA_FILTERS.has(normalizedFilter)) {

    ui.notifications.warn(
      `Tactical | Invalid area filter: ${filter}`
    );

    return {
      cancelled: true,
      center: null,
      radius: areaRadius,
      filter: normalizedFilter,
      tokens: []
    };
  }

  ui.notifications.info(
    `Select an area center. Radius: ${areaRadius} square${areaRadius === 1 ? "" : "s"}. Escape or right-click to cancel.`
  );

  return new Promise(
    resolve => {

      let finished =
        false;

      const view =
        canvas.app?.view;

      /* -------------------------------------------- */
      /*  Cleanup                                      */
      /* -------------------------------------------- */

      const cleanup =
        () => {

          canvas.stage.off(
            "pointerdown",
            onPointerDown
          );

          window.removeEventListener(
            "keydown",
            onKeyDown
          );

          if (view) {

            view.removeEventListener(
              "contextmenu",
              onContextMenu
            );
          }
        };

      /* -------------------------------------------- */
      /*  Finish                                       */
      /* -------------------------------------------- */

      const finish =
        result => {

          if (finished) {
            return;
          }

          finished =
            true;

          cleanup();

          resolve(result);
        };

      /* -------------------------------------------- */
      /*  Cancel                                       */
      /* -------------------------------------------- */

      const cancel =
        () => {

          finish({
            cancelled: true,
            center: null,
            radius: areaRadius,
            filter: normalizedFilter,
            tokens: []
          });
        };

      /* -------------------------------------------- */
      /*  Pointer Selection                            */
      /* -------------------------------------------- */

      const onPointerDown =
        event => {

          /*
           * Only left-click selects the point.
           * Right-click is handled separately
           * as cancellation.
           */
          if (
            Number(event?.button) !== 0
          ) {
            return;
          }

          const center =
            getCanvasPointFromEvent(
              event
            );

          if (!center) {

            ui.notifications.warn(
              "Tactical | Could not determine the selected area center."
            );

            return;
          }

          const tokens =
            getTokensInArea({
              center,
              radius: areaRadius,
              filter: normalizedFilter
            });

          finish({
            cancelled: false,

            center: {
              x: center.x,
              y: center.y
            },

            radius:
              areaRadius,

            filter:
              normalizedFilter,

            tokens
          });
        };

      /* -------------------------------------------- */
      /*  Keyboard Cancel                              */
      /* -------------------------------------------- */

      const onKeyDown =
        event => {

          if (
            event.key !==
            "Escape"
          ) {
            return;
          }

          event.preventDefault();

          cancel();
        };

      /* -------------------------------------------- */
      /*  Right-Click Cancel                           */
      /* -------------------------------------------- */

      const onContextMenu =
        event => {

          event.preventDefault();

          cancel();
        };

      /* -------------------------------------------- */
      /*  Register Listeners                           */
      /* -------------------------------------------- */

      canvas.stage.on(
        "pointerdown",
        onPointerDown
      );

      window.addEventListener(
        "keydown",
        onKeyDown
      );

      if (view) {

        view.addEventListener(
          "contextmenu",
          onContextMenu
        );
      }
    }
  );
}
