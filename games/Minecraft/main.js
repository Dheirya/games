window.onbeforeunload = function (e) {
    e.preventDefault();
    e.returnValue = "Really want to quit the game?";
};
document.onkeydown = function (e) {
    e = e || window.event; //Get event
    if (!e.ctrlKey) return;
    var code = e.which || e.keyCode; //Get key code
    switch (code) {
        case 83: //Block Ctrl+S
        case 87: //Block Ctrl+W -- Not work in Chrome and new Firefox
            e.preventDefault();
            e.stopPropagation();
            break;
    }
};

var cursor = document.getElementById("cursor");
cursor.style.left = (0.5 * window.innerWidth - 0.5 * cursor.width).toString() + "px";
cursor.style.top = (0.5 * window.innerHeight - 0.5 * cursor.height).toString() + "px";
var stats = new Stats();
stats.showPanel(0); // 0:fps, 1:ms, 2:mb, 3+:custom
document.body.appendChild(stats.dom);
function animate() {
	stats.begin();
	stats.end();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

noise.seed(Math.random());

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x00ffff);
scene.fog = new THREE.Fog(0x00ffff, 10, 650);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var faces = [
    {
        dir: [-5, 0, 0, "left"],
    },
    {
        dir: [5, 0, 0, "right"],
    },
    {
        dir: [0, -5, 0, "bottom"],
    },
    {
        dir: [0, 5, 0, "top"],
    },
    {
        dir: [0, 0, -5, "back"],
    },
    {
        dir: [0, 0, 5, "front"],
    },
];

function Block(x, y, z, placed, blockType) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.placed = placed;
    this.blockType = blockType;
}

var chunks = [];
var xoff = 0;
var zoff = 0;
var inc = 0.05;
var amplitude = 30 + Math.random() * 70;
var renderDistance = 5;
var chunkSize = 10;
var depth = 6; // keeps track of the depth of the world (in terms of blocks)
var minWorldY = -500; // the minimum y coordinate of a block
camera.position.x = ((renderDistance * chunkSize) / 2) * 5;
camera.position.z = ((renderDistance * chunkSize) / 2) * 5;
camera.position.y = 75;
const loader = new THREE.TextureLoader();
loader.load('https://res.cloudinary.com/dpoer5oaq/image/upload/v1630412991/Screen_Shot_2021-08-31_at_8.29.22_AM_y8ycyr.png' , function(texture)
            {
             scene.background = texture;
            });
hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.6 );
var materialArray = [
    new THREE.MeshBasicMaterial({ map: loader.load("texture/texture.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/texture.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/texture.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/texture.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/texture.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/texture.png") }),
];

var blockBox = new THREE.BoxGeometry(5, 5, 5);
var grassTexture = [
    new THREE.MeshBasicMaterial({ map: loader.load("texture/grass/side.jpg") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/grass/side.jpg") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/grass/top.jpg") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/grass/bottom.jpg") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/grass/side.jpg") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/grass/side.jpg") }),
];
var dirtTexture = [
    new THREE.MeshBasicMaterial({ map: loader.load("texture/dirt/dirt.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/dirt/dirt.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/dirt/dirt.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/dirt/dirt.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/dirt/dirt.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/dirt/dirt.png") }),
];
var woodTexture = [
    new THREE.MeshBasicMaterial({ map: loader.load("texture/wood/wood.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/wood/wood.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/wood/wood.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/wood/wood.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/wood/wood.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/wood/wood.png") }),
];
var brickTexture = [
    new THREE.MeshBasicMaterial({ map: loader.load("texture/brick/brick.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/brick/brick.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/brick/brick.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/brick/brick.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/brick/brick.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/brick/brick.png") }),
];
var cobblestoneTexture = [
    new THREE.MeshBasicMaterial({ map: loader.load("texture/cobblestone/cobblestone.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/cobblestone/cobblestone.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/cobblestone/cobblestone.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/cobblestone/cobblestone.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/cobblestone/cobblestone.png") }),
    new THREE.MeshBasicMaterial({ map: loader.load("texture/cobblestone/cobblestone.png") }),
];
var blocks = [
    { name: "grass", materialArray: grassTexture, mesh: new THREE.InstancedMesh(blockBox, grassTexture, renderDistance * renderDistance * chunkSize * chunkSize * depth), count: 0, range: [0] },
    { name: "dirt", materialArray: dirtTexture, mesh: new THREE.InstancedMesh(blockBox, dirtTexture, renderDistance * renderDistance * chunkSize * chunkSize * depth), count: 0, range: [1, 2] },
    { name: "cobblestone", materialArray: cobblestoneTexture, mesh: new THREE.InstancedMesh(blockBox, cobblestoneTexture, renderDistance * renderDistance * chunkSize * chunkSize * depth), count: 0, range: [5, 6] },
    { name: "wood", materialArray: woodTexture, mesh: new THREE.InstancedMesh(blockBox, woodTexture, renderDistance * renderDistance * chunkSize * chunkSize * depth), count: 0, range: [3] },
    { name: "brick", materialArray: brickTexture, mesh: new THREE.InstancedMesh(blockBox, brickTexture, renderDistance * renderDistance * chunkSize * chunkSize * depth), count: 0, range: [4] },
];
var blockTypes = ["grass", "dirt", "cobblestone", "wood", "brick"];
var make_type = "grass";

for (var i = 0; i < renderDistance; i++) {
    for (j = 0; j < renderDistance; j++) {
        var chunk = [];
        for (var x = i * chunkSize; x < i * chunkSize + chunkSize; x++) {
            for (var z = j * chunkSize; z < j * chunkSize + chunkSize; z++) {
                xoff = inc * x;
                zoff = inc * z;
                var v = Math.round((noise.perlin2(xoff, zoff) * amplitude) / 5) * 5;
                for (var d = 0; d < depth; d++) {
                    if (v - d * 5 < minWorldY) {
                        continue;
                    }
                    let matrix = new THREE.Matrix4().makeTranslation(x * 5, v - d * 5, z * 5);
                    for (var b = 0; b < blocks.length; b++) {
                        if (blocks[b].range.includes(d)) {
                            blocks[b].mesh.setMatrixAt(blocks[b].count, matrix);
                            blocks[b].count++;
                            chunk.push(new Block(x * 5, v - d * 5, z * 5, false, blocks[b].name));
                        }
                    }
                }
            }
        }
        chunks.push(chunk);
    }
}

