import { Box3, Group, Vector3 } from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';

export const supplied = {
  'baratheon-chair': { frame: 'Base_Baratheon_Chair', seat: 'Seat_Baratheon_Chair', back: 'Back_Baratheon_Chair', rear: 'Back_of_Back_Baratheon_Chair', alternateBack: 'Tufted_Baratheon_Chair' },
  'aperture-chair': { frame: 'Legs', seat: 'Seat', back: 'Back', rear: 'Back_of_Back', alternateSeat: 'Pullover_Seat' },
  'parigi-side-chair': { folder: 'parigi-chair', frame: 'Base_Parigi_Chair', seat: 'Seat_Parigi_Chair', back: 'Back_Parigi_Chair', rear: 'Back_of_Back_Parigi_Chair' },
  'tau-chair': { frame: 'Base_tau', seat: 'boxed_seat_tau', alternateSeat: 'Pullover_Seat_tau' },
  "adrian-chair": {"frame":"Base_Adrian","back":"Back_Adrian","rear":"Back_of_Back_Adrian","seat":"Boxed_Seat_Adrian","alternateSeat":"Pullover_Seat_Adrian"},
  "baratheon-s-chair": {"frame":"Base_Baratheon_S","back":"Back_Baratheon_S","rear":"Back_Of_Back_Baratheon_S","seat":"seat_Baratheon_S","alternateSeat":"Pullover_Baratheon_S"},
  "churchill-chair": {"frame":"basee","back":"back","rear":"back_of_back_churchil","seat":"boxed_seat","alternateSeat":"pullover"},
  "carmine-chair": {"frame":"base","back":"back","rear":"back_of_back","seat":"Boxed_Seat","alternateSeat":"Pullover_Seat"},
};

const cache = new Map();
const loader = new GLTFLoader();

export async function assembleSuppliedChair(product, state, materials) {
  const parts = supplied[product.id];
  const folder = parts.folder ?? product.id;
  const slots = [
    [parts.frame, materials.wood],
    [state.seatStyle === 'alternate' ? parts.alternateSeat ?? parts.seat : parts.seat, materials.seat],
    [state.backStyle === 'tufted' ? parts.alternateBack ?? parts.back : parts.back, materials.back],
    [parts.rear, materials.back],
  ];
  const chair = new Group();
  const meshes = await Promise.all(slots.filter(([name]) => name).map(async ([name, material]) => {
    const url = `models/${folder}/${name}.glb`;
    if (!cache.has(url)) {
      cache.set(url, loader.loadAsync(url).catch(error => {
        cache.delete(url);
        throw error;
      }));
    }
    const { scene } = await cache.get(url);
    const object = scene.clone(true);
    object.traverse(mesh => {
      if (!mesh.isMesh) return;
      mesh.geometry = mesh.geometry.clone();
      mesh.material = material;
      mesh.castShadow = mesh.receiveShadow = true;
    });
    return object;
  }));
  chair.add(...meshes);
  const bounds = new Box3().setFromObject(chair);
  const center = bounds.getCenter(new Vector3());
  const scale = product.h / (bounds.max.y - bounds.min.y);
  chair.userData.sourceHeightMeters = bounds.max.y - bounds.min.y;
  chair.scale.setScalar(scale);
  chair.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  return chair;
}
