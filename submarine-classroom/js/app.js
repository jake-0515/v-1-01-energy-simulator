document.addEventListener("DOMContentLoaded", () => {
    // ==================== GLOBAL STATES ====================
    let currentStep = 1;
    const totalSteps = 5;

    // ==================== TAB NAVIGATION ====================
    const stepIndicators = document.querySelectorAll(".step-indicator");
    const progressLineFill = document.getElementById("progress-fill");
    const tabContents = document.querySelectorAll(".tab-content");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const completionBanner = document.getElementById("completion-banner");

    function updateStepUI() {
        const fillPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressLineFill.style.width = `${fillPercent}%`;

        stepIndicators.forEach((indicator, idx) => {
            const stepNum = idx + 1;
            indicator.classList.remove("active", "completed");
            if (stepNum === currentStep) {
                indicator.classList.add("active");
            } else if (stepNum < currentStep) {
                indicator.classList.add("completed");
            }
        });

        tabContents.forEach((tab, idx) => {
            tab.classList.remove("active");
            if (idx + 1 === currentStep) {
                tab.classList.add("active");
            }
        });

        btnPrev.disabled = currentStep === 1;

        if (currentStep === totalSteps) {
            btnNext.style.display = "none";
            completionBanner.style.display = "block";
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
        }
    });

    stepIndicators.forEach((indicator, idx) => {
        indicator.addEventListener("click", () => {
            currentStep = idx + 1;
            updateStepUI();
        });
    });


    // ==================== STEP 1: DEPTH & PRESSURE SIMULATOR ====================
    const depthSlider = document.getElementById("depth-slider");
    const depthDisplayVal = document.getElementById("depth-display-val");
    const pressureVal = document.getElementById("pressure-val");
    const lightVal = document.getElementById("light-val");
    const depthInfoTitle = document.getElementById("depth-info-title");
    const depthInfoDesc = document.getElementById("depth-info-desc");
    const depthInfoBox = document.getElementById("depth-info-box");

    depthSlider.addEventListener("input", () => {
        const depth = parseInt(depthSlider.value);
        depthDisplayVal.textContent = `${depth} m`;

        // Pressure calculation: 1 atm at surface + 1 atm per 10m
        const pressure = (1 + depth / 10).toFixed(1);
        pressureVal.textContent = `${pressure} 기압 (atm)`;

        // Light penetration
        let light = Math.max(0, 100 - Math.floor(depth / 2));
        if (depth > 200) light = 0;
        lightVal.textContent = `${light}% (${light > 50 ? '밝음' : light > 0 ? '어두움' : '완전 암흑'})`;

        // Update info box text
        if (depth < 200) {
            depthInfoTitle.textContent = "💡 햇빛 침투층 (0m ~ 200m)";
            depthInfoDesc.textContent = "햇빛이 도달하는 영역입니다. 일반 디젤 잠수함이 파이프(스노클)를 내밀어 산소를 마실 수 있는 수심 범위입니다.";
            depthInfoBox.className = "info-box tip";
        } else if (depth < 1000) {
            depthInfoTitle.textContent = "🌌 약광층 / 황혼층 (200m ~ 1,000m)";
            depthInfoDesc.textContent = "빛이 거의 사라진 칠흑 같은 암흑 세계입니다. 수압이 30~100기압에 달해 일반 해양 생물도 버티기 어렵고, 최신 군용 잠수함들이 은밀히 작전하는 깊이입니다.";
            depthInfoBox.className = "info-box orange";
        } else {
            depthInfoTitle.textContent = "⚓ 심해 아비살 존 (1,000m ~ 2,500m+)";
            depthInfoDesc.textContent = "수압이 무려 100~250기압을 넘는 극한의 영역입니다. 티타늄 특수 합금 원형 입체 압력각 잠수정만 진입 가능한 사투의 공간입니다.";
            depthInfoBox.className = "info-box danger";
        }
    });


    // ==================== STEP 2: BALLAST TANK & BUOYANCY SIMULATOR ====================
    let waterRatio = 0; // Initial 0% (surfaced)
    const subVisual = document.getElementById("sub-visual");
    const svgWaterFill = document.getElementById("svg-water-fill");
    const seesawBar = document.getElementById("seesaw-bar");
    const labelWeight = document.getElementById("label-weight");
    const labelBuoyancy = document.getElementById("label-buoyancy");
    const subBuoyancyStatusText = document.getElementById("sub-buoyancy-status-text");

    const btnFillWater = document.getElementById("btn-fill-water");
    const btnBlowAir = document.getElementById("btn-blow-air");
    const btnNeutralBuoyancy = document.getElementById("btn-neutral-buoyancy");

    function updateBallastSimulator() {
        // Water ratio bounded 0 to 100
        waterRatio = Math.max(0, Math.min(100, waterRatio));

        // SVG fill visual
        svgWaterFill.setAttribute("width", `${waterRatio}`);
        svgWaterFill.setAttribute("fill", `rgba(0, 240, 255, ${0.15 + (waterRatio / 100) * 0.65})`);

        // Submarine Y Position (Water level top is 35px, viewport height 220px)
        // 0% water = top 40px (surface), 100% water = top 140px (deep submerged)
        const subTop = 45 + (waterRatio / 100) * 95;
        subVisual.style.top = `${subTop}px`;

        // Seesaw Balance Angle: waterRatio = 50 -> 0deg, 100 -> +15deg (tilted weight), 0 -> -15deg (tilted buoyancy)
        const tilt = (waterRatio - 50) * 0.3;
        seesawBar.style.transform = `rotate(${tilt}deg)`;

        labelWeight.textContent = `무게(중력): ${waterRatio}%`;
        labelBuoyancy.textContent = `부력: ${100 - waterRatio}%`;

        if (subBuoyancyStatusText) {
            if (waterRatio > 50) {
                subBuoyancyStatusText.textContent = "⚓ 심해 잠항 가라앉는 중 (무게 > 부력)";
                subBuoyancyStatusText.style.color = "var(--secondary)";
            } else if (waterRatio < 50) {
                subBuoyancyStatusText.textContent = "🎈 수면 부상 떠오르는 중 (부력 > 무게)";
                subBuoyancyStatusText.style.color = "var(--primary)";
            } else {
                subBuoyancyStatusText.textContent = "🎯 수중 정지 중성 부력 상태 (무게 = 부력)";
                subBuoyancyStatusText.style.color = "var(--accent)";
            }
        }

        if (waterRatio > 50) {
            labelWeight.style.background = "var(--danger)";
            labelBuoyancy.style.background = "#334155";
        } else if (waterRatio < 50) {
            labelWeight.style.background = "#334155";
            labelBuoyancy.style.background = "var(--accent)";
        } else {
            labelWeight.style.background = "var(--secondary)";
            labelBuoyancy.style.background = "var(--primary)";
        }
    }

    btnFillWater.addEventListener("click", () => {
        waterRatio += 25;
        updateBallastSimulator();
    });

    btnBlowAir.addEventListener("click", () => {
        waterRatio -= 25;
        updateBallastSimulator();
    });

    if (btnNeutralBuoyancy) {
        btnNeutralBuoyancy.addEventListener("click", () => {
            waterRatio = 50; // Exact 1:1 Neutral Buoyancy
            updateBallastSimulator();
        });
    }

    updateBallastSimulator();


    // ==================== STEP 3: SONAR CANVAS RADAR ====================
    const canvas = document.getElementById("sonar-canvas");
    const ctx = canvas.getContext("2d");
    const btnPing = document.getElementById("btn-ping-sonar");
    const sonarStatus = document.getElementById("sonar-target-status");
    const sonarDistVal = document.getElementById("sonar-distance-val");

    let sweepAngle = 0;
    let pings = []; // Concentric sound wave pulses
    let targetDetected = false;
    let echoWaves = [];

    // Target enemy sub coordinates relative to radar center (160, 160)
    const center = 160;
    const target = { x: 230, y: 90 }; // Top right quadrant
    const targetDistKm = (Math.sqrt((target.x - center)**2 + (target.y - center)**2) * 0.12).toFixed(1);

    function drawSonar() {
        ctx.fillStyle = "#040d1a";
        ctx.fillRect(0, 0, 320, 320);

        // Draw radar concentric circles
        ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
        ctx.lineWidth = 1;
        for (let r = 30; r <= 140; r += 35) {
            ctx.beginPath();
            ctx.arc(center, center, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw radar crosshairs
        ctx.beginPath();
        ctx.moveTo(center, 10); ctx.lineTo(center, 310);
        ctx.moveTo(10, center); ctx.lineTo(310, center);
        ctx.stroke();

        // Draw Radar Sweep line
        sweepAngle += 0.03;
        const sweepX = center + Math.cos(sweepAngle) * 145;
        const sweepY = center + Math.sin(sweepAngle) * 145;

        const gradient = ctx.createConicGradient(sweepAngle, center, center);
        gradient.addColorStop(0, "rgba(0, 255, 136, 0.4)");
        gradient.addColorStop(0.15, "rgba(0, 255, 136, 0.02)");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center, center, 145, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "var(--accent)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(sweepX, sweepY);
        ctx.stroke();

        // Draw Submarine Origin Icon
        ctx.fillStyle = "var(--primary)";
        ctx.beginPath();
        ctx.arc(center, center, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw Active Ping Waves
        pings.forEach((p, idx) => {
            p.radius += 2.5;
            ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 1 - p.radius / 150)})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(center, center, p.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Check collision with enemy target
            const distToTarget = Math.sqrt((target.x - center)**2 + (target.y - center)**2);
            if (!p.hit && Math.abs(p.radius - distToTarget) < 4) {
                p.hit = true;
                targetDetected = true;
                echoWaves.push({ x: target.x, y: target.y, radius: 0 });
            }

            if (p.radius > 150) pings.splice(idx, 1);
        });

        // Draw Echo Return Waves
        echoWaves.forEach((e, idx) => {
            e.radius += 2;
            ctx.strokeStyle = `rgba(255, 102, 0, ${Math.max(0, 1 - e.radius / 80)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.stroke();

            if (e.radius > 80) echoWaves.splice(idx, 1);
        });

        // Draw Target Blip if detected
        if (targetDetected) {
            ctx.fillStyle = "var(--secondary)";
            ctx.shadowColor = "var(--secondary)";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(target.x, target.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            sonarStatus.textContent = "🎯 적함(적 잠수함) 표적 탐지!";
            sonarStatus.style.color = "var(--secondary)";
            sonarDistVal.textContent = `${targetDistKm} km`;
        }

        requestAnimationFrame(drawSonar);
    }

    btnPing.addEventListener("click", () => {
        pings.push({ radius: 5, hit: false });
        btnPing.style.transform = "scale(0.96)";
        setTimeout(() => btnPing.style.transform = "none", 150);
    });

    drawSonar();


    // ==================== STEP 4: AIP FUEL CELL REACTION ====================
    const btnReactFuel = document.getElementById("btn-react-fuel");
    const reactorCore = document.getElementById("reactor-core");
    const powerOutputVal = document.getElementById("power-output-val");

    btnReactFuel.addEventListener("click", () => {
        btnReactFuel.disabled = true;
        btnReactFuel.textContent = "⚡ 반응 진행 중 (2H₂ + O₂ ➔ 2H₂O + Electricity)...";

        reactorCore.style.boxShadow = "0 0 40px var(--accent)";
        reactorCore.style.borderColor = "var(--accent)";

        let power = 0;
        const interval = setInterval(() => {
            power += 25;
            powerOutputVal.textContent = `${power} kW (무소음 전기)`;

            if (power >= 250) {
                clearInterval(interval);
                btnReactFuel.disabled = false;
                btnReactFuel.textContent = "⚡ 화학 반응 진행 완료! (재가동)";
                reactorCore.style.boxShadow = "0 0 20px var(--accent-glow)";
            }
        }, 100);
    });


    // ==================== STEP 5: DIAGNOSTIC QUIZ SYSTEM ====================
    const quizQuestions = [
        {
            title: "Q1. 수심 300m 깊이의 심해에서 잠수함이 받게 되는 대략적인 수압의 크기는 얼마인가요?",
            options: [
                "1 기압 (atm)",
                "약 31 기압 (atm)",
                "약 300 기압 (atm)",
                "0 기압 (무중력)"
            ],
            ansIdx: 1,
            explain: "정답입니다! 표면 1기압 + 수심 10m당 1기압씩 증가하므로 300m에서는 약 31기압의 거대한 수압이 작용합니다."
        },
        {
            title: "Q2. 밸러스트 탱크에 바닷물을 가득 채워 잠수함의 전체 무게를 부력보다 크게 만들어 가라앉게 하는 부력 조절 과정은?",
            options: [
                "부상 (Surfacing)",
                "잠항 (Submerging)",
                "스노클 (Snorkeling)",
                "음파 탐지 (SONAR)"
            ],
            ansIdx: 1,
            explain: "정답입니다! 바닷물을 채워 선체를 무겁게(무게 > 부력) 만드는 물리 현상을 '잠항'이라고 합니다."
        },
        {
            title: "Q3. 디젤 잠수함이 물속에서 오래 머물지 못하고 주기적으로 수면 위로 올라오거나 파이프(스노클)를 내밀어야 했던 치명적 이유는?",
            options: [
                "선원들이 햇빛을 쬐어야만 활력이 생기기 때문에",
                "디젤 엔진으로 배터리를 충전할 때 석유를 태울 산소(O₂)가 필수적이기 때문에",
                "소나(SONAR) 음파 신호가 물속에서는 작동하지 않기 때문에",
                "원자력 연료를 수면 위에서 교체해야 하기 때문에"
            ],
            ansIdx: 1,
            explain: "정답입니다! 디젤 연소에는 산소가 꼭 필요하므로 수면 위로 숨을 쉬러(스노클) 올라와야 하는 '숨 쉬는 물개'의 한계가 있었습니다."
        },
        {
            title: "Q4. 외부 공기(산소) 없이 수소와 산소를 결합하여 무소음 전기와 순수한 물(H₂O)만을 배출하는 잠수함 신기술은?",
            options: [
                "스노클 시스템 (Snorkel System)",
                "디젤 하이브리드 추진기",
                "AIP 공기불요추진 (연료전지)",
                "가죽 주머니 밸러스트 모듈"
            ],
            ansIdx: 2,
            explain: "정답입니다! AIP(Air-Independent Propulsion) 연료전지는 소음 없이 2~3주간 은밀 잠항할 수 있는 기술입니다."
        }
    ];

    let currentQIdx = 0;
    let quizScore = 0;

    const quizModal = document.getElementById("quiz-modal");
    const certModal = document.getElementById("certificate-modal");
    const btnOpenQuizModal = document.getElementById("btn-open-quiz-modal");
    const btnStartQuiz = document.getElementById("btn-start-quiz");
    const btnCloseQuiz = document.getElementById("btn-close-quiz");
    const quizQuestionContainer = document.getElementById("quiz-question-container");
    const quizProgressText = document.getElementById("quiz-progress-text");

    function openQuiz() {
        currentQIdx = 0;
        quizScore = 0;
        quizModal.style.display = "flex";
        loadQuestion();
    }

    btnOpenQuizModal.addEventListener("click", openQuiz);
    btnStartQuiz.addEventListener("click", openQuiz);

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
                    
                    setTimeout(() => {
                        currentQIdx++;
                        if (currentQIdx < quizQuestions.length) {
                            loadQuestion();
                        } else {
                            quizModal.style.display = "none";
                            showCertificate();
                        }
                    }, 1500);
                } else {
                    opt.classList.add("incorrect");
                    explainBox.innerHTML = `<strong>❌ 오답입니다. 다시 선택해 보세요!</strong>`;
                    explainBox.className = "info-box danger";
                    
                    setTimeout(() => {
                        opt.classList.remove("incorrect");
                    }, 800);
                }
            });
        });
    }

    function showCertificate() {
        certModal.style.display = "flex";
        
        // Fire confetti celebration
        if (typeof confetti === "function") {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
            });
        }
    }

    document.getElementById("btn-cert-restart").addEventListener("click", () => {
        certModal.style.display = "none";
        openQuiz();
    });

    document.getElementById("btn-cert-done").addEventListener("click", () => {
        const nameInput = document.getElementById("student-name-input");
        const studentName = nameInput.value.trim() || "예비 해양공학 마스터";
        
        alert(`⚓ 축하합니다, ${studentName} 학생!\n심해 해양공학 및 잠수함 진화 교육과정을 최종 수료하였습니다!`);
        certModal.style.display = "none";
    });

});
