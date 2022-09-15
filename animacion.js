var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
var cilindroConcreto; var maquinaCarga;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
var loader = new GLTFLoader();
var obj;
loader.load('concreto-compresion.gltf', function (gltf) {
	obj = gltf.scene;
	scene.add(gltf.scene);
}, undefined, function (error) {
	console.error( error );
});
			
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();