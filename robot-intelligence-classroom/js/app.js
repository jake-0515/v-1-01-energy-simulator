document.addEventListener("DOMContentLoaded", () => {
    // ==================== GLOBAL STATES ====================
    let currentStep = 1;
    const totalSteps = 5;

    // ==================== TABS & STEP NAVIGATION ====================
    const stepIndicators = document.querySelectorAll(".step-indicator");
    const progressLineFill = document.getElementById("progress-fill");
    const tabContents = document.querySelectorAll(".tab-content");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const completionBanner = document.getElementById("completion-banner");

    function updateStepUI() {
        // Update progress line
        const fillPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressLineFill.style.width = `${fillPercent}%`;

        // Update step indicators active/completed state
        stepIndicators.forEach((indicator, idx) => {
            const stepNum = idx + 1;
            indicator.classList.remove("active", "completed");
            if (stepNum === currentStep) {
                indicator.classList.add("active");
            } else if (stepNum < currentStep) {
                indicator.classList.add("completed");
            }
        });

        // Show active tab, hide others
        tabContents.forEach((tab, idx) => {
            tab.classList.remove("active");
            if (idx + 1 === currentStep) {
                tab.classList.add("active");
            }
        });

        // Enable/Disable navigation buttons
        btnPrev.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            btnNext.style.display = "none";
            // If the model is already trained, show the completion banner
            if (isTrained) {
                completionBanner.style.display = "block";
            }
        } else {
            btnNext.style.display = "inline-flex";
            btnNext.textContent = "다음 단계 ▶";
            completionBanner.style.display = "none";
        }
    }

    btnPrev.addEventListener("click", () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    });

    btnNext.addEventListener("click", () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepUI();
            
            // Auto start camera if moving to step 5
            if (currentStep === 5) {
                setTimeout(startWebcam, 300);
            }
        }
    });

    stepIndicators.forEach((indicator, idx) => {
        indicator.addEventListener("click", () => {
            currentStep = idx + 1;
            updateStepUI();
            
            if (currentStep === 5) {
                setTimeout(startWebcam, 300);
            } else {
                stopWebcam();
            }
        });
    });


    // ==================== STEP 1: VENN DIAGRAM INTERACTION ====================
    const vennDetails = {
        ai: {
            title: "💻 인공지능 (Artificial Intelligence)",
            desc: "컴퓨터 시스템이 인간과 유사한 지능적인 행동(생각, 추론, 학습, 환경인지, 자연어 이해 등)을 수행하게 하려는 과학 및 공학 기술 전체를 의미해요. 인공지능이라는 큰 껍데기 안에 머신러닝과 딥러닝이 속해 있답니다.",
            color: "#3b82f6"
        },
        ml: {
            title: "📊 머신러닝 (Machine Learning)",
            desc: "인공지능을 실현하기 위한 핵심 방법론 중 하나예요. 개발자가 모든 작동 조건과 결과를 하드코딩(If-Else)하는 대신, 컴퓨터에 대량의 데이터를 제공하고 컴퓨터가 스스로 통계적 모델과 수학적 가중치 규칙을 찾아내는 학습 방식입니다.",
            color: "var(--secondary)"
        },
        dl: {
            title: "🧠 딥러닝 (Deep Learning)",
            desc: "인간의 뇌 속 생물학적 뉴런 네트워크 구조를 컴퓨터 상에 모방하여 구현한 '인공신경망(Artificial Neural Networks)'을 기반으로 한 학습 방법입니다. 층을 수없이 깊게 쌓아(Deep Layers) 비정형 이미지, 텍스트 데이터의 고해상도 특징을 알아서 추출하는 최신 기술이에요.",
            color: "var(--primary)"
        }
    };

    window.selectVenn = function(type) {
        const detailsBox = document.getElementById("venn-details-box");
        const titleEl = document.getElementById("venn-detail-title");
        const descEl = document.getElementById("venn-detail-desc");
        
        // Remove scale/active styles from all circle buttons if any, and set colors
        document.querySelectorAll(".venn-circle").forEach(circle => {
            circle.style.transform = "";
        });

        const selectedCircle = document.getElementById(`venn-${type}`);
        selectedCircle.style.transform = "scale(1.03)";

        // Set detailed text
        const details = vennDetails[type];
        titleEl.textContent = details.title;
        titleEl.style.color = details.color;
        descEl.textContent = details.desc;
        
        detailsBox.style.borderLeftColor = details.color;
        detailsBox.style.background = `${details.color}0a`; // Alpha transparency for background glow
    };


    // ==================== STEP 2: BASKETBALL T-E-P SIMULATION ====================
    const practiceSlider = document.getElementById("practice-slider");
    const practiceCountVal = document.getElementById("practice-count-val");
    const shootPerformanceVal = document.getElementById("shoot-performance-val");
    const shootPerformanceGauge = document.getElementById("shoot-performance-gauge");
    const btnShoot = document.getElementById("btn-shoot");
    const basketball = document.getElementById("basketball-ball");
    const trajectoryArc = document.getElementById("trajectory-arc");
    const court = document.querySelector(".basket-court");

    let isShooting = false;

    // Calculate performance based on experience E
    function getSuccessRate(E) {
        // Formula: P = 100 * (1 - e^(-E/400))
        return Math.floor(100 * (1 - Math.exp(-E / 400)));
    }

    practiceSlider.addEventListener("input", () => {
        const E = parseInt(practiceSlider.value);
        practiceCountVal.textContent = E.toLocaleString();
        
        const P = getSuccessRate(E);
        shootPerformanceVal.textContent = `${P}%`;
        shootPerformanceGauge.style.width = `${P}%`;

        // Draw trajectory arc guide dynamically
        drawTrajectory(P);
    });

    function drawTrajectory(P) {
        // Coordinates: launcher is around x=50, y=120. hoop is around x=310, y=65 (relative to 350x180 court)
        const courtWidth = court.clientWidth || 350;
        const courtHeight = court.clientHeight || 180;
        
        const startX = 50;
        const startY = courtHeight - 60;
        const endX = courtWidth - 35;
        
        // Miss adjustments
        let finalX = endX;
        let finalY = 60; // Hoop center height is 50px + 10px radius
        
        if (P < 50) {
            // Poor performance shoots too short or too long
            finalX = P < 20 ? startX + 100 : endX - 60;
            finalY = courtHeight - 30;
        } else if (P < 80) {
            // Decent but misses hitting the backboard or rim
            finalX = endX + 15;
            finalY = 35;
        }

        const controlX = (startX + finalX) / 2;
        const controlY = Math.max(10, finalY - 80 + (100 - P) * 0.5); // height of arc depends on P

        trajectoryArc.setAttribute("d", `M ${startX} ${startY} Q ${controlX} ${controlY} ${finalX} ${finalY}`);
    }

    btnShoot.addEventListener("click", () => {
        if (isShooting) return;
        isShooting = true;
        btnShoot.disabled = true;

        const E = parseInt(practiceSlider.value);
        const P = getSuccessRate(E);
        const isHit = Math.random() * 100 < P;

        const courtWidth = court.clientWidth || 350;
        const courtHeight = court.clientHeight || 180;

        const startX = 45;
        const startY = courtHeight - 60;
        
        const hoopX = courtWidth - 38;
        const hoopY = 60;

        let targetX = hoopX;
        let targetY = hoopY;

        if (!isHit) {
            // Miss animations
            if (P < 30) {
                // Completely airball/short shoot
                targetX = startX + (courtWidth * 0.4);
                targetY = courtHeight - 20;
            } else {
                // Hit backboard/rim and bounce away
                targetX = hoopX + 15;
                targetY = 40;
            }
        }

        // Parabolic path execution
        const duration = 1000; // 1s
        const startTime = performance.now();

        const controlX = (startX + targetX) / 2;
        const controlY = Math.max(10, targetY - 90 + (100 - P) * 0.5);

        function animate(now) {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);

            // Quadratic Bezier curve equation: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
            const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * targetX;
            const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * targetY;

            basketball.style.left = `${x}px`;
            basketball.style.top = `${y}px`;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Shot finished
                if (isHit) {
                    // Ball goes through net
                    basketball.animate([
                        { top: `${hoopY}px`, left: `${hoopX}px` },
                        { top: `${hoopY + 30}px`, left: `${hoopX}px`, opacity: 0 }
                    ], {
                        duration: 300,
                        fill: "forwards"
                    }).onfinish = () => {
                        resetBasketball();
                    };
                } else {
                    // Bounce off
                    basketball.animate([
                        { top: `${targetY}px`, left: `${targetX}px` },
                        { top: `${courtHeight - 20}px`, left: `${targetX + 20}px`, opacity: 0 }
                    ], {
                        duration: 400,
                        fill: "forwards"
                    }).onfinish = () => {
                        resetBasketball();
                    };
                }
            }
        }

        function resetBasketball() {
            setTimeout(() => {
                basketball.style.left = "45px";
                basketball.style.top = "";
                basketball.style.bottom = "60px";
                basketball.style.opacity = "1";
                isShooting = false;
                btnShoot.disabled = false;
            }, 600);
        }

        requestAnimationFrame(animate);
    });

    // Initialize trajectory once court layout is ready
    setTimeout(() => drawTrajectory(0), 500);


    // ==================== STEP 2: FEATURE SCANNER ====================
    const scannedFeatures = { ear: null, color: null, weight: null };
    const scanFeaturesDetails = {
        ear: { name: "귀 모양 감지기", val: 0.8, text: "강아지의 양 귀 모양을 스캔했습니다. 둥글기 비율 수치는 <strong>0.8</strong> (둥근 편에 속함)로 인코딩되었습니다." },
        color: { name: "털 색상 스펙트럼 분석기", val: 1.2, text: "털 가닥들의 반사광을 스캔했습니다. 색상 명도 분석 수치는 <strong>1.2</strong> (황금빛 갈색 무늬)로 인코딩되었습니다." },
        weight: { name: "무게 추정 초음파 센서", val: 5.5, text: "강아지 골격 및 크기 대비 초음파 무게를 측정했습니다. 수치 데이터는 <strong>5.5 kg</strong>으로 변환되었습니다." }
    };

    window.scanFeature = function(feature, top, left) {
        const scanBox = document.getElementById("scan-info-box");
        const scanTitleEl = document.getElementById("scan-title");
        const scanDescEl = document.getElementById("scan-desc");
        const vectorDisplay = document.getElementById("feature-vector-display");

        // Set scanning log
        scanTitleEl.innerHTML = `🛰️ ${scanFeaturesDetails[feature].name} 스캔 중...`;
        scanDescEl.textContent = "로봇의 이미지 센서가 전처리 좌표의 신호를 읽고 수치화하는 중입니다.";
        
        // Disable target dot temporarily for visual effect
        const dot = document.querySelector(`.scanner-target-dot[data-feature="${feature}"]`);
        dot.style.background = "var(--primary)";
        dot.style.boxShadow = "0 0 15px var(--primary)";

        setTimeout(() => {
            scannedFeatures[feature] = scanFeaturesDetails[feature].val;
            
            scanTitleEl.innerHTML = `✅ ${scanFeaturesDetails[feature].name} 스캔 완료!`;
            scanDescEl.innerHTML = scanFeaturesDetails[feature].text;
            dot.style.background = "var(--secondary)";
            dot.style.boxShadow = "0 0 10px var(--secondary)";

            // Update Feature vector text
            const earVal = scannedFeatures.ear !== null ? scannedFeatures.ear : "?";
            const colorVal = scannedFeatures.color !== null ? scannedFeatures.color : "?";
            const weightVal = scannedFeatures.weight !== null ? scannedFeatures.weight : "?";
            
            vectorDisplay.innerHTML = `[ ${earVal} , ${colorVal} , ${weightVal} ]`;

            // If all features scanned, show success
            if (scannedFeatures.ear !== null && scannedFeatures.color !== null && scannedFeatures.weight !== null) {
                vectorDisplay.style.color = "var(--primary)";
                vectorDisplay.style.textShadow = "0 0 15px var(--primary-glow)";
                scanDescEl.innerHTML += "<br><br><strong style='color:var(--primary);'>🎉 모든 특징 추출 완료!</strong> 3차원 특징 벡터 데이터가 머신러닝 학습 모델로 즉시 입력될 준비가 끝났습니다.";
            }
        }, 1000);
    };


    // ==================== STEP 4: NEURON MAPPING ====================
    const neuronMappings = {
        dendrite: {
            title: "🌿 가지돌기 (Dendrite) ➔ 입력 데이터 (Inputs)",
            desc: "생물 뉴런에서 외부 자극이나 이전 신경세포들로부터 전달된 다양한 전기적 신호들을 빨아들이는 나뭇가지 모양의 촉수예요. 인공신경망 코딩에서는 모델에 입력되는 수치값들(x1, x2, x3 등)에 대칭된답니다."
        },
        synapse: {
            title: "🔌 시냅스 (Synapse) ➔ 가중치 (Weights)",
            desc: "두 뉴런의 가지돌기와 축삭돌기가 맞물려 만나는 초미세 연결 틈새예요. 학습이 거듭될수록 틈새의 물리적 결합도가 달라져 신호 세기를 조절합니다. 인공신경망의 가중치(Weight, w)와 정확히 똑같아 길의 굵기(중요도) 역할을 수행합니다."
        },
        soma: {
            title: "🔋 세포체 (Soma / Cell Body) ➔ 가중합 & 활성화 함수",
            desc: "가지돌기들로 받아들인 온갖 미세 자극 신호들을 더한 뒤(가중합, Sum), 이 합이 세포체 고유의 역치(Threshold)를 넘는 충분한 강도일 때만 다음으로 전기 신호를 전달하는 밸브 역할을 해요. 인공신경망의 수학적 가중합 연산과 전달 여부를 판단하는 활성화 함수(Activation Function)가 여기에 해당해요!"
        },
        axon: {
            title: "⚡ 축삭돌기 (Axon) ➔ 최종 출력값 (Output)",
            desc: "세포체에서 출력하기로 최종 결정한 활성화 전기 자극(1 혹은 0)을 다음 목적지의 뉴런 세포로 빠르게 수송해주는 고속도로 선로입니다. 인공신경망 연산의 최종 종착지인 분류 결과(가위바위보 판정 값 y) 또는 다음 레이어로 넘어가는 출력 신호와 대응돼요."
        }
    };

    window.selectNeuron = function(part) {
        document.querySelectorAll(".neuron-card").forEach(card => {
            card.classList.remove("selected");
        });
        
        const selectedCard = document.querySelector(`.neuron-card[data-neuron="${part}"]`);
        selectedCard.classList.add("selected");

        const info = neuronMappings[part];
        const infoBox = document.getElementById("neuron-info-box");
        
        document.getElementById("neuron-title").innerHTML = info.title;
        document.getElementById("neuron-desc").textContent = info.desc;
        
        infoBox.style.borderLeftColor = "var(--primary)";
        infoBox.style.background = "rgba(0, 255, 102, 0.05)";
    };


    // ==================== STEP 5: WEBCAM TEACHABLE MACHINE & ROBOT ARM ====================
    const video = document.getElementById("camera-video");
    const canvas = document.getElementById("camera-canvas");
    const ctx = canvas.getContext("2d");
    const cameraSelect = document.getElementById("camera-select");
    const cameraLoading = document.getElementById("camera-loading");
    const cameraLoadingText = document.getElementById("camera-loading-text");
    
    const btnGatherRock = document.getElementById("btn-gather-rock");
    const btnGatherScissors = document.getElementById("btn-gather-scissors");
    const btnGatherPaper = document.getElementById("btn-gather-paper");
    const btnResetData = document.getElementById("btn-reset-data");
    const btnTrain = document.getElementById("btn-train");

    const gaugeRock = document.getElementById("gauge-rock");
    const gaugeScissors = document.getElementById("gauge-scissors");
    const gaugePaper = document.getElementById("gauge-paper");
    
    const countRock = document.getElementById("count-rock");
    const countScissors = document.getElementById("count-scissors");
    const countPaper = document.getElementById("count-paper");
    
    const serialLogs = document.getElementById("serial-logs");
    const ledPin13 = document.getElementById("arduino-led-pin13");
    const ledStateText = document.getElementById("led-state-text");
    const predictLabel = document.getElementById("predict-label");
    const predictConfidence = document.getElementById("predict-confidence");

    let stream = null;
    let cameraHelper = null;
    let hands = null;
    let isMediaPipeInited = false;
    
    const trainingData = { rock: [], scissors: [], paper: [] };
    const maxFrames = 15;
    let isTrained = false;

    const gatheringState = {
        active: false,
        className: "",
        count: 0
    };

    const handConnections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17] // Knuckles
    ];

    function logSerial(text) {
        const timeStr = new Date().toLocaleTimeString();
        serialLogs.innerHTML += `[${timeStr}] ${text}<br>`;
        serialLogs.scrollTop = serialLogs.scrollHeight;
    }

    // Enumerate video devices
    async function initDeviceList() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === "videoinput");
            
            cameraSelect.innerHTML = "";
            if (videoDevices.length === 0) {
                cameraSelect.innerHTML = "<option value=''>검색된 카메라 없음</option>";
                return;
            }

            videoDevices.forEach((device, index) => {
                const opt = document.createElement("option");
                opt.value = device.deviceId;
                opt.text = device.label || `카메라 ${index + 1}`;
                cameraSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("장치 나열 에러:", err);
        }
    }

    // Set custom drawing logic for landmarks skeleton
    function drawHand(ctx, landmarks) {
        ctx.save();
        // Clear canvas is handled globally in result callback
        ctx.strokeStyle = "#00ff66";
        ctx.lineWidth = 3;
        
        // Draw bones
        handConnections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            ctx.beginPath();
            ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
            ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
            ctx.stroke();
        });

        // Draw joint points
        ctx.fillStyle = "#00d2ff";
        landmarks.forEach((pt, idx) => {
            ctx.beginPath();
            ctx.arc(pt.x * canvas.width, pt.y * canvas.height, idx === 0 || idx % 4 === 0 ? 5 : 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.restore();
    }

    // Normalize coordinates: Relative to wrist(0) and scale by wrist-middle mcp(9) distance
    function extractFeatures(landmarks) {
        const wrist = landmarks[0];
        const relative = landmarks.map(lm => ({
            x: lm.x - wrist.x,
            y: lm.y - wrist.y
        }));

        const scale = Math.sqrt(
            relative[9].x * relative[9].x + relative[9].y * relative[9].y
        );

        if (scale < 0.005) return null; // Avoid tiny scale or noise division

        const features = [];
        // Extract 20 normalized coordinates pairs (relative coordinates scaled)
        for (let i = 1; i < 21; i++) {
            features.push(relative[i].x / scale, relative[i].y / scale);
        }
        return features;
    }

    // KNN Classifier logic
    function predictKNN(testFeatures, k = 5) {
        const distances = [];
        
        for (const label in trainingData) {
            trainingData[label].forEach(features => {
                let sumSq = 0;
                for (let i = 0; i < testFeatures.length; i++) {
                    const diff = testFeatures[i] - features[i];
                    sumSq += diff * diff;
                }
                distances.push({ label, distance: Math.sqrt(sumSq) });
            });
        }

        if (distances.length === 0) return null;

        // Sort by distance ascending
        distances.sort((a, b) => a.distance - b.distance);

        // Take K nearest neighbors
        const topK = distances.slice(0, Math.min(k, distances.length));

        // Vote count
        const votes = { rock: 0, scissors: 0, paper: 0 };
        topK.forEach(n => {
            votes[n.label]++;
        });

        let maxVotes = -1;
        let predClass = "rock";
        for (const label in votes) {
            if (votes[label] > maxVotes) {
                maxVotes = votes[label];
                predClass = label;
            }
        }

        const confidence = Math.round((maxVotes / topK.length) * 100);
        return { label: predClass, confidence };
    }

    // Handle MediaPipe hands callbacks
    function onHandResults(results) {
        // Adjust canvas resolution dynamically
        if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Draw visual skeleton
            drawHand(ctx, landmarks);

            // GATHER DATA PHASE
            if (gatheringState.active) {
                const features = extractFeatures(landmarks);
                if (features) {
                    const cName = gatheringState.className;
                    trainingData[cName].push(features);
                    gatheringState.count++;
                    
                    updateGatherUI(cName);

                    if (gatheringState.count >= maxFrames) {
                        logSerial(`[SERIAL] Collected 15 frames for ${cName.toUpperCase()}.`);
                        stopGathering();
                    }
                }
            }

            // REAL-TIME PREDICTION ACTIVE
            if (isTrained && !gatheringState.active) {
                const features = extractFeatures(landmarks);
                if (features) {
                    const pred = predictKNN(features);
                    if (pred && pred.confidence >= 60) {
                        displayPrediction(pred.label, pred.confidence);
                        controlRobotArm(pred.label);
                    }
                }
            }
        }
    }

    function updateGatherUI(cName) {
        const count = trainingData[cName].length;
        const fillPercent = Math.min(100, (count / maxFrames) * 100);
        
        document.getElementById(`gauge-${cName}`).style.width = `${fillPercent}%`;
        document.getElementById(`count-${cName}`).textContent = `${count} / ${maxFrames} frames`;

        checkTrainable();
    }

    function checkTrainable() {
        const isRockReady = trainingData.rock.length >= 10;
        const isScissorsReady = trainingData.scissors.length >= 10;
        const isPaperReady = trainingData.paper.length >= 10;

        btnTrain.disabled = !(isRockReady && isScissorsReady && isPaperReady);
    }

    let gatherInterval = null;
    function startGathering(className) {
        if (gatheringState.active) return;
        
        gatheringState.active = true;
        gatheringState.className = className;
        gatheringState.count = 0;
        trainingData[className] = []; // Reset this class set

        const btn = document.getElementById(`btn-gather-${className}`);
        btn.textContent = "수집 중...";
        btn.style.background = "var(--primary)";
        btn.style.color = "#000";

        logSerial(`[SERIAL] Data gathering started for: ${className.toUpperCase()}`);

        // Safety timeout
        gatherInterval = setTimeout(() => {
            if (gatheringState.active) {
                logSerial("[SERIAL] Gathering timeout. Try again.");
                stopGathering();
            }
        }, 8000);
    }

    function stopGathering() {
        if (!gatheringState.active) return;
        
        clearTimeout(gatherInterval);
        const className = gatheringState.className;
        const btn = document.getElementById(`btn-gather-${className}`);
        
        let label = "주먹 수집";
        if (className === "scissors") label = "가위 수집";
        if (className === "paper") label = "보자기 수집";
        
        btn.textContent = label;
        btn.style.background = "";
        btn.style.color = "";

        gatheringState.active = false;
        checkTrainable();
    }

    // Set buttons listeners
    btnGatherRock.addEventListener("click", () => startGathering("rock"));
    btnGatherScissors.addEventListener("click", () => startGathering("scissors"));
    btnGatherPaper.addEventListener("click", () => startGathering("paper"));

    btnResetData.addEventListener("click", () => {
        trainingData.rock = [];
        trainingData.scissors = [];
        trainingData.paper = [];
        isTrained = false;

        updateGatherUI("rock");
        updateGatherUI("scissors");
        updateGatherUI("paper");

        btnTrain.disabled = true;
        btnTrain.textContent = "🤖 인공신경망 학습 (Train)";
        
        predictLabel.textContent = "모델 미학습";
        predictConfidence.textContent = "--%";
        
        document.getElementById("completion-banner").style.display = "none";
        
        ledPin13.classList.remove("active");
        ledStateText.textContent = "LOW (OFF)";
        
        logSerial("[SERIAL] Training datasets cleared.");
        resetRobotHand();
    });

    btnTrain.addEventListener("click", () => {
        btnTrain.disabled = true;
        btnTrain.textContent = "⚙️ 학습 연산 중...";
        logSerial("[SERIAL] Training Feedforward KNN network...");

        let ep = 1;
        const maxEp = 50;
        const speed = 100;
        
        const loader = setInterval(() => {
            const loss = (1.2 / ep).toFixed(4);
            const acc = (50 + (ep / maxEp) * 49).toFixed(1);
            
            logSerial(`[SERIAL] Network Optimization Epoch ${ep}/${maxEp} | Loss: ${loss} | Acc: ${acc}%`);
            ep += 5;

            if (ep > maxEp) {
                clearInterval(loader);
                isTrained = true;
                btnTrain.textContent = "✅ 학습 완료!";
                logSerial("[SERIAL] Training complete! Neural network weights locked.");
                logSerial("[SERIAL] Starting real-time camera predictions...");
                
                if (currentStep === totalSteps) {
                    completionBanner.style.display = "block";
                }
            }
        }, speed);
    });

    function displayPrediction(label, conf) {
        let text = "주먹 (ROCK)";
        if (label === "scissors") text = "가위 (SCISSORS)";
        if (label === "paper") text = "보자기 (PAPER)";

        predictLabel.textContent = text;
        predictConfidence.textContent = `${conf}%`;
    }

    // SVG Robot Arm Joint mapping and LED feedback
    function controlRobotArm(userMove) {
        const lowerArm = document.getElementById("lower-arm");
        const upperArm = document.getElementById("upper-arm");
        
        // Define winning strategy
        let robotMove = "paper"; // paper beats rock
        let lowerRot = -10;
        let upperRot = 80;

        if (userMove === "scissors") {
            robotMove = "rock"; // rock beats scissors
            lowerRot = -45;
            upperRot = 35;
        } else if (userMove === "paper") {
            robotMove = "scissors"; // scissors beat paper
            lowerRot = -25;
            upperRot = 65;
        }

        // Apply transformations smoothly
        lowerArm.style.transform = `rotate(${lowerRot}deg 100 160)`;
        upperArm.style.transform = `rotate(${upperRot}deg 100 90)`;

        // Update robot hand posture in SVG
        document.getElementById("robot-hand-rock").style.display = robotMove === "rock" ? "block" : "none";
        document.getElementById("robot-hand-scissors").style.display = robotMove === "scissors" ? "block" : "none";
        document.getElementById("robot-hand-paper").style.display = robotMove === "paper" ? "block" : "none";
        document.getElementById("robot-hand-neutral").style.display = "none";

        // Turn on Arduino Pin 13 LED
        ledPin13.classList.add("active");
        ledStateText.textContent = "HIGH (ON)";

        // Serial logging
        logSerial(`[SERIAL] Gesture: ${userMove.toUpperCase()} | Winning response: ${robotMove.toUpperCase()} | Servo active | PIN13: HIGH`);
    }

    function resetRobotHand() {
        const lowerArm = document.getElementById("lower-arm");
        const upperArm = document.getElementById("upper-arm");

        lowerArm.style.transform = "rotate(-30deg 100 160)";
        upperArm.style.transform = "rotate(60deg 100 90)";

        document.getElementById("robot-hand-rock").style.display = "none";
        document.getElementById("robot-hand-scissors").style.display = "none";
        document.getElementById("robot-hand-paper").style.display = "none";
        document.getElementById("robot-hand-neutral").style.display = "block";
    }

    // MediaPipe Hands initializing
    async function startWebcam() {
        if (stream) return;
        
        cameraLoading.style.display = "flex";
        cameraLoadingText.textContent = "미디어파이프 비전 모듈 가동 중...";

        if (!isMediaPipeInited) {
            hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.6,
                minTrackingConfidence: 0.6
            });

            hands.onResults(onHandResults);
            isMediaPipeInited = true;
        }

        cameraLoadingText.textContent = "카메라 장치 스트리밍 초기화 중...";

        const devId = cameraSelect.value;
        const videoConstraints = devId ? { deviceId: { exact: devId }, width: 640, height: 480 } : { width: 640, height: 480 };

        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
            video.srcObject = stream;
            
            cameraHelper = new Camera(video, {
                onFrame: async () => {
                    if (stream) {
                        await hands.send({ image: video });
                    }
                },
                width: 640,
                height: 480
            });

            cameraHelper.start();
            cameraLoading.style.display = "none";
            logSerial("[SERIAL] Webcam sensor stream active. Serial port opened.");
        } catch (err) {
            console.error("웹캠 스트림 에러:", err);
            cameraLoadingText.textContent = "비디오 스트림 로딩 에러! 브라우저 권한을 수락했거나 다른 프로그램이 웹캠을 선점했는지 확인해 주세요.";
            logSerial("[SERIAL] ERROR: Cannot establish USB serial camera stream.");
        }
    }

    function stopWebcam() {
        if (cameraHelper) {
            cameraHelper.stop();
            cameraHelper = null;
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        logSerial("[SERIAL] Camera stream suspended. Serial connection closed.");
    }

    cameraSelect.addEventListener("change", () => {
        stopWebcam();
        setTimeout(startWebcam, 300);
    });

    initDeviceList();

    // Enable smooth SVG transformations
    document.getElementById("lower-arm").style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    document.getElementById("upper-arm").style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";


    // ==================== STEP 6: DIAGNOSTIC QUIZ SYSTEM ====================
    const quizQuestions = [
        {
            title: "Q1. 인공지능, 머신러닝, 딥러닝 포함 관계와 핵심 원리에 대한 설명 중 잘못된 것은 무엇인가요?",
            options: [
                "인공지능은 뇌를 모방한 딥러닝과 데이터 중심 머신러닝을 포괄하는 광범위한 기술 분야이다.",
                "머신러닝은 개발자가 사전에 모든 작동 조건(If-Else)을 코딩하지 않고 데이터를 활용해 배운다.",
                "딥러닝은 머신러닝과 별개의 독립된 기술이며 세포체 매핑 연산을 전혀 활용하지 않는다.",
                "알파고처럼 바둑 한 분야만 극단적으로 전문화하여 해내는 수준은 '약인공지능'에 속한다."
            ],
            ansIdx: 2,
            explain: "틀렸습니다! 딥러닝은 머신러닝의 한 종류(하위 기술)이며, 뇌신경망의 구조를 고도로 수학적 결합한 모형입니다."
        },
        {
            title: "Q2. 톰 미첼 교수가 정의한 머신러닝 공식 중 '농구 자유투 연습을 반복적으로 1,000회 수행하여 수집한 데이터'는 T-E-P 중 어디에 해당할까요?",
            options: [
                "T (Task - 작업)",
                "E (Experience - 경험 / 학습 데이터)",
                "P (Performance - 성능 평가 지표)"
            ],
            ansIdx: 1,
            explain: "정답입니다! 반복하여 얻는 훈련 경험 데이터는 E(Experience)에 완벽히 상응합니다."
        },
        {
            title: "Q3. 생물학적 뉴런에서 주변의 미세한 전기 자극을 받아들이는 '가지돌기(Dendrite)'는 인공신경망의 어떤 요소에 매핑(Mapping)되나요?",
            options: [
                "입력값 (Inputs)",
                "가중치 (Weights)",
                "세포체 가중합 연산",
                "출력값 (Outputs)"
            ],
            ansIdx: 0,
            explain: "정답입니다! 가지돌기는 인공신경망에 처음 들어오는 입력값(x1, x2, x3 등)과 일치합니다."
        },
        {
            title: "Q4. 정답(레이블)이 없는 비지도학습의 '군집화(Clustering)' 성능을 평가하기 위한 올바른 척도 조건은?",
            options: [
                "동일 군집 친구들은 멀리 흩어져야(낮은 응집도) 하고, 타 그룹과는 가까워야(낮은 분리도) 한다.",
                "동일 군집끼리는 빽빽하게 모여야(높은 응집도) 하고, 타 그룹과는 확실히 멀어져야(높은 분리도) 한다.",
                "비지도학습은 군집화 응집도 척도가 존재하지 않는다.",
                "이진 분류기 손실 값을 평균 제곱 오차 공식으로 유도해야만 군집 평가를 완료할 수 있다."
            ],
            ansIdx: 1,
            explain: "정답입니다! 훌륭한 군집화 모형은 높은 응집도(Cohesion)와 높은 분리도(Separation)를 동시에 가집니다."
        }
    ];

    let currentQIdx = 0;
    let quizScore = 0;

    const quizModal = document.getElementById("quiz-modal");
    const certModal = document.getElementById("certificate-modal");
    const btnStartQuiz = document.getElementById("btn-start-quiz");
    const btnCloseQuiz = document.getElementById("btn-close-quiz");
    const quizQuestionContainer = document.getElementById("quiz-question-container");
    const quizProgressText = document.getElementById("quiz-progress-text");

    btnStartQuiz.addEventListener("click", () => {
        currentQIdx = 0;
        quizScore = 0;
        quizModal.style.display = "flex";
        loadQuestion();
    });

    btnCloseQuiz.addEventListener("click", () => {
        quizModal.style.display = "none";
    });

    function loadQuestion() {
        const q = quizQuestions[currentQIdx];
        quizProgressText.textContent = `Q${currentQIdx + 1} / ${quizQuestions.length}`;

        let optionsHtml = q.options.map((opt, idx) => `
            <div class="quiz-option" data-idx="${idx}">${opt}</div>
        `).join("");

        quizQuestionContainer.innerHTML = `
            <div class="quiz-question">
                <div class="quiz-question-title" style="color:#fff;">${q.title}</div>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
                <div id="quiz-explain-box" class="info-box tip" style="display:none; margin-top: 1rem;"></div>
            </div>
        `;

        // Bind option click events
        const opts = quizQuestionContainer.querySelectorAll(".quiz-option");
        let answeredThis = false;

        opts.forEach(opt => {
            opt.addEventListener("click", () => {
                if (answeredThis) return;
                
                const selectedIdx = parseInt(opt.dataset.idx);
                const isCorrect = selectedIdx === q.ansIdx;

                opts.forEach(o => o.classList.remove("correct", "incorrect"));
                
                const explainBox = document.getElementById("quiz-explain-box");
                explainBox.style.display = "block";

                if (isCorrect) {
                    opt.classList.add("correct");
                    explainBox.innerHTML = `<strong>✨ 정답입니다!</strong><br>${q.explain || ""}`;
                    explainBox.className = "info-box tip";
                    quizScore++;
                    answeredThis = true;
                    
                    // Move to next question after 1.5 seconds
                    setTimeout(() => {
                        currentQIdx++;
                        if (currentQIdx < quizQuestions.length) {
                            loadQuestion();
                        } else {
                            // Finish quiz, show certificate
                            quizModal.style.display = "none";
                            showCertificate();
                        }
                    }, 1500);
                } else {
                    opt.classList.add("incorrect");
                    explainBox.innerHTML = `<strong>❌ 오답입니다. 다시 도전해 보세요!</strong>`;
                    explainBox.className = "info-box warning";
                    
                    // Shake effect reset
                    setTimeout(() => {
                        opt.classList.remove("incorrect");
                    }, 800);
                }
            });
        });
    }

    function showCertificate() {
        certModal.style.display = "flex";
        
        // Fire confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Certificate events
    document.getElementById("btn-cert-restart").addEventListener("click", () => {
        certModal.style.display = "none";
        currentQIdx = 0;
        quizScore = 0;
        quizModal.style.display = "flex";
        loadQuestion();
    });

    document.getElementById("btn-cert-done").addEventListener("click", () => {
        const nameInput = document.getElementById("student-name-input");
        const studentName = nameInput.value.trim() || "예비 AI 마스터";
        
        alert(`🎉 축하합니다, ${studentName} 학생! 로봇 지능 마스터 수료 완료!\n앞으로 멋진 기술 공학도로 거듭나세요!`);
        certModal.style.display = "none";
    });

});