for (var i = 0; i < blocks.length; i++) {
    scene.add(blocks[i].mesh);
}

var keys = [];
var canJump = true;
var controlOptions = {
    forward: "w",
    up: "ArrowUp",
    backward: "s",
    down: "ArrowDown",
    right: "d",
    rarrow: "ArrowRight",
    left: "a",
    larrow: "ArrowLeft",
    jump: " ", // " " = space
    placeBlock: "Backspace",
    placeBlockr: "Enter",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    fly: "f",
};

var placedBlocks = [];
var chunkMap = [];
for (var x = 0; x < renderDistance; x++) {
    for (var z = 0; z < renderDistance; z++) {
        chunkMap.push({ x: x, z: z });
    }
}

function identifyChunk(x, z) {
    var lowestX = lowestXBlock();
    var lowestZ = lowestZBlock();
    var difX = x - lowestX;
    var difZ = z - lowestZ;
    var divX = Math.floor(difX / (chunkSize * 5));
    var divZ = Math.floor(difZ / (chunkSize * 5));
    var index = undefined;
    for (var i = 0; i < chunkMap.length; i++) {
        if (chunkMap[i].x == divX && chunkMap[i].z == divZ) {
            index = i;
            break;
        }
    }
    return index; // Identified the chunks!!!
}

