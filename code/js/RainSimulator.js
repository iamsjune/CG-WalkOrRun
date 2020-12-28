window.onload = function () {

    var scene = new THREE.Scene();
    var camera;
    var clock1, clock2;
    var delta1, delta2;
    var globalLight, shadowLight;
    
    var objLoader;
    var mtlLoader;
    
    var PI = Math.PI;
    var man1, man2;

    var runningSpeed = 3;
    var rainDensity = 3;
    var rainDropSize = 3;

    var man1Stop = true;
    var man2Stop = true;

    var rainText;

    init();
    addLightSource();
    loadMTLLoader();

    // Button Click Event Listener
    document.getElementById("btnReset").onclick = function() {
        // Option Click Event Listener
        runningSpeed = document.getElementById("runSpeed");
        runningSpeed = runningSpeed.options[runningSpeed.selectedIndex].value;

        rainDensity = document.getElementById("rainDensity");
        rainDensity = rainDensity.options[rainDensity.selectedIndex].value;

        rainDropSize = document.getElementById("rainDropRadius");
        rainDropSize = rainDropSize.options[rainDropSize.selectedIndex].value;

        console.log(runningSpeed, rainDensity, rainDropSize);

        // Move Character
        man1Stop = !man1Stop;
        man2Stop = !man2Stop;

        // Clock start
        clock1 = new THREE.Clock();
        clock2 = new THREE.Clock();
        delta1 = clock1.getDelta();
        delta2 = clock2.getDelta();

        document.getElementById('rainText').value = '//맞은 비의 양//';
    }

    // *********************
    // Initialize Three js
    // *********************
    function init() {

        // Check WebGL
        if (WEBGL.isWebGLAvailable()) {
            console.log('이 브라우저는 WEBGL을 지원합니다.');
        } else {
            console.log('이 브라우저는 WEBGL을 지원하지 않습니다.');
        }

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        let renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        // Render Screen Size
        renderer.setSize(1500, 870);
        // Background Color in Scene
        renderer.setClearColor(0xffffff, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        var can = document.getElementById("canvas");
        can.append(renderer.domElement);

        // Rain Drop Texture
        // Rain Count
        var rainCount = 2000 * rainDensity;
        var rainGeo = new THREE.Geometry();
        for (let i = 0; i < rainCount; i++) {
            var rainDrop = new THREE.Vector3(
                // Rain Range
                Math.random() * 200 - 100,
                Math.random() * 250 - 125,
                Math.random() * 200 - 100
            )
            rainDrop.velocity = {};
            rainDrop.velocity = 0;
            rainGeo.vertices.push(rainDrop);
        }

        // Rain Texture
        raindrop = new THREE.TextureLoader().load("../../resources/raindrop2.png")

        // Set rain material
        var rainMaterial = new THREE.PointsMaterial({
            // Rain Color
            color: 0x00aaff,
            // Rain Mapping
            map: raindrop,
            // Raindrop Size
            size: 0.3 * rainDropSize,
            transparent: true
        })

        // Add Rain to Scene
        var rain = new THREE.Points(rainGeo, rainMaterial);
        scene.add(rain)

        // White Material
        var whiteMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            shading: THREE.SmoothShading,
            roughness: 1,
        });

        // Purple Material
        var purpleMat = new THREE.MeshPhongMaterial({
            color: 0xaa55ff,
            shading: THREE.FlatShading,
        });

        // Set Character
        Man = function() {
            this.runningCycle = 0;
            this.mesh = new THREE.Group();
            this.body = new THREE.Group();
            this.mesh.add(this.body);
            
            // body
            var torsoGeom = new THREE.CubeGeometry(1,2,1, 1);
            this.torso = new THREE.Mesh(torsoGeom, purpleMat);
            this.torso.position.y = 2;
            this.torso.castShadow = true;
            this.body.add(this.torso);
            
            // hand
            var handGeom = new THREE.CubeGeometry(3/8,3/8,3/8, 1);
            this.handR = new THREE.Mesh(handGeom, whiteMat);
            this.handR.position.z=1;
            this.handR.position.y=2;
            this.body.add(this.handR);
            
            this.handL = this.handR.clone();
            this.handL.position.z = - this.handR.position.z;
            this.body.add(this.handL);
            
            // head
            var headGeom = new THREE.CubeGeometry(2,2,2, 1);
            this.head = new THREE.Mesh(headGeom, purpleMat);
            this.head.position.y = 5;
            this.head.castShadow = true;
            this.body.add(this.head);
            
            // leg
            var legGeom = new THREE.CubeGeometry(1,3/8,5/8, 1);
            
            this.legR = new THREE.Mesh(legGeom, whiteMat);
            this.legR.position.x = 0;
            this.legR.position.z = 1;
            this.legR.position.y = 0;
            this.legR.castShadow = true;
            this.body.add(this.legR);
            
            this.legL = this.legR.clone();
            this.legL.position.z = -this.legR.position.z;
            this.legL.castShadow = true;
            this.body.add(this.legL);
          
            this.body.traverse(function(object) {
              if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
              }
            });
        }

        Man.prototype.run = function () {
            var s = .03;
            var t = this.runningCycle;

            t *= 4;
            t = t % (2 * PI);

            // Step Length
            var sl = 1;

            this.legR.rotation.z = 0;
            this.legR.position.y = 0;
            this.legR.position.x = 0;
            this.legL.rotation.z = 0;
            this.legL.position.y = 0;
            this.legL.position.x = 0;

            // Character Walking
            this.runningCycle += s;
            this.legR.position.x = Math.cos(t) * sl;
            this.legR.position.y = - Math.sin(t) * sl;

            this.legL.position.x = Math.cos(t + PI) * sl;
            this.legL.position.y = - Math.sin(t + PI) * sl;

            this.legL.position.y = Math.max(0, this.legL.position.y);
            this.legR.position.y = Math.max(0, this.legR.position.y);

            this.torso.position.y = 2 - Math.cos(t * 2) * sl * .2;
            this.head.position.y = 5 - Math.cos(t * 2) * sl * .3;

            this.torso.rotation.y = -Math.cos(t + PI) * sl * .05;

            this.handR.position.x = -Math.cos(t) * sl;
            this.handR.rotation.z = -Math.cos(t) * PI / 8;
            this.handL.position.x = -Math.cos(t + PI) * sl;
            this.handL.rotation.z = -Math.cos(t + PI) * PI / 8;

            this.head.rotation.x = Math.cos(t) * sl * .02;
            this.head.rotation.y = Math.cos(t) * sl * .01;

            if (t > PI) {
                this.legR.rotation.z = Math.cos(t * 2 + PI / 2) * PI / 4;
                this.legL.rotation.z = 0;
            } else {
                this.legR.rotation.z = 0;
                this.legL.rotation.z = Math.cos(t * 2 + PI / 2) * PI / 4;
            }
        }

        // Create Character
        function createMan1() {
            // Man 1
            man1 = new Man();
            man1.mesh.position.y = 0;
            man1.mesh.position.x = 7.5;
            man1.mesh.position.z = 15;
            scene.add(man1.mesh);
        }
        function createMan2() {
            // Man 2
            man2 = new Man();
            man2.mesh.position.y = 0;
            man2.mesh.position.x = -8.5;
            man2.mesh.position.z = 15;
            scene.add(man2.mesh);
        }

        let axes = new THREE.AxisHelper(10);
        scene.add(axes);

        // Camera Position
        camera.position.x = 1;
        camera.position.y = 3;
        camera.position.z = 3;

        // Camera and Mouse Setting
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 2;
        controls.panSpeed = 0.8;
        controls.minDistance = 3;
        controls.maxDistance = 10000;

        function animate() {
            // Repeat animating
            requestAnimationFrame(animate);

            renderer.render(scene, camera);
            controls.update();

            // RainDrop Animation
            rainGeo.vertices.forEach(p => {
                // RainDrop velocity
                p.velocity -= 0.1 * Math.random() * 1;
                p.y += p.velocity;
                if (p.y < -5) {
                    p.y = 70;
                    p.velocity = 0;
                }
            })
            rainGeo.verticesNeedUpdate = true;
            rain.rotation.y += 0.002;
            
            if (man1Stop) man1.runningCycle = 0;
            if (man2Stop) man1.runningCycle = 0;

            if (!man1Stop) {
                // Man1
                man1.run();
                // Man1 Forward Direction
                man1.mesh.rotation.y = Math.PI/2;
                // Man1 Go Ahead * how fast
                man1.mesh.position.z -= 0.1 * runningSpeed
                if (man1.mesh.position.z < -60) {
                    // delta1 = man1 moving time
                    delta1 = clock1.getDelta();
                    // Show rain hit
                    rainText = document.getElementById('rainText').value;
                    var rain_ca = ((delta1 / runningSpeed) * (rainDensity * rainDropSize / 10)) + 72;
                    rainText = rainText.concat('\nrun: ', Math.round(rain_ca));
                    document.getElementById('rainText').value = rainText;
                    // console.log('delta1: ', delta1);
                    scene.remove(man1.mesh);
                    createMan1();
                    man1Stop = !man1Stop;
                } 
            }
            if (!man2Stop) {
                // Man2
                man2.run();
                // Man2 Forward Direction
                man2.mesh.rotation.y = Math.PI / 2;
                // Man2 Go Ahead (Only Walking)
                man2.mesh.position.z -= 0.1
                if (man2.mesh.position.z < -60) {
                    // delta2 = man2.moving time
                    delta2 = clock2.getDelta();
                    // Show rain hit
                    rainText = document.getElementById('rainText').value;
                    var rain_cb = ((delta2 / 1) * (rainDensity * rainDropSize / 10)) + 72;
                    rainText = rainText.concat('\nwalk: ', Math.round(rain_cb));
                    document.getElementById('rainText').value = rainText;
                    // console.log('delta2: ', delta2);
                    scene.remove(man2.mesh);
                    createMan2();
                    man2Stop = !man2Stop;
                } 
            }
        }

        // Create Man and Setting
        createMan1();
        createMan2();
        // Animating Start
        animate();
    }

    // *********************
    // Add Light Source
    // *********************
    function addLightSource() {
        // Ambient Light
        globalLight = new THREE.AmbientLight(0xaaaaaa, 1);
        // Specular Light
        shadowLight = new THREE.DirectionalLight(0xaaaaaa, 1);
        shadowLight.position.set(10, 8, 8);
        shadowLight.castShadow = true;
        shadowLight.shadow.camera.left = -40;
        shadowLight.shadow.camera.right = 40;
        shadowLight.shadow.camera.top = 40;
        shadowLight.shadow.camera.bottom = -40;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 1000;
        shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;
        scene.add(globalLight);
        scene.add(shadowLight);
    }

    // *********************
    // Load OBJ Loader
    // *********************
    function loadOBJLoader(materials) {
        objLoader = new THREE.OBJLoader();

        // obj + mtl
        objLoader.setMaterials(materials);

        // Set Path
        objLoader.setPath('../../resources/');
        objLoader.load('rain.obj', function (object) {
            // Add Object to Scene (Road)
            object.position.x = -0.75;
            object.position.y = 0;
            object.position.z = 8;
            scene.add(object);
        }, function (xhr) {
            console.log('OBJLoader: ', xhr.loaded / xhr.total * 100, '% loaded');
        }, function (error) {
            alert('모델을 로드 중 오류가 발생하였습니다.');
        });
    }

    // *********************
    // Load MTL Loader
    // *********************
    function loadMTLLoader() {
        mtlLoader = new THREE.MTLLoader();

        // Set Path
        mtlLoader.setPath('../../resources/');
        mtlLoader.load('rain.mtl', function (materials) {
            // Completion
            materials.preload();
            // Call OBJ
            loadOBJLoader(materials);
        }, function (xhr) {
            console.log('MTLLoader: ', xhr.loaded / xhr.total * 100, '% loaded');
        }, function (error) {
            console.error('MTLLoader 로드 중 오류가 발생하였습니다.', error);
            alert('MTLLoader 로드 중 오류가 발생하였습니다.');
        });
    }
}