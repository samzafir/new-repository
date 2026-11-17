import * as THREE from './three.module.js';

export async function installRoomAR({ renderer, button, status, overlay, getChair, redraw }) {
  const quickLook = document.createElement('a');
  if (quickLook.relList.supports('ar')) {
    quickLook.rel = 'ar';
    quickLook.className = 'room-quick-look';
    const icon = document.createElement('img');
    icon.alt = '';
    icon.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    quickLook.append(icon, 'Open in Apple AR');
    quickLook.hidden = true;
    status.after(quickLook);
    let objectUrl;
    let preparedChair;
    function clearPrepared() {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = undefined;
      quickLook.hidden = true;
    }
    quickLook.addEventListener('click', event => {
      if (getChair()?.object === preparedChair) return;
      event.preventDefault();
      clearPrepared();
      status.textContent = 'The design changed. Tap View in your room to prepare the new chair.';
    });
    window.addEventListener('pagehide', event => {
      if (!event.persisted) clearPrepared();
    });
    button.addEventListener('click', async () => {
      const chair = getChair();
      if (!chair) {
        status.textContent = 'Wait for the current chair to finish loading.';
        return;
      }
      button.disabled = true;
      clearPrepared();
      status.textContent = 'Preparing your chair for Apple AR…';
      try {
        const { USDZExporter } = await import('./USDZExporter.js');
        const group = new THREE.Group();
        group.add(chair.object.clone(true));
        group.scale.setScalar(chair.heightMeters / chair.viewerHeight);
        group.updateMatrixWorld(true);
        const bytes = await new USDZExporter().parseAsync(group, {
          quickLookCompatible:true, maxTextureSize:1024,
        });
        if (getChair()?.object !== chair.object) {
          status.textContent = 'The design changed. Tap View in your room again.';
          return;
        }
        objectUrl = URL.createObjectURL(new Blob([bytes], {type:'model/vnd.usdz+zip'}));
        preparedChair = chair.object;
        quickLook.href = objectUrl + '#allowsContentScaling=0';
        quickLook.download = 'seating-studio-chair.usdz';
        quickLook.hidden = false;
        status.textContent = 'Tap Open in Apple AR, then point the camera at the floor.';
      } catch {
        status.textContent = 'Apple AR could not prepare this chair. Try a catalog fabric or reset the design, then try again in Safari.';
      } finally {
        button.disabled = false;
      }
    });
    return;
  }
  const xr = navigator.xr;
  const supported = await xr?.isSessionSupported('immersive-ar').catch(() => false);
  if (!supported) {
    button.disabled = true;
    status.textContent = 'For room AR, open this HTTPS page in iPhone Safari or Chrome on an ARCore-compatible Android phone. You can still use the 3D viewer here.';
    return;
  }
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');
  button.addEventListener('click', async () => {
    const chair = getChair();
    if (!chair) {
      status.textContent = 'Wait for the current chair to finish loading.';
      return;
    }
    button.disabled = true;
    let session;
    let hitSource;
    const room = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    room.add(new THREE.HemisphereLight(0xffffff, 0x887766, 2.5));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(2, 4, 3);
    room.add(light);
    const placement = new THREE.Group();
    const mesh = chair.object.clone(true);
    placement.add(mesh);
    placement.scale.setScalar(chair.heightMeters / chair.viewerHeight);
    placement.visible = false;
    room.add(placement);
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(.09, .105, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({color:0xf6f5df, side:THREE.DoubleSide}),
    );
    reticle.visible = false;
    room.add(reticle);
    const up = new THREE.Vector3(0,1,0);
    const normal = new THREE.Vector3();
    let cleaned = false;
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      renderer.setAnimationLoop(null);
      hitSource?.cancel();
      reticle.geometry.dispose();
      reticle.material.dispose();
      overlay.hidden = true;
      button.disabled = false;
      queueMicrotask(redraw);
    }
    try {
      session = await xr.requestSession('immersive-ar', {
        requiredFeatures:['hit-test','dom-overlay'],
        domOverlay:{root:overlay},
      });
      session.addEventListener('end', cleanup, {once:true});
      overlay.hidden = false;
      const instructions = overlay.querySelector('p');
      instructions.textContent = 'Aim at the floor and move your phone slowly.';
      const exit = overlay.querySelector('button');
      exit.onclick = () => session.end().catch(cleanup);
      exit.onbeforexrselect = event => event.preventDefault();
      const viewerSpace = await session.requestReferenceSpace('viewer');
      hitSource = await session.requestHitTestSource({space:viewerSpace});
      await renderer.xr.setSession(session);
      session.addEventListener('select', () => {
        if (!reticle.visible) return;
        placement.position.copy(reticle.position);
        placement.visible = true;
      });
      renderer.setAnimationLoop((_, frame) => {
        const space = renderer.xr.getReferenceSpace();
        const pose = space && frame?.getHitTestResults(hitSource)[0]?.getPose(space);
        reticle.visible = false;
        if (pose) {
          const {position, orientation} = pose.transform;
          reticle.quaternion.set(orientation.x,orientation.y,orientation.z,orientation.w);
          if (normal.copy(up).applyQuaternion(reticle.quaternion).dot(up) > .85) {
            reticle.visible = true;
            reticle.position.set(position.x,position.y+.002,position.z);
          }
        }
        const message = reticle.visible ? 'Tap the floor marker to place or move the chair.' : 'Aim at the floor and move your phone slowly.';
        if (message !== instructions.textContent) instructions.textContent = message;
        renderer.render(room,camera);
      });
    } catch {
      if (session) await session.end().catch(() => {});
      cleanup();
      status.textContent = 'AR could not start. On Android, open this page in Chrome, allow camera access, and check that Google Play Services for AR is installed and up to date.';
    }
  });
}
