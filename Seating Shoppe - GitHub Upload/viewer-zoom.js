const minDistance = 2.35;
const maxDistance = 10;
const defaultDistance = 5.1;

export function installViewerZoom({canvas, getDistance, changeDistance, rotate, controls}) {
  const pointers = new Map();
  const [zoomIn, zoomOut] = controls.querySelectorAll('button');
  const zoomLevel = controls.querySelector('output');
  function update() {
    const distance = getDistance();
    zoomIn.disabled = distance <= minDistance;
    zoomOut.disabled = distance >= maxDistance;
    zoomLevel.value = Math.round(defaultDistance / distance * 100) + '%';
  }
  function zoom(factor) {
    changeDistance(Math.min(maxDistance, Math.max(minDistance, getDistance() * factor)));
    update();
  }
  const spread = () => {
    const [first, second] = pointers.values();
    return Math.hypot(first.x - second.x, first.y - second.y);
  };
  const point = event => ({x:event.clientX, y:event.clientY});
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointers.set(event.pointerId, point(event));
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const before = pointers.size === 2 ? spread() : 0;
    const current = point(event);
    pointers.set(event.pointerId, current);
    if (pointers.size === 2) {
      const after = spread();
      if (before > 1 && after > 1) zoom(before / after);
    } else if (pointers.size === 1) {
      rotate(current.x - previous.x, current.y - previous.y);
    }
  });
  for (const event of ['pointerup','pointercancel','lostpointercapture']) {
    canvas.addEventListener(event, input => pointers.delete(input.pointerId));
  }
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
    zoom(Math.exp(Math.max(-250, Math.min(250, event.deltaY * units)) * .002));
  }, {passive:false});
  zoomIn.addEventListener('click', () => zoom(1 / 1.2));
  zoomOut.addEventListener('click', () => zoom(1.2));
  update();
  return { update, isInteracting: () => pointers.size > 0 };
}
