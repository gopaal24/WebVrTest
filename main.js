import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

var clock = new THREE.Clock();
var container, camera, scene, renderer, room, crosshair, HIT;
var objects=[]; // collection of objects
var num=500; // number of objects
var raycaster = new THREE.Raycaster();

var scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera
( 45, window.innerWidth/window.innerHeight,
0.1, 1000 );

var user = new THREE.Group()
user.position.set(0,0,0)
user.add(camera)
scene.add(user)

renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio( window.
devicePixelRatio );
renderer.setSize( window.innerWidth, window.
innerHeight );
renderer.xr.enabled = true;
document.body.appendChild( renderer.domElement);

crosshair = new THREE.Mesh(
    new THREE.RingGeometry( 0.02, 0.04, 32 ),
    new THREE.MeshBasicMaterial( {
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
    } )
    );
crosshair.position.z = - 1;
camera.add( crosshair );

const hexCharacters = [0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F"]

function getCharacter(index) {
	return hexCharacters[index]
}

function generateColor(){

	let hexColorRep = ""

    for (let position = 0; position < 6; position++){
        hexColorRep += getCharacter( Math.floor(Math.random()*16) )
    }

	return hexColorRep

}

function randSign(){
    if(Math.random() > 0.5) return 1;
        return -1;
}

room = new THREE.LineSegments(new THREE.BoxGeometry( 6, 6, 6, 10, 10, 10 ),new THREE.LineBasicMaterial( { color:0x808080 } ));
scene.add( room );

for(let i=0;i<num;i++){

    const color = `0x${generateColor()}`
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), new THREE.MeshBasicMaterial({color: parseInt(color, 16)}))
    const rndSign = randSign()
    box.position.set(Math.random()*6, Math.random()*6, Math.random()*6)
    scene.add(box)
}

scene.add( new THREE.HemisphereLight( 0x806060, 0x404040 ) );
var light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 1, 1, 1 ).normalize();
scene.add( light );

document.body.appendChild( VRButton.createButton( renderer ) );

const ball1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 32, 32), new THREE.MeshBasicMaterial({color: 0x808000}))
const ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 32, 32), new THREE.MeshBasicMaterial({color: 0x808000}))

const controllerGrip1 = renderer.xr.getControllerGrip(0);
let controllerModel = new XRControllerModelFactory;
const model1 = controllerModel.createControllerModel( controllerGrip1 );
// controllerGrip1.add( model1 );
controllerGrip1.add( ball1 );
scene.add( controllerGrip1 );

const overlay = document.querySelector(".overlay")

const controllerGrip2= renderer.xr.getControllerGrip(1);
const model2 = controllerModel.createControllerModel( controllerGrip2 );
// controllerGrip2.add( model2 );
controllerGrip2.add( ball2 );
scene.add(controllerGrip2);

controllerGrip1.addEventListener("connected", (event)=>{
    controllerGrip1.gamepad = event.data.gamepad
})
controllerGrip2.addEventListener("connected", (event)=>{
    controllerGrip2.gamepad = event.data.gamepad
})

user.add(controllerGrip1)
user.add(controllerGrip2)

let xrCamera = renderer.xr.getCamera(camera);
let userSpeed = 0.01

function handleMovement(controller){
    const frwdDir = new THREE.Vector3(0,0,-1).applyQuaternion(xrCamera.quaternion)
    const leftdDir = new THREE.Vector3(-1,0,0).applyQuaternion(xrCamera.quaternion)
    if(controller.gamepad){
        user.position.x -= frwdDir.x * userSpeed * controller.gamepad.axes[3]
        user.position.z -= frwdDir.z * userSpeed * controller.gamepad.axes[3]
        
        user.position.x -= leftdDir.x * userSpeed * controller.gamepad.axes[2]
        user.position.z -= leftdDir.z * userSpeed * controller.gamepad.axes[2]        
    }
}

renderer.setAnimationLoop( function () {
    handleMovement(controllerGrip1)
    handleMovement(controllerGrip2)
	renderer.render( scene, camera );

} );
