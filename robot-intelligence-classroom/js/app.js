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
            title: "💻 인공지능 (AI) - 사람의 판단을 도와주는 기술",
            desc: "AI는 컴퓨터가 사진을 알아보고, 말을 번역하고, 추천을 해 주는 넓은 기술 이름입니다. 오늘 만드는 손동작 인식 로봇도 AI의 한 예입니다.",
            color: "#3b82f6"
        },
        ml: {
            title: "📊 머신러닝 (ML) - 예시를 보고 배우는 AI",
            desc: "머신러닝은 컴퓨터에게 여러 예시를 보여 주고 비슷한 점을 찾게 하는 방법입니다. 주먹, 가위, 보 예시를 모으면 새 손 모양도 어느 쪽에 가까운지 판단할 수 있습니다.",
            color: "var(--secondary)"
        },
        dl: {
            title: "🧠 딥러닝 (DL) - 사진 속 힌트를 여러 단계로 찾는 방법",
            desc: "딥러닝은 머신러닝의 한 종류입니다. 사진에서 선, 모서리, 부분 모양, 전체 모습처럼 힌트를 차례로 찾아 복잡한 그림이나 소리를 잘 구별합니다.",
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


    // ==================== STEP 2: PRACTICE DATA BASKETBALL SIMULATION ====================
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
        ear: { name: "귀 모양 힌트", val: 0.8, text: "귀가 얼마나 둥근지 숫자로 바꿨습니다. 이 강아지의 귀 힌트는 <strong>0.8</strong>입니다." },
        color: { name: "털 색 힌트", val: 1.2, text: "털의 밝기와 색 느낌을 숫자로 바꿨습니다. 털 색 힌트는 <strong>1.2</strong>입니다." },
        weight: { name: "크기와 무게 힌트", val: 5.5, text: "사진 속 크기를 바탕으로 무게를 추정했습니다. 무게 힌트는 <strong>5.5 kg</strong>입니다." }
    };

    window.scanFeature = function(feature, top, left) {
        const scanBox = document.getElementById("scan-info-box");
        const scanTitleEl = document.getElementById("scan-title");
        const scanDescEl = document.getElementById("scan-desc");
        const vectorDisplay = document.getElementById("feature-vector-display");

        // Set scanning log
        scanTitleEl.innerHTML = `🛰️ ${scanFeaturesDetails[feature].name} 스캔 중...`;
        scanDescEl.textContent = "AI가 사진 속 힌트를 숫자로 바꾸는 중입니다.";
        
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
                scanDescEl.innerHTML += "<br><br><strong style='color:var(--primary);'>모든 힌트 찾기 완료!</strong> 이제 AI가 볼 수 있는 숫자 자료가 준비되었습니다.";
            }
        }, 1000);
    };


    // ==================== STEP 4: NEURON MAPPING ====================
    const neuronMappings = {
        dendrite: {
            title: "가지돌기 ➔ 처음 들어오는 숫자 힌트",
            desc: "사진이나 센서에서 들어온 정보를 받아들이는 입구입니다. AI에서는 처음 입력되는 숫자 자료라고 생각하면 됩니다."
        },
        synapse: {
            title: "시냅스 ➔ 중요한 힌트에 더 큰 점수",
            desc: "AI는 모든 힌트를 똑같이 보지 않습니다. 어떤 힌트가 더 중요한지 점수를 다르게 주며 판단합니다."
        },
        soma: {
            title: "세포체 ➔ 힌트를 모아 판단",
            desc: "여러 힌트를 모아서 다음 단계로 보낼 만큼 중요한 정보인지 판단합니다."
        },
        axon: {
            title: "축삭돌기 ➔ 다음 단계로 보내는 결과",
            desc: "모은 힌트로 판단한 결과를 다음 단계나 최종 답으로 보냅니다."
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
                        logSerial(`[SERIAL] ${cName.toUpperCase()} example data collected: 15 frames.`);
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
        btnTrain.textContent = "AI 분류 모델 만들기";
        
        predictLabel.textContent = "모델 미학습";
        predictConfidence.textContent = "--%";
        
        document.getElementById("completion-banner").style.display = "none";
        
        ledPin13.classList.remove("active");
        ledStateText.textContent = "LOW (OFF)";
        
        logSerial("[SERIAL] Example data cleared.");
        resetRobotHand();
    });

    btnTrain.addEventListener("click", () => {
        btnTrain.disabled = true;
        btnTrain.textContent = "비슷한 예시 찾는 중...";
        logSerial("[SERIAL] Building a simple KNN classifier from examples...");

        let ep = 1;
        const maxEp = 50;
        const speed = 100;
        
        const loader = setInterval(() => {
            const loss = (1.2 / ep).toFixed(4);
            const acc = (50 + (ep / maxEp) * 49).toFixed(1);
            
            logSerial(`[SERIAL] Organizing example data ${ep}/${maxEp} | Similarity score: ${acc}%`);
            ep += 5;

            if (ep > maxEp) {
                clearInterval(loader);
                isTrained = true;
                btnTrain.textContent = "학습 완료";
                logSerial("[SERIAL] KNN classifier is ready.");
                logSerial("[SERIAL] Show your hand to start real-time predictions.");
                
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
            title: "Q1. 오늘 배운 AI, 머신러닝, 딥러닝 설명 중 잘못된 것은 무엇인가요?",
            options: [
                "AI는 컴퓨터가 사진을 알아보고 추천을 하는 등 사람의 판단을 도와주는 넓은 기술 이름이다.",
                "머신러닝은 예시 데이터를 보고 비슷한 점을 찾아 배우는 방법이다.",
                "딥러닝은 머신러닝과 전혀 상관없는 완전히 다른 기술이다.",
                "오늘 만드는 손동작 인식 로봇은 정해진 일을 잘하는 좁은 AI에 가깝다."
            ],
            ansIdx: 2,
            explain: "딥러닝은 머신러닝의 한 종류입니다. 사진 속 힌트를 여러 단계로 찾는 데 강합니다."
        },
        {
            title: "Q2. AI에게 주먹, 가위, 보 손 모양을 여러 번 보여 주는 것은 무엇을 모으는 과정일까요?",
            options: [
                "학습에 사용할 예시 데이터",
                "로봇 팔의 전기 배선",
                "퀴즈 점수"
            ],
            ansIdx: 0,
            explain: "정답입니다. AI는 예시 데이터를 보고 새 손 모양이 무엇과 비슷한지 판단합니다."
        },
        {
            title: "Q3. AI가 사진이나 손동작을 구별할 때 먼저 찾는 중요한 단서는 무엇이라고 부를까요?",
            options: [
                "특징 또는 힌트",
                "배경 음악",
                "파일 이름",
                "버튼 색깔"
            ],
            ansIdx: 0,
            explain: "정답입니다. AI는 손가락 위치, 모양, 색처럼 구별에 도움이 되는 특징을 숫자로 바꿔 봅니다."
        },
        {
            title: "Q4. 이 사이트의 가위바위보 실습은 새 손 모양을 어떻게 판단하나요?",
            options: [
                "전에 모은 예시 중 가장 비슷한 손 모양들을 찾아 다수결로 판단한다.",
                "학생의 이름을 보고 주먹, 가위, 보를 정한다.",
                "로봇 팔이 먼저 움직인 뒤 AI가 답을 맞힌다.",
                "인터넷 검색 결과로 손 모양을 판단한다."
            ],
            ansIdx: 0,
            explain: "정답입니다. 손가락 위치를 숫자로 바꾼 뒤, 저장된 예시와 가까운 쪽을 찾는 KNN 방식에 가깝습니다."
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
        
        alert(`축하합니다, ${studentName} 학생! AI 로봇 만들기 수료 완료!\n데이터가 어떻게 판단과 행동으로 이어지는지 멋지게 이해했어요.`);
        certModal.style.display = "none";
    });

});
