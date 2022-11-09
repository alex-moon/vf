import {ImageUtils, PointLight, Scene} from "three";

export class LensflareHelper {
  public static get(scene: Scene) {


  }
}
/**
  var ambient = new THREE.AmbientLight( 0xffffff );
  ambient.color.setHSV( 0.1, 0.5, 0.3 );
  scene.add( ambient );


  var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
  dirLight.position.set( 0, -1, 0 ).normalize();
  scene.add( dirLight );

  dirLight.color.setHSV( 0.1, 0.725, 0.9 );

  // lens flares

  var textureFlare0 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare0.png" );
  var textureFlare2 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare2.png" );
  var textureFlare3 = THREE.ImageUtils.loadTexture( "textures/lensflare/lensflare3.png" );

  addLight( 0.55, 0.825, 0.99, 5000, 0, -1000 );
  addLight( 0.08, 0.825, 0.99,    0, 0, -1000 );
  addLight( 0.995, 0.025, 0.99, 5000, 5000, -1000 );

  function addLight( h, s, v, x, y, z ) {

    var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
    light.position.set( x, y, z );
    scene.add( light );

    light.color.setHSV( h, s, v );

    var flareColor = new THREE.Color( 0xffffff );
    flareColor.copy( light.color );
    THREE.ColorUtils.adjustHSV( flareColor, 0, -0.5, 0.5 );

    var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

    lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
    lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
    lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

    lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
    lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
    lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
    lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

    lensFlare.customUpdateCallback = lensFlareUpdateCallback;
    lensFlare.position = light.position;

    scene.add( lensFlare );

  }

  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: true, maxLights: 8, alpha: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( scene.fog.color, 1 );

  container.appendChild( renderer.domElement );

  //

  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.physicallyBasedShading = true;

  // stats

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild( stats.domElement );

  stats.domElement.children[ 0 ].children[ 0 ].style.color = "#aaa";
  stats.domElement.children[ 0 ].style.background = "transparent";
  stats.domElement.children[ 0 ].children[ 1 ].style.display = "none";

  // events

  window.addEventListener( 'resize', onWindowResize, false );

}

//

function lensFlareUpdateCallback( object ) {

  var f, fl = object.lensFlares.length;
  var flare;
  var vecX = -object.positionScreen.x * 2;
  var vecY = -object.positionScreen.y * 2;


  for( f = 0; f < fl; f++ ) {

    flare = object.lensFlares[ f ];

    flare.x = object.positionScreen.x + vecX * flare.distance;
    flare.y = object.positionScreen.y + vecY * flare.distance;

    flare.rotation = 0;

  }

  object.lensFlares[ 2 ].y += 0.025;
  object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + 45 * Math.PI / 180;

}

//

function onWindowResize( event ) {

  renderer.setSize( window.innerWidth, window.innerHeight );

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

}

//

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

  var delta = clock.getDelta();

  controls.update( delta );
  renderer.render( scene, camera );

}
*/
