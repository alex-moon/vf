import {NearestFilter, RepeatWrapping, TextureLoader} from "three";

export class TextureHelper {
  public static get(key: string) {
    return '/textures/' + key + '.png';
  }

  public static map(loader: TextureLoader, texture: string, side: number) {
    const map = loader.load(texture);
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(side, side);
    map.minFilter = NearestFilter;
    map.magFilter = NearestFilter;
    return map;
  }
}