var start = 0;
var sprint = false;
document.addEventListener("keydown", function (e) {
    if (e.key == "w") {
        var elapsed = new Date().getTime();
        if (elapsed - start <= 300) {
            sprint = true;
        }
        start = elapsed;
    }

    if (e.key == "ArrowUp") {
        var elapsed = new Date().getTime();
        if (elapsed - start <= 300) {
            sprint = true;
        }
        start = elapsed;
    }

    keys.push(e.key);

    if (e.key == controlOptions.jump && canJump == true) {
        ySpeed = -1;
        canJump = false;
    }
    if (e.key == controlOptions.fly) {
        ySpeed = -1;
    }
    if (e.key == controlOptions.one) {
        make_type = "grass";
        document.getElementById("one").classList.add("opa");
        document.getElementById("two").classList.remove("opa");
        document.getElementById("three").classList.remove("opa");
        document.getElementById("four").classList.remove("opa");
        document.getElementById("five").classList.remove("opa");
    }
    if (e.key == controlOptions.two) {
        make_type = "dirt";
        document.getElementById("one").classList.remove("opa");
        document.getElementById("two").classList.add("opa");
        document.getElementById("three").classList.remove("opa");
        document.getElementById("four").classList.remove("opa");
        document.getElementById("five").classList.remove("opa");
    }
    if (e.key == controlOptions.three) {
        make_type = "cobblestone";
        document.getElementById("one").classList.remove("opa");
        document.getElementById("two").classList.remove("opa");
        document.getElementById("three").classList.add("opa");
        document.getElementById("four").classList.remove("opa");
        document.getElementById("five").classList.remove("opa");
    }
    if (e.key == controlOptions.four) {
        make_type = "wood";
        document.getElementById("one").classList.remove("opa");
        document.getElementById("two").classList.remove("opa");
        document.getElementById("three").classList.remove("opa");
        document.getElementById("four").classList.add("opa");
        document.getElementById("five").classList.remove("opa");
    }
    if (e.key == controlOptions.five) {
        make_type = "brick";
        document.getElementById("one").classList.remove("opa");
        document.getElementById("two").classList.remove("opa");
        document.getElementById("three").classList.remove("opa");
        document.getElementById("four").classList.remove("opa");
        document.getElementById("five").classList.add("opa");
    }
    if (e.key == controlOptions.placeBlockr) {
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        pointer.x = 0.5 * 2 - 1;
        pointer.y = -1 * 0.5 * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        var intersection;
        var next = false;
        var distance = Infinity;
        for (var i = 0; i < blocks.length; i++) {
            var int = raycaster.intersectObject(blocks[i].mesh);
            if (int[0] != undefined && int[0].distance < 40 && int[0].distance < distance) {
                next = true;
                intersection = int;
                distance = int[0].distance;
            }
        }
        if (next) {
            console.log(intersection[0]);
            var materialIndex = intersection[0].face.materialIndex;
            var position = intersection[0].point; // object with x, y and z coords
            var x = 0;
            var y = 0;
            var z = 0;
            const inc = 2.5;
            switch (materialIndex) {
                case 0: // right
                    x = position.x + inc;
                    y = Math.round(position.y / 5) * 5;
                    z = Math.round(position.z / 5) * 5;
                    break;
                case 1: // left
                    x = position.x - inc;
                    y = Math.round(position.y / 5) * 5;
                    z = Math.round(position.z / 5) * 5;
                    break;
                case 2: // top
                    x = Math.round(position.x / 5) * 5;
                    y = position.y + inc;
                    z = Math.round(position.z / 5) * 5;
                    break;
                case 3: // bottom
                    x = Math.round(position.x / 5) * 5;
                    y = position.y - inc;
                    z = Math.round(position.z / 5) * 5;
                    break;
                case 4: // front
                    x = Math.round(position.x / 5) * 5;
                    y = Math.round(position.y / 5) * 5;
                    z = position.z + inc;
                    break;
                case 5: // back
                    x = Math.round(position.x / 5) * 5;
                    y = Math.round(position.y / 5) * 5;
                    z = position.z - inc;
                    break;
            }
            y = Math.round(y); // sometimes, y is for some reason e.g 4.999999999999
            if (y > minWorldY) {
                var blockToBePlaced = make_type;
                var b = new Block(x, y, z, true, blockToBePlaced);
                if (!intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d)) {
                    chunks[identifyChunk(x, z)].push(b);
                    placedBlocks.push(b);

                    var index = blockTypes.indexOf(blockToBePlaced);
                    scene.remove(blocks[index].mesh);
                    blocks[index].mesh = new THREE.InstancedMesh(blockBox, blocks[index].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
                    blocks[index].count = 0;

                    for (var i = 0; i < chunks.length; i++) {
                        for (var j = 0; j < chunks[i].length; j++) {
                            let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                            if (chunks[i][j].blockType == blockToBePlaced) {
                                blocks[index].mesh.setMatrixAt(blocks[index].count, matrix);
                                blocks[index].count++;
                            }
                        }
                    }
                    scene.add(blocks[index].mesh);
                }
            }
        }
    }
    if (e.key == controlOptions.placeBlock) {
        if (controls.isLocked) {
            // Shooting a ray
            const raycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();
            pointer.x = 0.5 * 2 - 1;
            pointer.y = -1 * 0.5 * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            var intersection;
            var next = false;
            var distance = Infinity;
            for (var i = 0; i < blocks.length; i++) {
                var int = raycaster.intersectObject(blocks[i].mesh);
                if (int[0] != undefined && int[0].distance < 40 && int[0].distance < distance) {
                    next = true;
                    intersection = int;
                    distance = int[0].distance;
                }
            }
            if (intersection[0] != undefined && intersection[0].distance < 40) {
                // finding x, y, z positions of that
                console.log(intersection[0].point);
                var materialIndex = intersection[0].face.materialIndex;
                var position = intersection[0].point; // object with x, y and z coords
                var x = 0;
                var y = 0;
                var z = 0;
                const inc = 2.5;
                switch (
                    materialIndex // finding x, y, z positions of block
                ) {
                    case 0: // right
                        x = position.x - inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 1: // left
                        x = position.x + inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 2: // top
                        x = Math.round(position.x / 5) * 5;
                        y = position.y - inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 3: // bottom
                        x = Math.round(position.x / 5) * 5;
                        y = position.y + inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 4: // front
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z - inc;
                        break;
                    case 5: // back
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z + inc;
                        break;
                }
                // Find block with those x, y, z positions
                // More efficient by finding it inside it's chunk
                var index1 = identifyChunk(x, z);
                var chunk = chunks[index1];
                y = Math.round(y); // sometimes, y is for some reason e.g 4.999999999999
                var blockToBeDestroyed = null; // BLOCK WHICH WILL NOW BE DESTROYED!
                for (var i = 0; i < chunk.length; i++) {
                    if (chunk[i].x == x && chunk[i].y == y && chunk[i].z == z) {
                        // Found the block!
                        if (chunk[i].placed) {
                            // find the placedBlock and remove it
                            for (var j = 0; j < placedBlocks.length; j++) {
                                if (placedBlocks[j].x == x && placedBlocks[j].y == y && placedBlocks[j].z == z) {
                                    placedBlocks.splice(j, 1);
                                    break;
                                }
                            }
                        } else {
                            // if it is a normal block
                            brokenBlocks.push(new Block(x, y, z, false, chunk[i].blockType));
                        }
                        blockToBeDestroyed = chunk[i].blockType;
                        chunks[index1].splice(i, 1); // block is removed from chunks variable
                        break;
                    }
                }
                // update chunks, array.splice(index, 1);
                var index = blockTypes.indexOf(blockToBeDestroyed);
                scene.remove(blocks[index].mesh);
                blocks[index].mesh = new THREE.InstancedMesh(blockBox, blocks[index].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
                blocks[index].count = 0;

                for (var i = 0; i < chunks.length; i++) {
                    for (var j = 0; j < chunks[i].length; j++) {
                        let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                        if (chunks[i][j].blockType == blockToBeDestroyed) {
                            blocks[index].mesh.setMatrixAt(blocks[index].count, matrix);
                            blocks[index].count++;
                        }
                    }
                }
                scene.add(blocks[index].mesh);
            }
        }
    }
});
document.addEventListener("keyup", function (e) {
    var newArr = [];
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] != e.key) {
            newArr.push(keys[i]);
        }
    }
    keys = newArr;
    if (!keys.includes("w")) {
        sprint = false;
    }
});

