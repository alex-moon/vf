import {Color, ConeGeometry, Mesh, PointLight, ShaderMaterial} from "three";

export class ThrusterHelper {
  public static get(radius: number, height: number, color ?: any) {
    if (color === undefined) {
      color = 0x33ccff;
    }
    const geometry = new ConeGeometry(radius, height, 16);
    const material = new ShaderMaterial({
      uniforms: {
        color: {value: new Color(color)},
      },
      vertexShader: this.vertexShader(),
      fragmentShader: this.fragmentShader(),
      transparent: true,
    });
    const mesh = new Mesh(geometry, material);
    const light = new PointLight(color, 0.5, 5);
    mesh.add(light);
    return mesh;
  }

  protected static vertexShader() {
    return `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  protected static fragmentShader() {
    return `
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
        float alpha = smoothstep(0.8, 0.0, vUv.y);
        float colorMix = smoothstep(0.0, 1.0, vUv.y);
        vec3 white = vec3(1.0, 1.0, 1.0);
        // gl_FragColor = vec4(mix(white, color, colorMix), alpha);
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }
}
