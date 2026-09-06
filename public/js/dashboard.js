function initDashboard() {

    /*
     * GLOBAL INITIALIZATION GUARD
     */
    if (window.__oceanDashboardInitialized) {
        console.warn(
            "Ocean dashboard is already initialized."
        );
        return;
    }

    window.__oceanDashboardInitialized = true;

    const loadingScreen =
        document.getElementById("loadingScreen");

    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add("hidden");
        }, 1200);
    }

    if (typeof THREE === "undefined") {
        console.error("Three.js is not loaded.");

        if (loadingScreen) {
            loadingScreen.classList.add("hidden");
        }

        return;
    }

    const canvas =
        document.getElementById("oceanCanvas");

    if (!canvas) {
        console.error("oceanCanvas not found.");

        if (loadingScreen) {
            loadingScreen.classList.add("hidden");
        }

        return;
    }

    const scene =
        new THREE.Scene();

    const camera =
        new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

    camera.position.set(
        0,
        0,
        7.4
    );

    let renderer;

    try {

        renderer =
            new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true
            });

    }
    catch (error) {

        console.error(
            "WebGL renderer could not be created:",
            error
        );

        if (loadingScreen) {
            loadingScreen.classList.add("hidden");
        }

        return;
    }

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

    if ("outputEncoding" in renderer) {
        renderer.outputEncoding =
            THREE.sRGBEncoding;
    }

    const clock =
        new THREE.Clock();

    const earthGroup =
        new THREE.Group();

    scene.add(
        earthGroup
    );

    const underwaterGroup =
        new THREE.Group();

    underwaterGroup.visible =
        false;

    scene.add(
        underwaterGroup
    );

    scene.add(
        new THREE.AmbientLight(
            0xffffff,
            0.55
        )
    );

    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            1.15
        );

    sun.position.set(
        5,
        3,
        6
    );

    scene.add(
        sun
    );

    const oceanLight =
        new THREE.PointLight(
            0x087cff,
            0.65,
            15
        );

    oceanLight.position.set(
        -4,
        2,
        4
    );

    scene.add(
        oceanLight
    );

    const loader =
        new THREE.TextureLoader();

    const earthTexture =
        loader.load(
            "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
        );

    const earthNormal =
        loader.load(
            "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg"
        );

    const earthSpecular =
        loader.load(
            "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"
        );

    const earth =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.5,
                128,
                128
            ),
            new THREE.MeshPhongMaterial({
                map: earthTexture,
                normalMap: earthNormal,
                normalScale:
                    new THREE.Vector2(
                        0.15,
                        0.15
                    ),
                specularMap:
                    earthSpecular,
                specular:
                    new THREE.Color(
                        0x12394d
                    ),
                shininess: 5
            })
        );

    earthGroup.add(
        earth
    );

    const cloudTexture =
        loader.load(
            "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
        );

    const clouds =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.535,
                128,
                128
            ),
            new THREE.MeshPhongMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.07,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );

    earthGroup.add(
        clouds
    );

    const atmosphere =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.58,
                96,
                96
            ),
            new THREE.MeshBasicMaterial({
                color: 0x159dff,
                transparent: true,
                opacity: 0.065,
                side: THREE.BackSide
            })
        );

    earthGroup.add(
        atmosphere
    );

    const greenAtmosphere =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.64,
                96,
                96
            ),
            new THREE.MeshBasicMaterial({
                color: 0x18dca0,
                transparent: true,
                opacity: 0.012,
                side: THREE.BackSide
            })
        );

    earthGroup.add(
        greenAtmosphere
    );

    const starPositions = [];

    for (let i = 0; i < 1700; i++) {

        const radius =
            14 +
            Math.random() * 28;

        const theta =
            Math.random() *
            Math.PI *
            2;

        const phi =
            Math.acos(
                2 *
                Math.random() -
                1
            );

        starPositions.push(
            radius *
            Math.sin(phi) *
            Math.cos(theta),

            radius *
            Math.cos(phi),

            radius *
            Math.sin(phi) *
            Math.sin(theta)
        );
    }

    const starGeometry =
        new THREE.BufferGeometry();

    starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            starPositions,
            3
        )
    );

    const stars =
        new THREE.Points(
            starGeometry,
            new THREE.PointsMaterial({
                color: 0x8adfff,
                size: 0.035,
                transparent: true,
                opacity: 0.75
            })
        );

    scene.add(
        stars
    );

    const marker =
        new THREE.Group();

    const markerRedMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff2020,
            depthTest: false,
            depthWrite: false
        });

    const markerDarkMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x850000,
            depthTest: false,
            depthWrite: false
        });

    const markerHead =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.13,
                28,
                28
            ),
            markerRedMaterial
        );

    markerHead.position.y =
        0.34;

    marker.add(
        markerHead
    );

    const markerTip =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.13,
                0.34,
                28
            ),
            markerRedMaterial
        );

    markerTip.rotation.x =
        Math.PI;

    markerTip.position.y =
        0.17;

    marker.add(
        markerTip
    );

    const markerCenter =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.045,
                18,
                18
            ),
            markerDarkMaterial
        );

    markerCenter.position.y =
        0.345;

    marker.add(
        markerCenter
    );

    const markerGlow =
        new THREE.Mesh(
            new THREE.RingGeometry(
                0.15,
                0.21,
                36
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff3030,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                depthTest: false,
                depthWrite: false
            })
        );

    markerGlow.rotation.x =
        Math.PI / 2;

    markerGlow.position.y =
        0;

    marker.add(
        markerGlow
    );

    marker.renderOrder =
        50;

    earthGroup.add(
        marker
    );

    /*
       STATE
   */

    let latitude = 12;
    let longitude = 70;



    let currentDepth = 0;
    let latestSelectedDepth = 0;

    /*
     * TRUE while user is actively controlling
     * the depth slider.
     */
    let depthSliderInteracting = false;

    let loadingData = false;

    /*
     * Every API request receives a unique ID.
     */
    let depthRequestId = 0;

    /*
     * Every dive receives a unique ID.
     */
    let diveRunId = 0;

    let underwaterMode = false;
    let diveInProgress = false;
    let diverGroup = null;

    let focusAnimationId = null;

    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let autoRotate = true;
    let targetCameraZ = 7.4;

    const diverStartY = 2.4;
    const diverTargetY = -2.6;

    /* DOM ELEMENTS*/

    const latitudeInput =
        document.getElementById(
            "latInput"
        );

    const longitudeInput =
        document.getElementById(
            "lonInput"
        );

    const locationName =
        document.getElementById(
            "locationName"
        );

    const displayLatitude =
        document.getElementById(
            "currentLat"
        );

    const displayLongitude =
        document.getElementById(
            "currentLon"
        );

    const temperatureValue =
        document.getElementById(
            "temperature"
        );

    const salinityValue =
        document.getElementById(
            "salinity"
        );

    const currentValue =
        document.getElementById(
            "currentSpeed"
        );

    const directionValue =
        document.getElementById(
            "currentDirection"
        );

    const currentDepthElement =
        document.getElementById(
            "currentDepth"
        );

    const depthValue =
        document.getElementById(
            "depthValue"
        );

    const waterType =
        document.getElementById(
            "waterType"
        );

    const explorationStatus =
        document.querySelector(
            ".exploration-status"
        );

    const dataConfidence =
        document.getElementById(
            "dataConfidence"
        );

    const locateButton =
        document.getElementById(
            "locateButton"
        );

    const depthSlider =
        document.getElementById(
            "depthSlider"
        );

    const diveButton =
        document.getElementById(
            "diveButton"
        );

    const resetButton =
        document.getElementById(
            "resetButton"
        );

    const zoomButton =
        document.getElementById(
            "zoomButton"
        );

    let depthInput =
        document.querySelector(
            "#depthInput, .depth-input, input[name='depth']"
        );

    /*DEPTH CONTROL*/

    function setupDepthControl() {

        if (!depthSlider) {
            return;
        }

        const parent =
            depthSlider.parentElement;

        if (!parent) {
            return;
        }

        if (!depthInput) {

            depthInput =
                document.createElement(
                    "input"
                );

            depthInput.id =
                "depthInput";

            depthInput.className =
                "depth-input";

            depthInput.type =
                "number";

            parent.appendChild(
                depthInput
            );
        }

        depthInput.type =
            "number";

        depthInput.min =
            "0";

        depthInput.max =
            "6000";

        depthInput.step =
            "1";

        depthInput.placeholder =
            "Depth";

        depthInput.style.width =
            "78px";

        depthInput.style.marginLeft =
            "10px";

        depthInput.style.verticalAlign =
            "middle";

        depthInput.style.boxSizing =
            "border-box";

        depthInput.style.padding =
            "5px 7px";

        depthInput.style.background =
            "rgba(255,255,255,.06)";

        depthInput.style.border =
            "1px solid rgba(60,200,255,.25)";

        depthInput.style.borderRadius =
            "5px";

        depthInput.style.color =
            "#eaf8ff";

        depthInput.style.outline =
            "none";

        depthInput.value =
            String(
                Math.round(
                    currentDepth
                )
            );
    }

    setupDepthControl();

    function syncDepthUI() {

        const value =
            Math.round(
                THREE.MathUtils.clamp(
                    currentDepth,
                    0,
                    6000
                )
            );

        /*
         * Never overwrite the slider while
         * the user is actively dragging it.
         */
        if (
            depthSlider &&
            !depthSliderInteracting
        ) {

            depthSlider.min =
                "0";

            depthSlider.max =
                "6000";

            depthSlider.step =
                "1";

            depthSlider.value =
                String(value);
        }

        if (depthInput) {

            depthInput.min =
                "0";

            depthInput.max =
                "6000";

            depthInput.step =
                "1";

            depthInput.value =
                String(value);
        }

        if (depthValue) {

            depthValue.textContent =
                String(value);
        }

        if (currentDepthElement) {

            currentDepthElement.textContent =
                String(value);
        }
    }

    function setSelectedDepth(value) {

        let depth =
            Number(
                value
            );

        if (!Number.isFinite(depth)) {
            depth = 0;
        }

        depth =
            THREE.MathUtils.clamp(
                depth,
                0,
                6000
            );

        depth =
            Math.round(
                depth
            );

        currentDepth =
            depth;

        latestSelectedDepth =
            depth;

        syncDepthUI();

        updateZone();
    }

    /* INTELLIGENCE PANEL*/

    function createIntelligencePanel() {

        if (
            document.getElementById(
                "oceanIntelligencePanel"
            )
        ) {
            return;
        }

        const panel =
            document.createElement(
                "div"
            );

        panel.id =
            "oceanIntelligencePanel";

        panel.innerHTML = `
            <div class="oi-header">
                <div>
                    <span>INTELLIGENCE LAYER</span>
                    <strong>OCEAN ANALYSIS</strong>
                </div>

                <div class="oi-live">
                    LIVE
                </div>
            </div>

            <div class="oi-cards">

                <div class="oi-card" id="conditionCard">

                    <div class="oi-card-top">
                        <span>OCEAN CONDITION</span>
                        <i id="conditionIndicator"></i>
                    </div>

                    <strong id="conditionStatus">
                        ANALYZING
                    </strong>

                    <small id="conditionMessage">
                        Evaluating marine parameters
                    </small>

                </div>

                <div class="oi-card" id="anomalyCard">

                    <div class="oi-card-top">
                        <span>ANOMALY DETECTION</span>
                        <i id="anomalyIndicator"></i>
                    </div>

                    <strong id="anomalyStatus">
                        SCANNING
                    </strong>

                    <small id="anomalyMessage">
                        Checking environmental patterns
                    </small>

                </div>

            </div>
        `;

        document.body.appendChild(
            panel
        );

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "oceanIntelligenceStyles";

        style.textContent = `
            #oceanIntelligencePanel {
                position: fixed;
                left: 30px;
                bottom: 82px;
                width: 330px;
                z-index: 20;
                padding: 15px;
                border: 1px solid rgba(60,200,255,.22);
                border-radius: 12px;
                background: linear-gradient(
                    145deg,
                    rgba(3,18,32,.94),
                    rgba(2,11,20,.88)
                );
                box-shadow:
                    0 0 30px rgba(22,140,255,.08),
                    inset 0 1px 0 rgba(255,255,255,.04);
                backdrop-filter: blur(14px);
                font-family: inherit;
                pointer-events: none;
            }

            .oi-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 11px;
            }

            .oi-header span {
                display: block;
                color: #7894a8;
                font-size: 8px;
                letter-spacing: 2px;
                margin-bottom: 3px;
            }

            .oi-header strong {
                display: block;
                color: #eaf8ff;
                font-size: 13px;
                letter-spacing: 1.2px;
            }

            .oi-live {
                padding: 4px 7px;
                border: 1px solid rgba(45,231,170,.35);
                border-radius: 5px;
                color: #2de7aa;
                font-size: 8px;
                letter-spacing: 1.5px;
            }

            .oi-cards {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .oi-card {
                min-height: 83px;
                padding: 11px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,.08);
                background: rgba(255,255,255,.025);
                transition: .25s ease;
            }

            .oi-card-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }

            .oi-card-top span {
                color: #7894a8;
                font-size: 7px;
                letter-spacing: 1.1px;
            }

            .oi-card-top i {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #7894a8;
                box-shadow: 0 0 8px rgba(120,148,168,.4);
            }

            .oi-card strong {
                display: block;
                margin-top: 8px;
                color: #eaf8ff;
                font-size: 14px;
                letter-spacing: 1px;
            }

            .oi-card small {
                display: block;
                margin-top: 4px;
                color: #7894a8;
                font-size: 7px;
                line-height: 1.4;
                letter-spacing: .4px;
            }

            .oi-card.condition-normal {
                border-color: rgba(45,231,170,.28);
                box-shadow: inset 0 0 18px rgba(45,231,170,.035);
            }

            .oi-card.condition-attention {
                border-color: rgba(255,190,70,.35);
                box-shadow: inset 0 0 18px rgba(255,190,70,.035);
            }

            .oi-card.condition-critical,
            .oi-card.anomaly-detected {
                border-color: rgba(255,90,90,.4);
                box-shadow: inset 0 0 18px rgba(255,90,90,.045);
            }

            .oi-card.condition-normal .oi-card-top i {
                background: #2de7aa;
                box-shadow: 0 0 10px rgba(45,231,170,.8);
            }

            .oi-card.condition-attention .oi-card-top i {
                background: #ffbe46;
                box-shadow: 0 0 10px rgba(255,190,70,.8);
            }

            .oi-card.condition-critical .oi-card-top i,
            .oi-card.anomaly-detected .oi-card-top i {
                background: #ff5a5a;
                box-shadow: 0 0 10px rgba(255,90,90,.85);
            }

            .oi-card.anomaly-stable {
                border-color: rgba(45,231,170,.28);
            }

            .oi-card.anomaly-stable .oi-card-top i {
                background: #2de7aa;
                box-shadow: 0 0 10px rgba(45,231,170,.8);
            }

            @media (max-width: 800px) {
                #oceanIntelligencePanel {
                    left: 15px;
                    right: 15px;
                    bottom: 72px;
                    width: auto;
                }
            }

            @media (max-width: 560px) {
                .oi-cards {
                    grid-template-columns: 1fr;
                }

                #oceanIntelligencePanel {
                    bottom: 65px;
                    padding: 10px;
                }

                .oi-card {
                    min-height: 65px;
                }
            }
        `;

        document.head.appendChild(
            style
        );
    }

    createIntelligencePanel();

    const conditionCard =
        document.getElementById(
            "conditionCard"
        );

    const conditionStatus =
        document.getElementById(
            "conditionStatus"
        );

    const conditionMessage =
        document.getElementById(
            "conditionMessage"
        );

    const anomalyCard =
        document.getElementById(
            "anomalyCard"
        );

    const anomalyStatus =
        document.getElementById(
            "anomalyStatus"
        );

    const anomalyMessage =
        document.getElementById(
            "anomalyMessage"
        );

    function updateIntelligence(data) {

        if (
            !conditionStatus ||
            !anomalyStatus
        ) {
            return;
        }

        const intelligence =
            data?.intelligence || {};

        const condition =
            intelligence.condition || {};

        const anomaly =
            intelligence.anomaly || {};

        if (conditionCard) {
            conditionCard.className =
                "oi-card";
        }

        if (anomalyCard) {
            anomalyCard.className =
                "oi-card";
        }

        if (condition.status) {

            conditionStatus.textContent =
                condition.status;

            if (conditionMessage) {

                conditionMessage.textContent =
                    condition.message ||
                    "Marine parameters evaluated.";
            }

            if (conditionCard) {

                conditionCard.classList.add(
                    "condition-" +
                    String(
                        condition.level ||
                        "normal"
                    ).toLowerCase()
                );
            }

        }
        else {

            conditionStatus.textContent =
                "UNAVAILABLE";

            if (conditionMessage) {

                conditionMessage.textContent =
                    "Insufficient data for assessment.";
            }
        }

        if (anomaly.status) {

            anomalyStatus.textContent =
                anomaly.status;

            if (anomalyMessage) {

                anomalyMessage.textContent =
                    anomaly.message ||
                    "Environmental screening completed.";
            }

            if (anomalyCard) {

                if (
                    anomaly.detected === true
                ) {

                    anomalyCard.classList.add(
                        "anomaly-detected"
                    );

                }
                else {

                    anomalyCard.classList.add(
                        "anomaly-stable"
                    );
                }
            }

        }
        else {

            anomalyStatus.textContent =
                "UNAVAILABLE";

            if (anomalyMessage) {

                anomalyMessage.textContent =
                    "Insufficient data for screening.";
            }
        }
    }

    function resetIntelligence() {

        if (conditionCard) {
            conditionCard.className =
                "oi-card";
        }

        if (anomalyCard) {
            anomalyCard.className =
                "oi-card";
        }

        if (conditionStatus) {
            conditionStatus.textContent =
                "ANALYZING";
        }

        if (conditionMessage) {
            conditionMessage.textContent =
                "Evaluating marine parameters";
        }

        if (anomalyStatus) {
            anomalyStatus.textContent =
                "SCANNING";
        }

        if (anomalyMessage) {
            anomalyMessage.textContent =
                "Checking environmental patterns";
        }
    }

    /*LOCATION / DEPTH HELPERS*/

    function latLonToVector(
        lat,
        lon,
        radius
    ) {

        const phi =
            THREE.MathUtils.degToRad(
                90 - lat
            );

        const theta =
            THREE.MathUtils.degToRad(
                lon + 180
            );

        return new THREE.Vector3(
            -radius *
            Math.sin(phi) *
            Math.cos(theta),

            radius *
            Math.cos(phi),

            radius *
            Math.sin(phi) *
            Math.sin(theta)
        );
    }

    function updateMarker() {

        const position =
            latLonToVector(
                latitude,
                longitude,
                2.5
            );

        marker.position.copy(
            position
        );

        const normal =
            position.clone().normalize();

        marker.quaternion.setFromUnitVectors(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            normal
        );

        marker.visible =
            true;

        marker.updateMatrixWorld(
            true
        );
    }

    updateMarker();

    function formatLat(value) {

        if (!Number.isFinite(value)) {
            return "--";
        }

        return (
            Math.abs(value).toFixed(4) +
            "° " +
            (
                value >= 0
                    ? "N"
                    : "S"
            )
        );
    }

    function formatLon(value) {

        if (!Number.isFinite(value)) {
            return "--";
        }

        return (
            Math.abs(value).toFixed(4) +
            "° " +
            (
                value >= 0
                    ? "E"
                    : "W"
            )
        );
    }

    function updateZone() {

        let zone =
            "SURFACE";

        if (
            currentDepth > 0 &&
            currentDepth <= 200
        ) {

            zone =
                "SUNLIGHT ZONE";

        }
        else if (
            currentDepth <= 1000
        ) {

            zone =
                "TWILIGHT ZONE";

        }
        else if (
            currentDepth <= 4000
        ) {

            zone =
                "DEEP OCEAN";

        }
        else {

            zone =
                "ABYSSAL ZONE";
        }

        if (waterType) {

            waterType.textContent =
                zone;
        }
    }

    function updateDepthUI() {

        syncDepthUI();

        updateZone();
    }

    /* =========================================================
       DATA UI
    ========================================================= */

    function setLoadingState() {

        if (temperatureValue) {
            temperatureValue.textContent =
                "LOADING...";
        }

        if (salinityValue) {
            salinityValue.textContent =
                "LOADING...";
        }

        if (currentValue) {
            currentValue.textContent =
                "LOADING...";
        }

        if (directionValue) {
            directionValue.textContent =
                "...";
        }

        if (dataConfidence) {
            dataConfidence.textContent =
                "--";
        }

        if (explorationStatus) {
            explorationStatus.textContent =
                "FETCHING DATA";
        }

        resetIntelligence();
    }

    function setNoDataState(message) {

        if (temperatureValue) {
            temperatureValue.textContent =
                "NO DATA";
        }

        if (salinityValue) {
            salinityValue.textContent =
                "NO DATA";
        }

        if (currentValue) {
            currentValue.textContent =
                "NO DATA";
        }

        if (directionValue) {
            directionValue.textContent =
                "--";
        }

        if (dataConfidence) {
            dataConfidence.textContent =
                "NO DATA";
        }

        if (explorationStatus) {
            explorationStatus.textContent =
                "NO OCEAN DATA";
        }

        resetIntelligence();

        if (conditionStatus) {

            conditionStatus.textContent =
                "NO DATA";
        }

        if (conditionMessage) {

            conditionMessage.textContent =
                "Unable to evaluate conditions.";
        }

        if (anomalyStatus) {

            anomalyStatus.textContent =
                "NO DATA";
        }

        if (anomalyMessage) {

            anomalyMessage.textContent =
                "Unable to screen parameters.";
        }

        console.error(
            "Ocean data unavailable:",
            message
        );
    }

    function calculateDataConfidence(data) {

        let score =
            100;

        const actualLat =
            Number(
                data.actualLatitude
            );

        const actualLon =
            Number(
                data.actualLongitude
            );

        const actualDepth =
            Number(
                data.actualDepth
            );

        const requestedDepth =
            Number(
                data.requestedDepth
            );

        if (
            Number.isFinite(actualLat) &&
            Number.isFinite(actualLon)
        ) {

            const latDifference =
                Math.abs(
                    latitude -
                    actualLat
                );

            const lonDifference =
                Math.abs(
                    longitude -
                    actualLon
                );

            score -= Math.min(
                15,
                (
                    latDifference +
                    lonDifference
                ) * 20
            );

        }
        else {

            score -= 15;
        }

        if (
            Number.isFinite(actualDepth) &&
            Number.isFinite(requestedDepth)
        ) {

            const depthDifference =
                Math.abs(
                    requestedDepth -
                    actualDepth
                );

            score -= Math.min(
                60,
                depthDifference / 100
            );

        }
        else {

            score -= 15;
        }

        if (
            !Number.isFinite(
                Number(
                    data.temperature
                )
            )
        ) {

            score -= 10;
        }

        if (
            !Number.isFinite(
                Number(
                    data.salinity
                )
            )
        ) {

            score -= 10;
        }

        if (
            !Number.isFinite(
                Number(data.u)
            ) ||
            !Number.isFinite(
                Number(data.v)
            )
        ) {

            score -= 10;
        }

        return Math.round(
            THREE.MathUtils.clamp(
                score,
                25,
                99
            )
        );
    }

    /*OCEAN API*/

    async function fetchOceanData(
        depthOverride = null
    ) {

        /*REQUEST SNAPSHOT*/

        const requestId =
            ++depthRequestId;

        const requestDepth =
            depthOverride !== null
                ? Number(
                    depthOverride
                )
                : Number(
                    currentDepth
                );

        const safeDepth =
            Math.round(
                THREE.MathUtils.clamp(
                    Number.isFinite(
                        requestDepth
                    )
                        ? requestDepth
                        : 0,
                    0,
                    6000
                )
            );

        /*
         * IMPORTANT:
         *
         * Remember which depth the request belongs to.
         *
         * If user changes slider while this request
         * is loading, this value will be different.
         */
        const selectedDepthAtRequest =
            latestSelectedDepth;

        loadingData =
            true;

        setLoadingState();

        const url =
            `/api/ocean-data?lat=${encodeURIComponent(
                latitude
            )}&lon=${encodeURIComponent(
                longitude
            )}&depth=${encodeURIComponent(
                safeDepth
            )}`;

        console.log(
            "Fetching ocean data:",
            url
        );

        try {

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );

            const data =
                await response.json();

            console.log(
                "Ocean API response:",
                data
            );

            if (
                !response.ok ||
                !data ||
                data.success !== true
            ) {

                throw new Error(
                    data?.error ||
                    "Ocean data unavailable."
                );
            }

            /*
             * =================================================
             * VERY IMPORTANT STALE REQUEST CHECK
             * =================================================
             *
             * Three things must still match:
             *
             * 1. Request ID
             * 2. Latest selected depth
             * 3. Current selected depth
             *
             * If any one is different,
             * this API response is OLD.
             */

            if (
                requestId !==
                depthRequestId ||
                latestSelectedDepth !==
                selectedDepthAtRequest ||
                currentDepth !==
                safeDepth
            ) {

                console.log(
                    "Ignoring stale ocean response:",
                    {
                        requestId,
                        latestRequestId:
                            depthRequestId,
                        requestDepth:
                            safeDepth,
                        currentDepth,
                        selectedDepth:
                            latestSelectedDepth
                    }
                );

                return null;
            }

            /*UPDATE DATA */

            const temperature =
                Number(
                    data.temperature
                );

            const salinity =
                Number(
                    data.salinity
                );

            const current =
                Number(
                    data.current
                );

            if (temperatureValue) {

                temperatureValue.textContent =
                    Number.isFinite(
                        temperature
                    )
                        ? temperature.toFixed(2)
                        : "NO DATA";
            }

            if (salinityValue) {

                salinityValue.textContent =
                    Number.isFinite(
                        salinity
                    )
                        ? salinity.toFixed(2)
                        : "NO DATA";
            }

            if (currentValue) {

                currentValue.textContent =
                    Number.isFinite(
                        current
                    )
                        ? current.toFixed(2)
                        : "NO DATA";
            }

            if (directionValue) {

                directionValue.textContent =
                    data.direction ||
                    "--";
            }

            /*
             * Display ONLY user's selected depth.
             *
             * Never use data.actualDepth here.
             */
            if (currentDepthElement) {

                currentDepthElement.textContent =
                    String(
                        currentDepth
                    );
            }

            if (displayLatitude) {

                displayLatitude.textContent =
                    formatLat(
                        latitude
                    );
            }

            if (displayLongitude) {

                displayLongitude.textContent =
                    formatLon(
                        longitude
                    );
            }

            if (dataConfidence) {

                dataConfidence.textContent =
                    calculateDataConfidence({
                        ...data,
                        requestedDepth:
                            safeDepth
                    }) + "%";
            }

            updateIntelligence(
                data
            );

            if (explorationStatus) {

                explorationStatus.textContent =
                    "COPERNICUS DATA";
            }

            /*
             * IMPORTANT:
             *
             * DO NOT call syncDepthUI() here.
             *
             * API response should NEVER modify
             * the slider/input while user is selecting.
             */

            updateZone();

            return data;

        }
        catch (error) {

            /*Old request error must also be ignored.*/

            if (
                requestId !==
                depthRequestId ||
                latestSelectedDepth !==
                selectedDepthAtRequest ||
                currentDepth !==
                safeDepth
            ) {

                return null;
            }

            console.error(
                "Ocean data error:",
                error
            );

            setNoDataState(
                error.message
            );

            /*Do NOT sync slider here.*/
            updateZone();

            return null;

        }
        finally {

            /*
             * Only latest request controls
             * loading state.
             */

            if (
                requestId ===
                depthRequestId
            ) {

                loadingData =
                    false;
            }
        }
    }

    /*LOCATION*/

    async function findLocationName(
        lat,
        lon
    ) {

        if (!locationName) {
            return;
        }

        locationName.textContent =
            "Locating...";

        try {

            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
                    {
                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Location lookup failed"
                );
            }

            const data =
                await response.json();

            const address =
                data.address || {};

            const oceanName =
                address.ocean ||
                address.sea ||
                address.water ||
                address.body_of_water;

            let name =
                oceanName;

            if (!name) {

                name =
                    getFallbackLocation(
                        lat,
                        lon
                    );
            }

            locationName.textContent =
                name;

        }
        catch (error) {

            console.log(
                "Location lookup failed:",
                error
            );

            locationName.textContent =
                getFallbackLocation(
                    lat,
                    lon
                );
        }
    }

    function getFallbackLocation(
        lat,
        lon
    ) {

        if (
            lat >= 5 &&
            lat <= 30 &&
            lon >= 45 &&
            lon < 78
        ) {

            return "Arabian Sea";
        }

        if (
            lat >= 5 &&
            lat <= 25 &&
            lon >= 78 &&
            lon <= 100
        ) {

            return "Bay of Bengal";
        }

        if (lat >= 66.5) {

            return "Arctic Ocean";
        }

        if (lat <= -50) {

            return "Southern Ocean";
        }

        if (
            lat >= -50 &&
            lat < 30 &&
            lon >= 20 &&
            lon <= 150
        ) {

            return "Indian Ocean";
        }

        if (
            lat >= -50 &&
            lat < 66.5 &&
            lon >= -80 &&
            lon < 20
        ) {

            return "Atlantic Ocean";
        }

        if (
            lat >= -50 &&
            lat < 66.5 &&
            lon >= -180 &&
            lon < -80
        ) {

            return "Pacific Ocean";
        }

        if (
            lat >= -50 &&
            lat < 66.5 &&
            lon > 150 &&
            lon <= 180
        ) {

            return "Pacific Ocean";
        }

        return "Ocean Point";
    }

    /* =========================================================
       FOCUS
    ========================================================= */

    function focusOnCoordinates() {

        if (focusAnimationId) {

            cancelAnimationFrame(
                focusAnimationId
            );

            focusAnimationId =
                null;
        }

        const selectedPoint =
            latLonToVector(
                latitude,
                longitude,
                1
            ).normalize();

        const startQuaternion =
            earthGroup.quaternion.clone();

        const worldPoint =
            selectedPoint.clone()
                .applyQuaternion(
                    startQuaternion
                )
                .normalize();

        const targetDirection =
            new THREE.Vector3(
                0,
                0,
                1
            );

        const correction =
            new THREE.Quaternion();

        correction.setFromUnitVectors(
            worldPoint,
            targetDirection
        );

        const targetQuaternion =
            correction.clone()
                .multiply(
                    startQuaternion
                );

        const startTime =
            performance.now();

        const duration =
            850;

        function animateFocus(time) {

            const progress =
                Math.min(
                    1,
                    (
                        time -
                        startTime
                    ) /
                    duration
                );

            const eased =
                1 -
                Math.pow(
                    1 -
                    progress,
                    3
                );

            earthGroup.quaternion
                .slerpQuaternions(
                    startQuaternion,
                    targetQuaternion,
                    eased
                );

            updateMarker();

            if (
                progress <
                1
            ) {

                focusAnimationId =
                    requestAnimationFrame(
                        animateFocus
                    );

            }
            else {

                earthGroup.quaternion.copy(
                    targetQuaternion
                );

                focusAnimationId =
                    null;

                updateMarker();
            }
        }

        focusAnimationId =
            requestAnimationFrame(
                animateFocus
            );
    }

    /* =========================================================
       LOCATION BUTTON
    ========================================================= */

    async function locatePoint() {

        const lat =
            Number(
                latitudeInput?.value
            );

        const lon =
            Number(
                longitudeInput?.value
            );

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon)
        ) {

            alert(
                "Please enter latitude and longitude."
            );

            return;
        }

        if (
            lat < -90 ||
            lat > 90
        ) {

            alert(
                "Latitude must be between -90 and 90."
            );

            return;
        }

        if (
            lon < -180 ||
            lon > 180
        ) {

            alert(
                "Longitude must be between -180 and 180."
            );

            return;
        }

        /*
         * Location change invalidates
         * previous depth API response.
         */
        depthRequestId++;

        latitude =
            lat;

        longitude =
            lon;

        autoRotate =
            false;

        isDragging =
            false;

        velocityX =
            0;

        velocityY =
            0;

        if (focusAnimationId) {

            cancelAnimationFrame(
                focusAnimationId
            );

            focusAnimationId =
                null;
        }

        if (underwaterMode) {

            exitUnderwater();
        }

        updateMarker();

        if (displayLatitude) {

            displayLatitude.textContent =
                formatLat(
                    latitude
                );
        }

        if (displayLongitude) {

            displayLongitude.textContent =
                formatLon(
                    longitude
                );
        }

        if (latitudeInput) {

            latitudeInput.value =
                latitude;
        }

        if (longitudeInput) {

            longitudeInput.value =
                longitude;
        }

        focusOnCoordinates();

        findLocationName(
            latitude,
            longitude
        );

        await fetchOceanData(
            currentDepth
        );
    }

    if (locateButton) {

        locateButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                locatePoint();
            }
        );
    }

    if (latitudeInput) {

        latitudeInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    locatePoint();
                }
            }
        );
    }

    if (longitudeInput) {

        longitudeInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    locatePoint();
                }
            }
        );
    }

    /* =========================================================
       DEPTH NUMBER INPUT
    ========================================================= */

    async function applyDepthInput() {

        if (diveInProgress) {
            return;
        }

        if (!depthInput) {
            return;
        }

        let value =
            Number(
                depthInput.value
            );

        if (!Number.isFinite(value)) {
            value = 0;
        }

        value =
            THREE.MathUtils.clamp(
                value,
                0,
                6000
            );

        setSelectedDepth(
            value
        );

        /*
         * IMPORTANT:
         *
         * User manually selected a new depth.
         *
         * Immediately invalidate every previous
         * API request.
         */
        depthRequestId++;

        const requestedDepth =
            currentDepth;

        const selectedDepthAtStart =
            latestSelectedDepth;

        const reading =
            await fetchOceanData(
                requestedDepth
            );

        if (
            selectedDepthAtStart !==
            latestSelectedDepth ||
            requestedDepth !==
            currentDepth
        ) {

            return;
        }

        if (reading) {

            updateIntelligence(
                reading
            );
        }

        if (currentDepth > 0) {

            enterUnderwater();

        }
        else {

            exitUnderwater();
        }

        syncDepthUI();

        updateZone();
    }

    if (depthInput) {

        depthInput.addEventListener(
            "change",
            applyDepthInput
        );

        depthInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    applyDepthInput();
                }
            }
        );
    }

    /* =========================================================
       MOUSE / EARTH
    ========================================================= */

    canvas.addEventListener(
        "pointerdown",
        event => {

            if (diveInProgress) {
                return;
            }

            isDragging =
                true;

            autoRotate =
                false;

            previousX =
                event.clientX;

            previousY =
                event.clientY;

            velocityX =
                0;

            velocityY =
                0;

            try {

                canvas.setPointerCapture(
                    event.pointerId
                );

            }
            catch (error) {

                console.log(
                    "Pointer capture unavailable:",
                    error
                );
            }
        }
    );

    canvas.addEventListener(
        "pointermove",
        event => {

            if (!isDragging) {
                return;
            }

            const dx =
                event.clientX -
                previousX;

            const dy =
                event.clientY -
                previousY;

            previousX =
                event.clientX;

            previousY =
                event.clientY;

            earthGroup.rotation.y +=
                dx *
                0.006;

            earthGroup.rotation.x +=
                dy *
                0.006;

            earthGroup.rotation.x =
                THREE.MathUtils.clamp(
                    earthGroup.rotation.x,
                    -1.4,
                    1.4
                );

            velocityY =
                dx *
                0.0007;

            velocityX =
                dy *
                0.0007;
        }
    );

    canvas.addEventListener(
        "pointerup",
        event => {

            isDragging =
                false;

            try {

                canvas.releasePointerCapture(
                    event.pointerId
                );

            }
            catch { }
        }
    );

    canvas.addEventListener(
        "pointercancel",
        () => {

            isDragging =
                false;
        }
    );

    canvas.addEventListener(
        "wheel",
        event => {

            if (underwaterMode) {
                return;
            }

            event.preventDefault();

            targetCameraZ +=
                event.deltaY *
                0.0035;

            targetCameraZ =
                THREE.MathUtils.clamp(
                    targetCameraZ,
                    4.3,
                    10
                );
        },
        {
            passive: false
        }
    );

    if (zoomButton) {

        zoomButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                if (underwaterMode) {
                    return;
                }

                targetCameraZ -=
                    0.7;

                targetCameraZ =
                    THREE.MathUtils.clamp(
                        targetCameraZ,
                        4.3,
                        10
                    );
            }
        );
    }

    /* =========================================================
       DEPTH SLIDER
    ========================================================= */

    /* =========================================================
    DEPTH SLIDER
 ========================================================= */

    if (depthSlider) {

        depthSlider.min =
            "0";

        depthSlider.max =
            "6000";

        depthSlider.step =
            "1";

        /*
         * USER STARTED MOVING SLIDER
         */

        depthSlider.addEventListener(
            "pointerdown",
            () => {

                if (diveInProgress) {
                    return;
                }

                depthSliderInteracting =
                    true;
            }
        );

        depthSlider.addEventListener(
            "pointerup",
            () => {

                depthSliderInteracting =
                    false;
            }
        );

        depthSlider.addEventListener(
            "pointercancel",
            () => {

                depthSliderInteracting =
                    false;
            }
        );

        /*
         * =====================================================
         * INPUT
         * =====================================================
         *
         * Runs continuously while dragging.
         *
         * NO API REQUEST.
         * NO syncDepthUI().
         */

        depthSlider.addEventListener(
            "input",
            () => {

                if (diveInProgress) {
                    return;
                }

                const value =
                    Number(
                        depthSlider.value
                    );

                if (
                    !Number.isFinite(value)
                ) {
                    return;
                }

                const selectedDepth =
                    Math.round(
                        THREE.MathUtils.clamp(
                            value,
                            0,
                            6000
                        )
                    );

                /*
                 * Invalidate all previous
                 * asynchronous requests.
                 */
                depthRequestId++;

                currentDepth =
                    selectedDepth;

                latestSelectedDepth =
                    selectedDepth;

                /*
                 * Update only the display.
                 *
                 * IMPORTANT:
                 * Do not call syncDepthUI().
                 */

                if (depthValue) {

                    depthValue.textContent =
                        String(
                            selectedDepth
                        );
                }

                if (currentDepthElement) {

                    currentDepthElement.textContent =
                        String(
                            selectedDepth
                        );
                }

                if (depthInput) {

                    depthInput.value =
                        String(
                            selectedDepth
                        );
                }

                updateZone();

                console.log(
                    "Depth selected:",
                    selectedDepth
                );
            }
        );

        /*
         * =====================================================
         * CHANGE
         * =====================================================
         *
         * Runs when the user releases the slider.
         */

        depthSlider.addEventListener(
            "change",
            async () => {

                if (diveInProgress) {
                    return;
                }

                const value =
                    Number(
                        depthSlider.value
                    );

                if (
                    !Number.isFinite(value)
                ) {
                    return;
                }

                const requestedDepth =
                    Math.round(
                        THREE.MathUtils.clamp(
                            value,
                            0,
                            6000
                        )
                    );

                /*
                 * Slider interaction is finished.
                 */
                depthSliderInteracting =
                    false;

                /*
                 * The slider is now the
                 * source of truth.
                 */
                currentDepth =
                    requestedDepth;

                latestSelectedDepth =
                    requestedDepth;

                /*
                 * This request must become
                 * the newest request.
                 */
                depthRequestId++;

                const requestIdAtStart =
                    depthRequestId;

                const selectedDepthAtStart =
                    requestedDepth;

                /*
                 * Do not overwrite the slider here.
                 *
                 * Only update the other UI.
                 */

                if (depthInput) {

                    depthInput.value =
                        String(
                            requestedDepth
                        );
                }

                if (depthValue) {

                    depthValue.textContent =
                        String(
                            requestedDepth
                        );
                }

                if (currentDepthElement) {

                    currentDepthElement.textContent =
                        String(
                            requestedDepth
                        );
                }

                updateZone();

                const reading =
                    await fetchOceanData(
                        requestedDepth
                    );

                /*
                 * Ignore anything that belongs
                 * to an older slider selection.
                 */

                if (
                    requestIdAtStart !==
                    depthRequestId
                ) {

                    console.log(
                        "Ignoring stale slider request:",
                        requestedDepth
                    );

                    return;
                }

                if (
                    selectedDepthAtStart !==
                    currentDepth
                ) {

                    return;
                }

                if (
                    Number(depthSlider.value) !==
                    requestedDepth
                ) {

                    return;
                }

                if (reading) {

                    updateIntelligence(
                        reading
                    );
                }

                if (
                    currentDepth > 0
                ) {

                    enterUnderwater();

                }
                else {

                    exitUnderwater();
                }

                /*
                 * IMPORTANT:
                 *
                 * Do NOT call syncDepthUI()
                 * here.
                 *
                 * Slider already has the
                 * correct user-selected value.
                 */

                if (depthInput) {

                    depthInput.value =
                        String(
                            requestedDepth
                        );
                }

                if (depthValue) {

                    depthValue.textContent =
                        String(
                            requestedDepth
                        );
                }

                if (currentDepthElement) {

                    currentDepthElement.textContent =
                        String(
                            requestedDepth
                        );
                }

                updateZone();
            }
        );
    }

    /* =========================================================
       UNDERWATER PARTICLES
    ========================================================= */

    const underwaterParticles =
        [];

    for (
        let i = 0;
        i < 700;
        i++
    ) {

        const particle =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.008 +
                    Math.random() *
                    0.012,
                    6,
                    6
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        Math.random() > 0.45
                            ? 0x73e6ff
                            : 0x49d9a7,
                    transparent: true,
                    opacity:
                        0.25 +
                        Math.random() *
                        0.4
                })
            );

        particle.position.set(
            (
                Math.random() -
                0.5
            ) * 18,

            (
                Math.random() -
                0.5
            ) * 12,

            (
                Math.random() -
                0.5
            ) * 15
        );

        particle.userData.speed =
            0.002 +
            Math.random() *
            0.006;

        underwaterGroup.add(
            particle
        );

        underwaterParticles.push(
            particle
        );
    }

    const bubbles =
        [];

    for (
        let i = 0;
        i < 90;
        i++
    ) {

        const bubble =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.015 +
                    Math.random() *
                    0.035,
                    8,
                    8
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x9aeaff,
                    transparent: true,
                    opacity: 0.25
                })
            );

        bubble.position.set(
            (
                Math.random() -
                0.5
            ) * 12,

            -5 +
            Math.random() *
            10,

            (
                Math.random() -
                0.5
            ) * 10
        );

        underwaterGroup.add(
            bubble
        );

        bubbles.push(
            bubble
        );
    }

    /* =========================================================
       DIVER
    ========================================================= */

    function createDiver() {

        if (diverGroup) {
            return;
        }

        diverGroup =
            new THREE.Group();

        diverGroup.position.set(
            0,
            diverStartY,
            0
        );

        const diverMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x101923,
                roughness: 0.75,
                metalness: 0.1
            });

        const suitMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x16364d,
                roughness: 0.8,
                metalness: 0.05
            });

        const glassMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x7de8ff,
                transparent: true,
                opacity: 0.55,
                roughness: 0.1,
                metalness: 0.15
            });

        const tankMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x778b99,
                roughness: 0.55,
                metalness: 0.35
            });

        const head =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.19,
                    20,
                    20
                ),
                diverMaterial
            );

        head.position.y =
            0.48;

        diverGroup.add(
            head
        );

        const helmet =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.215,
                    20,
                    20
                ),
                glassMaterial
            );

        helmet.position.y =
            0.5;

        diverGroup.add(
            helmet
        );

        const body =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.21,
                    0.25,
                    0.58,
                    16
                ),
                suitMaterial
            );

        body.position.y =
            0.04;

        diverGroup.add(
            body
        );

        const chest =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.34,
                    0.22,
                    0.2
                ),
                suitMaterial
            );

        chest.position.set(
            0,
            0.14,
            0.08
        );

        diverGroup.add(
            chest
        );

        const leftArm =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.065,
                    0.075,
                    0.42,
                    12
                ),
                suitMaterial
            );

        leftArm.position.set(
            -0.29,
            0.08,
            0
        );

        leftArm.rotation.z =
            THREE.MathUtils.degToRad(
                20
            );

        diverGroup.add(
            leftArm
        );

        const rightArm =
            leftArm.clone();

        rightArm.position.x =
            0.29;

        rightArm.rotation.z =
            THREE.MathUtils.degToRad(
                -20
            );

        diverGroup.add(
            rightArm
        );

        const leftLeg =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.07,
                    0.08,
                    0.5,
                    12
                ),
                diverMaterial
            );

        leftLeg.position.set(
            -0.12,
            -0.48,
            0
        );

        leftLeg.rotation.z =
            THREE.MathUtils.degToRad(
                4
            );

        diverGroup.add(
            leftLeg
        );

        const rightLeg =
            leftLeg.clone();

        rightLeg.position.x =
            0.12;

        rightLeg.rotation.z =
            THREE.MathUtils.degToRad(
                -4
            );

        diverGroup.add(
            rightLeg
        );

        const finLeft =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.18,
                    0.04,
                    0.34
                ),
                suitMaterial
            );

        finLeft.position.set(
            -0.12,
            -0.77,
            -0.08
        );

        diverGroup.add(
            finLeft
        );

        const finRight =
            finLeft.clone();

        finRight.position.x =
            0.12;

        diverGroup.add(
            finRight
        );

        const tank =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.095,
                    0.095,
                    0.5,
                    16
                ),
                tankMaterial
            );

        tank.position.set(
            0,
            0.08,
            -0.25
        );

        tank.rotation.x =
            Math.PI / 2;

        diverGroup.add(
            tank
        );

        const tankTop =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.035,
                    0.035,
                    0.13,
                    12
                ),
                tankMaterial
            );

        tankTop.position.set(
            0,
            0.08,
            -0.53
        );

        tankTop.rotation.x =
            Math.PI / 2;

        diverGroup.add(
            tankTop
        );

        const diverLight =
            new THREE.PointLight(
                0x57d9ff,
                0.8,
                3
            );

        diverLight.position.set(
            0,
            0.25,
            0.35
        );

        diverGroup.add(
            diverLight
        );

        diverGroup.visible =
            false;

        underwaterGroup.add(
            diverGroup
        );
    }

    createDiver();

    /* =========================================================
       OCEAN FLOOR
    ========================================================= */

    const localOceanFloor =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                5.5,
                7,
                0.35,
                64
            ),
            new THREE.MeshStandardMaterial({
                color: 0x102b3b,
                roughness: 1,
                metalness: 0
            })
        );

    localOceanFloor.position.set(
        0,
        -4.1,
        -2
    );

    underwaterGroup.add(
        localOceanFloor
    );

    const floorRocks =
        [];

    for (
        let i = 0;
        i < 55;
        i++
    ) {

        const rock =
            new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    0.05 +
                    Math.random() *
                    0.14,
                    0
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        Math.random() > 0.5
                            ? 0x193f4d
                            : 0x245064,
                    roughness: 1
                })
            );

        rock.position.set(
            (
                Math.random() -
                0.5
            ) * 9,

            -3.85 +
            Math.random() *
            0.18,

            -5 +
            Math.random() *
            6
        );

        underwaterGroup.add(
            rock
        );

        floorRocks.push(
            rock
        );
    }

    function createDepthRings() {

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const ring =
                new THREE.Mesh(
                    new THREE.RingGeometry(
                        0.35 +
                        i *
                        0.25,

                        0.37 +
                        i *
                        0.25,

                        48
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0x39d6ff,
                        transparent: true,
                        opacity: 0.08,
                        side: THREE.DoubleSide
                    })
                );

            ring.rotation.x =
                Math.PI / 2;

            ring.position.set(
                0,
                -3.75,
                -1.5
            );

            underwaterGroup.add(
                ring
            );
        }
    }

    createDepthRings();

    /* =========================================================
       UNDERWATER
    ========================================================= */

    function enterUnderwater() {

        underwaterMode =
            true;

        underwaterGroup.visible =
            true;

        autoRotate =
            false;

        targetCameraZ =
            4.8;

        document.body.classList.add(
            "underwater"
        );

        if (diverGroup) {

            diverGroup.visible =
                true;

            diverGroup.position.y =
                diverStartY;
        }
    }

    function exitUnderwater() {

        underwaterMode =
            false;

        targetCameraZ =
            7.4;

        document.body.classList.remove(
            "underwater"
        );

        if (diverGroup) {

            diverGroup.visible =
                false;
        }

        setTimeout(() => {

            if (!underwaterMode) {

                underwaterGroup.visible =
                    false;
            }

        }, 700);
    }

    function depthToDiverY(
        depth,
        targetDepth
    ) {

        const progress =
            targetDepth <= 0
                ? 0
                : THREE.MathUtils.clamp(
                    depth /
                    targetDepth,
                    0,
                    1
                );

        return THREE.MathUtils.lerp(
            diverStartY,
            diverTargetY,
            progress
        );
    }

    function animateDiverToDepth(
        depth,
        targetDepth,
        duration,
        runId
    ) {

        return new Promise(
            resolve => {

                if (!diverGroup) {

                    resolve(false);

                    return;
                }

                const startY =
                    diverGroup.position.y;

                const endY =
                    depthToDiverY(
                        depth,
                        targetDepth
                    );

                const startTime =
                    performance.now();

                function step(time) {

                    if (
                        runId !==
                        diveRunId
                    ) {

                        resolve(false);

                        return;
                    }

                    const progress =
                        Math.min(
                            1,
                            (
                                time -
                                startTime
                            ) /
                            duration
                        );

                    const eased =
                        progress < 0.5
                            ? 2 *
                            progress *
                            progress
                            : 1 -
                            Math.pow(
                                -2 *
                                progress +
                                2,
                                2
                            ) /
                            2;

                    diverGroup.position.y =
                        THREE.MathUtils.lerp(
                            startY,
                            endY,
                            eased
                        );

                    diverGroup.rotation.z =
                        Math.sin(
                            time *
                            0.002
                        ) *
                        0.04;

                    if (
                        progress <
                        1
                    ) {

                        requestAnimationFrame(
                            step
                        );

                    }
                    else {

                        diverGroup.position.y =
                            endY;

                        resolve(true);
                    }
                }

                requestAnimationFrame(
                    step
                );
            }
        );
    }

    /* =========================================================
   DIVE
========================================================= */

    async function performDive() {

        /*
         * If a dive animation is already running,
         * ignore duplicate clicks.
         */
        if (diveInProgress) {
            return;
        }

        /*
         * Every new DIVE gets a completely new run ID.
         *
         * This is important because the user can now
         * DIVE again without pressing RESET.
         */
        const thisDiveId = ++diveRunId;

        /*
         * Invalidate any previous API request.
         *
         * The newest DIVE must always own the final UI state.
         */
        depthRequestId++;

        diveInProgress = true;

        try {

            /*
             * IMPORTANT:
             *
             * Always read the CURRENT slider value.
             * Do not depend on the depth from the previous dive.
             */
            let targetDepth = depthSlider
                ? Number(depthSlider.value)
                : Number(currentDepth);

            if (!Number.isFinite(targetDepth)) {
                targetDepth = 0;
            }

            targetDepth = Math.round(
                THREE.MathUtils.clamp(
                    targetDepth,
                    0,
                    6000
                )
            );

            /*
             * Keep the selected depth as the source of truth.
             */
            currentDepth = targetDepth;
            latestSelectedDepth = targetDepth;

            syncDepthUI();
            updateZone();

            autoRotate = false;
            isDragging = false;

            velocityX = 0;
            velocityY = 0;

            /*
             * Keep the currently selected latitude/longitude.
             */
            focusOnCoordinates();

            /*
             * Enter underwater mode for depths > 0.
             */
            if (targetDepth > 0) {

                targetCameraZ = 5.7;

                enterUnderwater();

            } else {

                /*
                 * Surface selection.
                 */
                exitUnderwater();

                targetCameraZ = 7.4;
            }

            /*
             * Start the diver from the surface
             * for EVERY new DIVE.
             *
             * This is what allows:
             *
             * DIVE 500
             * -> change slider to 1500
             * -> DIVE 1500
             *
             * without RESET.
             */
            if (diverGroup) {

                diverGroup.position.y =
                    diverStartY;

                diverGroup.rotation.set(
                    0,
                    0,
                    0
                );
            }

            /*
             * No underwater animation is needed at 0m.
             */
            if (targetDepth > 0) {

                const depthStep = 250;

                const depthPoints = [];

                let depth = 0;

                while (
                    depth < targetDepth
                ) {

                    depth += depthStep;

                    if (
                        depth > targetDepth
                    ) {
                        depth = targetDepth;
                    }

                    depthPoints.push(
                        depth
                    );
                }

                /*
                 * Animate the diver through the selected depth.
                 */
                for (
                    let i = 0;
                    i < depthPoints.length;
                    i++
                ) {

                    /*
                     * A newer DIVE has started.
                     * Stop this old animation.
                     */
                    if (
                        thisDiveId !==
                        diveRunId
                    ) {
                        return;
                    }

                    const depthPoint =
                        depthPoints[i];

                    const animationCompleted =
                        await animateDiverToDepth(
                            depthPoint,
                            targetDepth,
                            Math.max(
                                900,
                                Math.min(
                                    3500,
                                    (
                                        targetDepth /
                                        1000
                                    ) * 650
                                )
                            ),
                            thisDiveId
                        );

                    if (
                        !animationCompleted
                    ) {
                        return;
                    }
                }
            }

            /*
             * Make sure this is still the latest DIVE.
             */
            if (
                thisDiveId !==
                diveRunId
            ) {
                return;
            }

            /*
             * Final selected depth.
             */
            currentDepth = targetDepth;
            latestSelectedDepth = targetDepth;

            syncDepthUI();
            updateZone();

            /*
             * IMPORTANT:
             *
             * Fetch using the CURRENT selected depth.
             */
            const finalReading =
                await fetchOceanData(
                    targetDepth
                );

            /*
             * Ignore response if another DIVE
             * has already started.
             */
            if (
                thisDiveId !==
                diveRunId
            ) {
                return;
            }

            if (finalReading) {

                updateIntelligence(
                    finalReading
                );

                updateZone();

            } else {

                resetIntelligence();

                if (conditionStatus) {

                    conditionStatus.textContent =
                        "NO DATA";
                }

                if (conditionMessage) {

                    conditionMessage.textContent =
                        "No analysis data available at selected depth.";
                }

                if (anomalyStatus) {

                    anomalyStatus.textContent =
                        "NO DATA";
                }

                if (anomalyMessage) {

                    anomalyMessage.textContent =
                        "No environmental data available at selected depth.";
                }
            }

            /*
             * Final safety check.
             */
            if (
                thisDiveId !==
                diveRunId
            ) {
                return;
            }

            currentDepth = targetDepth;
            latestSelectedDepth = targetDepth;

            syncDepthUI();
            updateZone();

            if (explorationStatus) {

                explorationStatus.textContent =
                    targetDepth > 0
                        ? "UNDERWATER EXPLORATION"
                        : "OCEAN EXPLORATION ACTIVE";
            }

        }
        catch (error) {

            if (
                thisDiveId !==
                diveRunId
            ) {
                return;
            }

            console.error(
                "Dive error:",
                error
            );

            if (explorationStatus) {

                explorationStatus.textContent =
                    "DIVE ERROR";
            }

        }
        finally {

            /*
             * Only the latest DIVE can unlock the button.
             */
            if (
                thisDiveId ===
                diveRunId
            ) {

                diveInProgress = false;

                syncDepthUI();
                updateZone();
            }
        }
    }
    /* =========================================================
       RESET
    ========================================================= */

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                /*
                 * Invalidate every old dive.
                 */
                diveRunId++;

                /*
                 * Invalidate every old API request.
                 */
                depthRequestId++;

                diveInProgress =
                    false;

                loadingData =
                    false;

                if (focusAnimationId) {

                    cancelAnimationFrame(
                        focusAnimationId
                    );

                    focusAnimationId =
                        null;
                }

                earthGroup.rotation.set(
                    0,
                    0,
                    0
                );

                earthGroup.quaternion.set(
                    0,
                    0,
                    0,
                    1
                );

                targetCameraZ =
                    7.4;

                camera.position.z =
                    7.4;

                autoRotate =
                    true;

                isDragging =
                    false;

                velocityX =
                    0;

                velocityY =
                    0;

                latitude =
                    12;

                longitude =
                    70;

                /*
                 * RESET DEPTH
                 */
                currentDepth =
                    0;

                latestSelectedDepth =
                    0;

                if (latitudeInput) {

                    latitudeInput.value =
                        latitude;
                }

                if (longitudeInput) {

                    longitudeInput.value =
                        longitude;
                }

                updateMarker();

                depthSliderInteracting =
                    false;

                if (depthSlider) {

                    depthSlider.value =
                        "0";
                }

                syncDepthUI();
                updateZone();

                syncDepthUI();

                updateZone();

                if (diverGroup) {

                    diverGroup.position.y =
                        diverStartY;

                    diverGroup.rotation.set(
                        0,
                        0,
                        0
                    );
                }

                resetIntelligence();

                findLocationName(
                    latitude,
                    longitude
                );

                exitUnderwater();

                /*
                 * Fetch fresh surface data.
                 *
                 * New request ID is generated
                 * inside fetchOceanData().
                 */
                fetchOceanData(
                    0
                );
            }
        );
    }

    /* =========================================================
       ANIMATION
    ========================================================= */

    function animate() {

        requestAnimationFrame(
            animate
        );

        const time =
            clock.getElapsedTime();

        if (
            autoRotate &&
            !isDragging &&
            !underwaterMode
        ) {

            earthGroup.rotation.y +=
                0.0012;

            clouds.rotation.y +=
                0.00015;
        }

        if (isDragging) {

            earthGroup.rotation.y +=
                velocityY;

            earthGroup.rotation.x +=
                velocityX;

            velocityY *=
                0.94;

            velocityX *=
                0.94;
        }

        earthGroup.rotation.x =
            THREE.MathUtils.clamp(
                earthGroup.rotation.x,
                -1.4,
                1.4
            );

        const markerScale =
            1 +
            Math.sin(
                time *
                3
            ) *
            0.18;

        markerGlow.scale.set(
            markerScale,
            markerScale,
            markerScale
        );

        markerGlow.material.opacity =
            0.45 +
            Math.sin(
                time *
                3
            ) *
            0.15;

        atmosphere.material.opacity =
            0.06 +
            Math.sin(
                time *
                1.5
            ) *
            0.012;

        greenAtmosphere.material.opacity =
            0.012 +
            Math.sin(
                time *
                1.2
            ) *
            0.004;

        stars.rotation.y =
            time *
            0.002;

        if (underwaterMode) {

            underwaterParticles.forEach(
                particle => {

                    particle.position.y +=
                        particle.userData.speed;

                    particle.position.x +=
                        Math.sin(
                            time +
                            particle.position.z
                        ) *
                        0.0005;

                    if (
                        particle.position.y >
                        6
                    ) {

                        particle.position.y =
                            -6;
                    }
                }
            );

            bubbles.forEach(
                bubble => {

                    bubble.position.y +=
                        0.005;

                    bubble.position.x +=
                        Math.sin(
                            time *
                            2 +
                            bubble.position.y
                        ) *
                        0.001;

                    if (
                        bubble.position.y >
                        6
                    ) {

                        bubble.position.y =
                            -6;
                    }
                }
            );

            oceanLight.intensity =
                0.8 +
                Math.sin(
                    time *
                    1.5
                ) *
                0.15;

            oceanLight.position.x =
                Math.sin(
                    time *
                    0.35
                ) *
                4;

            oceanLight.position.z =
                Math.cos(
                    time *
                    0.35
                ) *
                4;

            if (diverGroup) {

                diverGroup.position.x =
                    Math.sin(
                        time *
                        0.7
                    ) *
                    0.035;

                diverGroup.position.z =
                    Math.cos(
                        time *
                        0.55
                    ) *
                    0.035;

                diverGroup.rotation.y =
                    Math.sin(
                        time *
                        0.5
                    ) *
                    0.12;
            }

            floorRocks.forEach(
                rock => {

                    rock.rotation.y +=
                        0.0004;

                    rock.rotation.x +=
                        0.0002;
                }
            );

        }
        else {

            oceanLight.intensity =
                0.65;
        }

        camera.position.z +=
            (
                targetCameraZ -
                camera.position.z
            ) *
            0.08;

        renderer.render(
            scene,
            camera
        );
    }


    /*RESPONSIVE RESIZE */

    function handleResponsiveResize() {

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;

        if (!width || !height) {
            return;
        }

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height,
            false
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );
    }

    window.addEventListener(
        "resize",
        handleResponsiveResize,
        {
            passive: true
        }
    );

    /*
     * Also handle orientation changes
     * on phones/tablets.
     */
    window.addEventListener(
        "orientationchange",
        () => {

            setTimeout(
                handleResponsiveResize,
                100
            );

        },
        {
            passive: true
        }
    );

    /* =========================================================
       INITIAL STATE
    ========================================================= */

    if (latitudeInput) {

        latitudeInput.value =
            latitude;
    }

    if (longitudeInput) {

        longitudeInput.value =
            longitude;
    }

    if (displayLatitude) {

        displayLatitude.textContent =
            formatLat(
                latitude
            );
    }

    if (displayLongitude) {

        displayLongitude.textContent =
            formatLon(
                longitude
            );
    }

    currentDepth =
        0;

    latestSelectedDepth =
        0;

    syncDepthUI();

    updateZone();

    findLocationName(
        latitude,
        longitude
    );

    fetchOceanData(
        0
    );

    animate();
}


/* =============================================================
   START DASHBOARD
============================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initDashboard,
        {
            once: true
        }
    );

}
else {

    initDashboard();
}