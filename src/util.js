import Stats from "three/examples/jsm/libs/stats.module";

export function initStats(type) {
  const panelType =
    typeof type !== "undefined" && type && !isNaN(type)
      ? window.parseInt(type)
      : 0;

  const stats = new Stats();
  stats.showPanel(panelType); // 0: fps, 1: ms, 2: mb, 3+: custom
  window.document.body.appendChild(stats.dom);

  return stats;
}