var controls = new THREE.PointerLockControls(camera, document.body);
var brokenBlocks = [];
document.body.addEventListener("click", function (evt) {
    controls.lock();
    if (evt.button == 2) {
        if (controls.isLocked) {
            // Shooting a ray
            const raycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();
            pointer.x = 0.5 * 2 - 1;
            pointer.y = -1 * 0.5 * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            var intersection;
            var next = false;
            var distance = Infinity;
            for (var i = 0; i < blocks.length; i++) {
                var int = raycaster.intersectObject(blocks[i].mesh);
                if (int[0] != undefined && int[0].distance < 40 && int[0].distance < distance) {
                    next = true;
                    intersection = int;
                    distance = int[0].distance;
                }
            }
            if (intersection[0] != undefined && intersection[0].distance < 40) {
                // finding x, y, z positions of that
                console.log(intersection[0].point);
                var materialIndex = intersection[0].face.materialIndex;
                var position = intersection[0].point; // object with x, y and z coords
                var x = 0;
                var y = 0;
                var z = 0;
                const inc = 2.5;
                switch (
                    materialIndex // finding x, y, z positions of block
                ) {
                    case 0: // right
                        x = position.x - inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 1: // left
                        x = position.x + inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 2: // top
                        x = Math.round(position.x / 5) * 5;
                        y = position.y - inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 3: // bottom
                        x = Math.round(position.x / 5) * 5;
                        y = position.y + inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 4: // front
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z - inc;
                        break;
                    case 5: // back
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z + inc;
                        break;
                }
                // Find block with those x, y, z positions
                // More efficient by finding it inside it's chunk
                var index1 = identifyChunk(x, z);
                var chunk = chunks[index1];
                y = Math.round(y); // sometimes, y is for some reason e.g 4.999999999999
                var blockToBeDestroyed = null; // BLOCK WHICH WILL NOW BE DESTROYED!
                for (var i = 0; i < chunk.length; i++) {
                    if (chunk[i].x == x && chunk[i].y == y && chunk[i].z == z) {
                        // Found the block!
                        if (chunk[i].placed) {
                            // find the placedBlock and remove it
                            for (var j = 0; j < placedBlocks.length; j++) {
                                if (placedBlocks[j].x == x && placedBlocks[j].y == y && placedBlocks[j].z == z) {
                                    placedBlocks.splice(j, 1);
                                    break;
                                }
                            }
                        } else {
                            // if it is a normal block
                            brokenBlocks.push(new Block(x, y, z, false, chunk[i].blockType));
                        }
                        blockToBeDestroyed = chunk[i].blockType;
                        chunks[index1].splice(i, 1); // block is removed from chunks variable
                        break;
                    }
                }
                // update chunks, array.splice(index, 1);
                var index = blockTypes.indexOf(blockToBeDestroyed);
                scene.remove(blocks[index].mesh);
                blocks[index].mesh = new THREE.InstancedMesh(blockBox, blocks[index].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
                blocks[index].count = 0;

                for (var i = 0; i < chunks.length; i++) {
                    for (var j = 0; j < chunks[i].length; j++) {
                        let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                        if (chunks[i][j].blockType == blockToBeDestroyed) {
                            blocks[index].mesh.setMatrixAt(blocks[index].count, matrix);
                            blocks[index].count++;
                        }
                    }
                }
                scene.add(blocks[index].mesh);
            }
        }
    }else{
        if (!evt.shiftKey && !evt.ctrlKey) {
            const raycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();
            pointer.x = 0.5 * 2 - 1;
            pointer.y = -1 * 0.5 * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            var intersection;
            var next = false;
            var distance = Infinity;
            for (var i = 0; i < blocks.length; i++) {
                var int = raycaster.intersectObject(blocks[i].mesh);
                if (int[0] != undefined && int[0].distance < 40 && int[0].distance < distance) {
                    next = true;
                    intersection = int;
                    distance = int[0].distance;
                }
            }
            if (next) {
                console.log(intersection[0]);
                var materialIndex = intersection[0].face.materialIndex;
                var position = intersection[0].point; // object with x, y and z coords
                var x = 0;
                var y = 0;
                var z = 0;
                const inc = 2.5;
                switch (materialIndex) {
                    case 0: // right
                        x = position.x + inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 1: // left
                        x = position.x - inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 2: // top
                        x = Math.round(position.x / 5) * 5;
                        y = position.y + inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 3: // bottom
                        x = Math.round(position.x / 5) * 5;
                        y = position.y - inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 4: // front
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z + inc;
                        break;
                    case 5: // back
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z - inc;
                        break;
                }
                y = Math.round(y); // sometimes, y is for some reason e.g 4.999999999999
                if (y > minWorldY) {
                    var blockToBePlaced = make_type;
                    var b = new Block(x, y, z, true, blockToBePlaced);
                    if (!intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d)) {
                        chunks[identifyChunk(x, z)].push(b);
                        placedBlocks.push(b);

                        var index = blockTypes.indexOf(blockToBePlaced);
                        scene.remove(blocks[index].mesh);
                        blocks[index].mesh = new THREE.InstancedMesh(blockBox, blocks[index].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
                        blocks[index].count = 0;

                        for (var i = 0; i < chunks.length; i++) {
                            for (var j = 0; j < chunks[i].length; j++) {
                                let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                                if (chunks[i][j].blockType == blockToBePlaced) {
                                    blocks[index].mesh.setMatrixAt(blocks[index].count, matrix);
                                    blocks[index].count++;
                                }
                            }
                        }
                        scene.add(blocks[index].mesh);
                    }
                }
            }
        } else {
            if (controls.isLocked) {
                // Shooting a ray
                const raycaster = new THREE.Raycaster();
                const pointer = new THREE.Vector2();
                pointer.x = 0.5 * 2 - 1;
                pointer.y = -1 * 0.5 * 2 + 1;
                raycaster.setFromCamera(pointer, camera);
                var intersection;
                var next = false;
                var distance = Infinity;
                for (var i = 0; i < blocks.length; i++) {
                    var int = raycaster.intersectObject(blocks[i].mesh);
                    if (int[0] != undefined && int[0].distance < 40 && int[0].distance < distance) {
                        next = true;
                        intersection = int;
                        distance = int[0].distance;
                    }
                }
                if (intersection[0] != undefined && intersection[0].distance < 40) {
                    // finding x, y, z positions of that
                    console.log(intersection[0].point);
                    var materialIndex = intersection[0].face.materialIndex;
                    var position = intersection[0].point; // object with x, y and z coords
                    var x = 0;
                    var y = 0;
                    var z = 0;
                    const inc = 2.5;
                    switch (
                        materialIndex // finding x, y, z positions of block
                    ) {
                        case 0: // right
                            x = position.x - inc;
                            y = Math.round(position.y / 5) * 5;
                            z = Math.round(position.z / 5) * 5;
                            break;
                        case 1: // left
                            x = position.x + inc;
                            y = Math.round(position.y / 5) * 5;
                            z = Math.round(position.z / 5) * 5;
                            break;
                        case 2: // top
                            x = Math.round(position.x / 5) * 5;
                            y = position.y - inc;
                            z = Math.round(position.z / 5) * 5;
                            break;
                        case 3: // bottom
                            x = Math.round(position.x / 5) * 5;
                            y = position.y + inc;
                            z = Math.round(position.z / 5) * 5;
                            break;
                        case 4: // front
                            x = Math.round(position.x / 5) * 5;
                            y = Math.round(position.y / 5) * 5;
                            z = position.z - inc;
                            break;
                        case 5: // back
                            x = Math.round(position.x / 5) * 5;
                            y = Math.round(position.y / 5) * 5;
                            z = position.z + inc;
                            break;
                    }
                    // Find block with those x, y, z positions
                    // More efficient by finding it inside it's chunk
                    var index1 = identifyChunk(x, z);
                    var chunk = chunks[index1];
                    y = Math.round(y); // sometimes, y is for some reason e.g 4.999999999999
                    var blockToBeDestroyed = null; // BLOCK WHICH WILL NOW BE DESTROYED!
                    for (var i = 0; i < chunk.length; i++) {
                        if (chunk[i].x == x && chunk[i].y == y && chunk[i].z == z) {
                            // Found the block!
                            if (chunk[i].placed) {
                                // find the placedBlock and remove it
                                for (var j = 0; j < placedBlocks.length; j++) {
                                    if (placedBlocks[j].x == x && placedBlocks[j].y == y && placedBlocks[j].z == z) {
                                        placedBlocks.splice(j, 1);
                                        break;
                                    }
                                }
                            } else {
                                // if it is a normal block
                                brokenBlocks.push(new Block(x, y, z, false, chunk[i].blockType));
                            }
                            blockToBeDestroyed = chunk[i].blockType;
                            chunks[index1].splice(i, 1); // block is removed from chunks variable
                            break;
                        }
                    }
                    // update chunks, array.splice(index, 1);
                    var index = blockTypes.indexOf(blockToBeDestroyed);
                    scene.remove(blocks[index].mesh);
                    blocks[index].mesh = new THREE.InstancedMesh(blockBox, blocks[index].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
                    blocks[index].count = 0;

                    for (var i = 0; i < chunks.length; i++) {
                        for (var j = 0; j < chunks[i].length; j++) {
                            let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                            if (chunks[i][j].blockType == blockToBeDestroyed) {
                                blocks[index].mesh.setMatrixAt(blocks[index].count, matrix);
                                blocks[index].count++;
                            }
                        }
                    }
                    scene.add(blocks[index].mesh);
                }
            }
        }
    }
});
controls.addEventListener("lock", function () {});
controls.addEventListener("unlock", function () {
    keys = [];
});

var movingSpeed = 0.5;
var ySpeed = 0;
var acc = 0.065;

var player = {
    w: 0.6, // width
    h: 8, // height
    d: 0.5, // depth
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    forward: function (speed) {
        controls.moveForward(speed);
        this.updatePosition();
    },
    backward: function (speed) {
        controls.moveForward(-1 * speed);
        this.updatePosition();
    },
    right: function (speed) {
        controls.moveRight(speed);
        this.updatePosition();
    },
    left: function (speed) {
        controls.moveRight(-1 * speed);
        this.updatePosition();
    },
    updatePosition: function () {
        this.x = camera.position.x;
        this.y = camera.position.y - this.h / 2;
        this.z = camera.position.z;
    },
};

function intersect(x1, y1, z1, w1, h1, d1, x2, y2, z2, w2, h2, d2) {
    var a = {
        minX: x1 - w1 / 2,
        maxX: x1 + w1 / 2,
        minZ: z1 - d1 / 2,
        maxZ: z1 + d1 / 2,
        minY: y1 - h1 / 2,
        maxY: y1 + h1 / 2,
    };
    var b = {
        minX: x2 - w2 / 2,
        maxX: x2 + w2 / 2,
        minZ: z2 - d2 / 2,
        maxZ: z2 + d2 / 2,
        minY: y2 - h2 / 2,
        maxY: y2 + h2 / 2,
    };
    return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY && a.minZ <= b.maxZ && a.maxZ >= b.minZ;
}

var deceleration = 1.35;
var forback = 0; // 1 = forward, -1 = backward
var rightleft = 0; // 1 = right, -1 = left
var sprintSpeedInc = 1.6; // 30% faster than walking
function update() {
    player.updatePosition();

    if (keys.includes(controlOptions.forward)) {
        player.forward(movingSpeed * (sprint ? sprintSpeedInc : 1));
        forback = 1 * movingSpeed;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    player.backward(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = true;
                }
            }
        }
    }
    if (keys.includes(controlOptions.up)) {
        player.forward(movingSpeed * (sprint ? sprintSpeedInc : 1));
        forback = 1 * movingSpeed;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    player.backward(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = true;
                }
            }
        }
    }
    if (keys.includes(controlOptions.backward)) {
        player.backward(movingSpeed * (sprint ? sprintSpeedInc : 1));
        forback = -1 * movingSpeed;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    player.forward(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    if (keys.includes(controlOptions.down)) {
        player.backward(movingSpeed * (sprint ? sprintSpeedInc : 1));
        forback = -1 * movingSpeed;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    player.forward(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    if (keys.includes(controlOptions.right)) {
        player.right(movingSpeed * (sprint ? sprintSpeedInc : 1));
        rightleft = 1 * movingSpeed;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    player.left(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    if (keys.includes(controlOptions.rarrow)) {
        player.right(movingSpeed * (sprint ? sprintSpeedInc : 1));
        rightleft = 1 * movingSpeed;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    player.left(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    if (keys.includes(controlOptions.left)) {
        player.left(movingSpeed * (sprint ? sprintSpeedInc : 1));
        rightleft = -1 * movingSpeed;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    player.right(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    if (keys.includes(controlOptions.larrow)) {
        player.left(movingSpeed * (sprint ? sprintSpeedInc : 1));
        rightleft = -1 * movingSpeed;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    player.right(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    // Decceleration part
    if (
        !keys.includes(controlOptions.forward) &&
        !keys.includes(controlOptions.backward) &&
        !keys.includes(controlOptions.right) &&
        !keys.includes(controlOptions.left) &&
        !keys.includes(controlOptions.up) &&
        !keys.includes(controlOptions.down) &&
        !keys.includes(controlOptions.rarrow) &&
        !keys.includes(controlOptions.larrow)
    ) {
        forback /= deceleration;
        rightleft /= deceleration;
        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                var b = chunks[i][j];
                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
                if (c && b.y - 2.5 < player.y + player.h / 2 && b.y + 2.5 > player.y - player.h / 2) {
                    var br = true;
                    forback /= -deceleration;
                    rightleft /= -deceleration;
                    sprint = false;
                    break;
                }
            }
            if (br) {
                break;
            }
        }
        player.forward(forback * (sprint ? sprintSpeedInc : 1));
        player.right(rightleft * (sprint ? sprintSpeedInc : 1));
    }

    camera.position.y = camera.position.y - ySpeed;
    ySpeed = ySpeed + acc;

    // Not falling through a block or above a block (above collision)
    for (var i = 0; i < chunks.length; i++) {
        for (var j = 0; j < chunks[i].length; j++) {
            var b = chunks[i][j];
            var c = intersect(b.x, b.y + 10, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d);
            if (c && camera.position.y <= chunks[i][j].y + 2.5 + player.h && camera.position.y >= chunks[i][j].y) {
                camera.position.y = chunks[i][j].y + 2.5 + player.h;
                ySpeed = 0;
                canJump = true;
            }
            var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h, player.d); // this one doesn't have a + 10 in the b.y
            if (c && camera.position.y >= chunks[i][j].y - 2.5 && camera.position.y <= chunks[i][j].y) {
                ySpeed = 0.5;
            }
        }
    }

    // INFINITE TERRAIN GENERATION PART!
    var worldSize = chunkSize * renderDistance * 5;
    var ratio = 0.4;
    if (camera.position.z < lowestZBlock() + worldSize * ratio) {
        // 20 is 4 blocks
        /*

    [0], [3], [6],
    [1], [x], [7],
    [2], [5], [8],
*/

        var newChunks = [];
        for (var i = 0; i < chunks.length; i++) {
            if ((i + 1) % renderDistance != 0) {
                newChunks.push(chunks[i]);
            }
        }

        // add blocks
        var lowestX = lowestXBlock();
        var lowestZ = lowestZBlock();

        for (var i = 0; i < renderDistance; i++) {
            var chunk = [];
            for (var x = lowestX + i * chunkSize * 5; x < lowestX + i * chunkSize * 5 + chunkSize * 5; x = x + 5) {
                for (var z = lowestZ - chunkSize * 5; z < lowestZ; z = z + 5) {
                    xoff = (inc * x) / 5;
                    zoff = (inc * z) / 5;
                    var v = Math.round((noise.perlin2(xoff, zoff) * amplitude) / 5) * 5;
                    for (var e = 0; e < depth; e++) {
                        if (v - e * 5 < minWorldY) {
                            continue;
                        }
                        // Try to find a broken block in that position
                        var blockIsDestroyed = false;
                        for (var d = 0; d < brokenBlocks.length; d++) {
                            if (brokenBlocks[d].x == x && brokenBlocks[d].y == v - e * 5 && brokenBlocks[d].z == z) {
                                blockIsDestroyed = true;
                                break;
                            }
                        }
                        if (!blockIsDestroyed) {
                            for (var t = 0; t < blocks.length; t++) {
                                if (blocks[t].range.includes(e)) {
                                    chunk.push(new Block(x, v - e * 5, z, false, blocks[t].name));
                                    break;
                                }
                            }
                        }
                    }
                    // Check if there is also placed blocks there
                    for (var b = 0; b < placedBlocks.length; b++) {
                        if (placedBlocks[b].x == x && placedBlocks[b].z == z) {
                            chunk.push(new Block(placedBlocks[b].x, placedBlocks[b].y, placedBlocks[b].z, true, placedBlocks[b].blockType));
                        }
                    }
                }
            }
            newChunks.splice(i * renderDistance, 0, chunk);
        }

        chunks = newChunks;

        for (var i = 0; i < blocks.length; i++) {
            scene.remove(blocks[i].mesh);
            blocks[i].mesh = new THREE.InstancedMesh(blockBox, blocks[i].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
            blocks[i].count = 0;
        }

        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                for (var t = 0; t < blocks.length; t++) {
                    if (blocks[t].name == chunks[i][j].blockType) {
                        blocks[t].mesh.setMatrixAt(blocks[t].count, matrix);
                        blocks[t].count++;
                        break;
                    }
                }
            }
        }

        for (var i = 0; i < blocks.length; i++) {
            scene.add(blocks[i].mesh);
        }
    }

    if (camera.position.z > highestZBlock() - worldSize * ratio) {
        // 20 is 4 blocks
        /*

    [0], [3], [6],
    [1], [x], [7],
    [2], [5], [8],
*/

        var newChunks = [];
        for (var i = 0; i < chunks.length; i++) {
            if (i % renderDistance != 0) {
                newChunks.push(chunks[i]);
            }
        }

        // add blocks
        var lowestX = lowestXBlock();
        var highestZ = highestZBlock();
        for (var i = 0; i < renderDistance; i++) {
            var chunk = [];
            for (var x = lowestX + i * chunkSize * 5; x < lowestX + i * chunkSize * 5 + chunkSize * 5; x = x + 5) {
                for (var z = highestZ + 5; z < highestZ + 5 + chunkSize * 5; z = z + 5) {
                    xoff = (inc * x) / 5;
                    zoff = (inc * z) / 5;
                    var v = Math.round((noise.perlin2(xoff, zoff) * amplitude) / 5) * 5;
                    for (var e = 0; e < depth; e++) {
                        if (v - e * 5 < minWorldY) {
                            continue;
                        }
                        // Try to find a broken block in that position
                        var blockIsDestroyed = false;
                        for (var d = 0; d < brokenBlocks.length; d++) {
                            if (brokenBlocks[d].x == x && brokenBlocks[d].y == v - e * 5 && brokenBlocks[d].z == z) {
                                blockIsDestroyed = true;
                                break;
                            }
                        }
                        if (!blockIsDestroyed) {
                            for (var t = 0; t < blocks.length; t++) {
                                if (blocks[t].range.includes(e)) {
                                    chunk.push(new Block(x, v - e * 5, z, false, blocks[t].name));
                                    break;
                                }
                            }
                        }
                    }
                    // Check if there is also placed blocks there
                    for (var b = 0; b < placedBlocks.length; b++) {
                        if (placedBlocks[b].x == x && placedBlocks[b].z == z) {
                            chunk.push(new Block(placedBlocks[b].x, placedBlocks[b].y, placedBlocks[b].z, true, placedBlocks[b].blockType));
                        }
                    }
                }
            }
            newChunks.splice((i + 1) * renderDistance - 1, 0, chunk);
        }

        chunks = newChunks;

        for (var i = 0; i < blocks.length; i++) {
            scene.remove(blocks[i].mesh);
            blocks[i].mesh = new THREE.InstancedMesh(blockBox, blocks[i].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
            blocks[i].count = 0;
        }

        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                for (var t = 0; t < blocks.length; t++) {
                    if (blocks[t].name == chunks[i][j].blockType) {
                        blocks[t].mesh.setMatrixAt(blocks[t].count, matrix);
                        blocks[t].count++;
                        break;
                    }
                }
            }
        }

        for (var i = 0; i < blocks.length; i++) {
            scene.add(blocks[i].mesh);
        }
    }

    if (camera.position.x > highestXBlock() - worldSize * ratio) {
        // 20 is 4 blocks
        /*

    [0], [3], [6],
    [1], [x], [7],
    [2], [5], [8],
*/

        var newChunks = [];
        for (var i = renderDistance; i < chunks.length; i++) {
            newChunks.push(chunks[i]);
        }

        // add blocks
        var highestX = highestXBlock();
        var lowestZ = lowestZBlock();

        for (var i = 0; i < renderDistance; i++) {
            var chunk = [];
            for (var z = lowestZ + i * chunkSize * 5; z < lowestZ + i * chunkSize * 5 + chunkSize * 5; z = z + 5) {
                for (var x = highestX + 5; x < highestX + 5 + chunkSize * 5; x = x + 5) {
                    xoff = (inc * x) / 5;
                    zoff = (inc * z) / 5;
                    var v = Math.round((noise.perlin2(xoff, zoff) * amplitude) / 5) * 5;
                    for (var e = 0; e < depth; e++) {
                        if (v - e * 5 < minWorldY) {
                            continue;
                        }
                        // Try to find a broken block in that position
                        var blockIsDestroyed = false;
                        for (var d = 0; d < brokenBlocks.length; d++) {
                            if (brokenBlocks[d].x == x && brokenBlocks[d].y == v - e * 5 && brokenBlocks[d].z == z) {
                                blockIsDestroyed = true;
                                break;
                            }
                        }
                        if (!blockIsDestroyed) {
                            for (var t = 0; t < blocks.length; t++) {
                                if (blocks[t].range.includes(e)) {
                                    chunk.push(new Block(x, v - e * 5, z, false, blocks[t].name));
                                    break;
                                }
                            }
                        }
                    }
                    // Check if there is also placed blocks there
                    for (var b = 0; b < placedBlocks.length; b++) {
                        if (placedBlocks[b].x == x && placedBlocks[b].z == z) {
                            chunk.push(new Block(placedBlocks[b].x, placedBlocks[b].y, placedBlocks[b].z, true, placedBlocks[b].blockType));
                        }
                    }
                }
            }
            newChunks.splice(chunks.length - (renderDistance - i), 0, chunk);
        }

        chunks = newChunks;

        for (var i = 0; i < blocks.length; i++) {
            scene.remove(blocks[i].mesh);
            blocks[i].mesh = new THREE.InstancedMesh(blockBox, blocks[i].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
            blocks[i].count = 0;
        }

        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                for (var t = 0; t < blocks.length; t++) {
                    if (blocks[t].name == chunks[i][j].blockType) {
                        blocks[t].mesh.setMatrixAt(blocks[t].count, matrix);
                        blocks[t].count++;
                        break;
                    }
                }
            }
        }

        for (var i = 0; i < blocks.length; i++) {
            scene.add(blocks[i].mesh);
        }
    }

    if (camera.position.x < lowestXBlock() + worldSize * ratio) {
        // 20 is 4 blocks
        /*

    [0], [3], [6],
    [1], [x], [7],
    [2], [5], [8],
*/

        var newChunks = [];
        for (var i = 0; i < chunks.length - renderDistance; i++) {
            newChunks.push(chunks[i]);
        }

        // add blocks
        var lowestX = lowestXBlock();
        var lowestZ = lowestZBlock();
        for (var i = 0; i < renderDistance; i++) {
            var chunk = [];
            for (var z = lowestZ + i * chunkSize * 5; z < lowestZ + i * chunkSize * 5 + chunkSize * 5; z = z + 5) {
                for (var x = lowestX - chunkSize * 5; x < lowestX; x = x + 5) {
                    xoff = (inc * x) / 5;
                    zoff = (inc * z) / 5;
                    var v = Math.round((noise.perlin2(xoff, zoff) * amplitude) / 5) * 5;
                    for (var e = 0; e < depth; e++) {
                        if (v - e * 5 < minWorldY) {
                            continue;
                        }
                        // Try to find a broken block in that position
                        var blockIsDestroyed = false;
                        for (var d = 0; d < brokenBlocks.length; d++) {
                            if (brokenBlocks[d].x == x && brokenBlocks[d].y == v - e * 5 && brokenBlocks[d].z == z) {
                                blockIsDestroyed = true;
                                break;
                            }
                        }
                        if (!blockIsDestroyed) {
                            for (var t = 0; t < blocks.length; t++) {
                                if (blocks[t].range.includes(e)) {
                                    chunk.push(new Block(x, v - e * 5, z, false, blocks[t].name));
                                    break;
                                }
                            }
                        }
                    }
                    // Check if there is also placed blocks there
                    for (var b = 0; b < placedBlocks.length; b++) {
                        if (placedBlocks[b].x == x && placedBlocks[b].z == z) {
                            chunk.push(new Block(placedBlocks[b].x, placedBlocks[b].y, placedBlocks[b].z, true, placedBlocks[b].blockType));
                        }
                    }
                }
            }
            newChunks.splice(i, 0, chunk);
        }

        chunks = newChunks;

        for (var i = 0; i < blocks.length; i++) {
            scene.remove(blocks[i].mesh);
            blocks[i].mesh = new THREE.InstancedMesh(blockBox, blocks[i].materialArray, renderDistance * renderDistance * chunkSize * chunkSize * depth + placedBlocks.length);
            blocks[i].count = 0;
        }

        for (var i = 0; i < chunks.length; i++) {
            for (var j = 0; j < chunks[i].length; j++) {
                let matrix = new THREE.Matrix4().makeTranslation(chunks[i][j].x, chunks[i][j].y, chunks[i][j].z);
                for (var t = 0; t < blocks.length; t++) {
                    if (blocks[t].name == chunks[i][j].blockType) {
                        blocks[t].mesh.setMatrixAt(blocks[t].count, matrix);
                        blocks[t].count++;
                        break;
                    }
                }
            }
        }

        for (var i = 0; i < blocks.length; i++) {
            scene.add(blocks[i].mesh);
        }
    }
}

function lowestXBlock() {
    var xPosArray = [];
    for (var i = 0; i < chunks.length; i++) {
        for (var j = 0; j < chunks[i].length; j++) {
            xPosArray.push(chunks[i][j].x);
        }
    }
    return Math.min.apply(null, xPosArray);
}

function highestXBlock() {
    var xPosArray = [];
    for (var i = 0; i < chunks.length; i++) {
        for (var j = 0; j < chunks[i].length; j++) {
            xPosArray.push(chunks[i][j].x);
        }
    }
    return Math.max.apply(null, xPosArray);
}

function lowestZBlock() {
    var zPosArray = [];
    for (var i = 0; i < chunks.length; i++) {
        for (var j = 0; j < chunks[i].length; j++) {
            zPosArray.push(chunks[i][j].z);
        }
    }
    return Math.min.apply(null, zPosArray);
}

function highestZBlock() {
    var zPosArray = [];
    for (var i = 0; i < chunks.length; i++) {
        for (var j = 0; j < chunks[i].length; j++) {
            zPosArray.push(chunks[i][j].z);
        }
    }
    return Math.max.apply(null, zPosArray);
}

// Resize Window
window.addEventListener("resize", function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    cursor.style.left = (0.5 * window.innerWidth - 0.5 * cursor.width).toString() + "px";
    cursor.style.top = (0.5 * window.innerHeight - 0.5 * cursor.height).toString() + "px";
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
pointer.x = 0.5 * 2 - 1;
pointer.y = -1 * 0.5 * 2 + 1;

var plane;
function render() {
    raycaster.setFromCamera(pointer, camera);
    var intersection;
    var next = false;
    var distance = Infinity;
    for (var i = 0; i < blocks.length; i++) {
        var int = raycaster.intersectObject(blocks[i].mesh);
        if (int[0] != undefined && int[0].distance < 40 && int[0].distance < distance) {
            next = true;
            intersection = int;
            distance = int[0].distance;
        }
    }
    if (next) {
        //console.log(intersection[0]);
        if (!scene.children.includes(plane)) {
            var planeG = new THREE.PlaneGeometry(5, 5);
            var planeM = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
            planeM.transparent = true;
            planeM.opacity = 0.5;
            plane = new THREE.Mesh(planeG, planeM);
            scene.add(plane);
        } else {
            plane.visible = true;
            var materialIndex = intersection[0].face.materialIndex;
            var position = intersection[0].point; // object with x, y and z coords
            var x = 0;
            var y = 0;
            var z = 0;
            const inc = 0.1;
            switch (materialIndex) {
                case 0: // right
                    plane.rotation.x = 0;
                    plane.rotation.y = Math.PI / 2;
                    plane.rotation.z = 0;
                    x = position.x + inc;
                    y = Math.round(position.y / 5) * 5;
                    z = Math.round(position.z / 5) * 5;
                    break;
                case 1: // left
                    plane.rotation.x = 0;
                    plane.rotation.y = Math.PI / 2;
                    plane.rotation.z = 0;
                    x = position.x - inc;
                    y = Math.round(position.y / 5) * 5;
                    z = Math.round(position.z / 5) * 5;
                    break;
                case 2: // top
                    plane.rotation.x = Math.PI / 2;
                    plane.rotation.y = 0;
                    plane.rotation.z = 0;
                    x = Math.round(position.x / 5) * 5;
                    y = position.y + inc;
                    z = Math.round(position.z / 5) * 5;
                    break;
                case 3: // bottom
                    plane.rotation.x = Math.PI / 2;
                    plane.rotation.y = 0;
                    plane.rotation.z = 0;
                    x = Math.round(position.x / 5) * 5;
                    y = position.y - inc;
                    z = Math.round(position.z / 5) * 5;
                    break;
                case 4: // front
                    plane.rotation.x = 0;
                    plane.rotation.y = 0;
                    plane.rotation.z = 0;
                    x = Math.round(position.x / 5) * 5;
                    y = Math.round(position.y / 5) * 5;
                    z = position.z + inc;
                    break;
                case 5: // back
                    plane.rotation.x = 0;
                    plane.rotation.y = 0;
                    plane.rotation.z = 0;
                    x = Math.round(position.x / 5) * 5;
                    y = Math.round(position.y / 5) * 5;
                    z = position.z - inc;
                    break;
            }
            plane.position.x = x;
            plane.position.y = y;
            plane.position.z = z;
        }
    } else {
        if (plane) {
            plane.visible = false;
        }
    }

    renderer.render(scene, camera);
}

function GameLoop() {
    requestAnimationFrame(GameLoop);
    update();
    render();
}

GameLoop();