// 1. Iris 붓꽃 데이터베이스 (모의 데이터 일부)
const irisData = [
    { sepalLength: 5.1, sepalWidth: 3.5, petalLength: 1.4, petalWidth: 0.2, species: "Setosa" },
    { sepalLength: 4.9, sepalWidth: 3.0, petalLength: 1.5, petalWidth: 0.4, species: "Setosa" },
    { sepalLength: 4.7, sepalWidth: 3.2, petalLength: 1.3, petalWidth: 0.2, species: "Setosa" },
    { sepalLength: 4.6, sepalWidth: 3.1, petalLength: 1.5, petalWidth: 0.2, species: "Setosa" },
    { sepalLength: 7.0, sepalWidth: 3.2, petalLength: 4.7, petalWidth: 1.4, species: "Versicolor" },
    { sepalLength: 6.4, sepalWidth: 3.2, petalLength: 4.5, petalWidth: 1.5, species: "Versicolor" },
    { sepalLength: 6.9, sepalWidth: 3.1, petalLength: 4.9, petalWidth: 1.5, species: "Versicolor" },
    { sepalLength: 5.5, sepalWidth: 2.3, petalLength: 4.0, petalWidth: 1.3, species: "Versicolor" },
    { sepalLength: 6.3, sepalWidth: 3.3, petalLength: 6.0, petalWidth: 2.5, species: "Virginica" },
    { sepalLength: 5.8, sepalWidth: 2.7, petalLength: 5.1, petalWidth: 1.9, species: "Virginica" },
    { sepalLength: 7.1, sepalWidth: 3.0, petalLength: 5.9, petalWidth: 2.1, species: "Virginica" },
    { sepalLength: 6.5, sepalWidth: 3.0, petalLength: 5.8, petalWidth: 2.2, species: "Virginica" }
];

// 2. 개/고양이 임베딩 벡터 데이터베이스 (모의 분석 값)
const imageEmbeddingData = {
    cat1: {
        name: "귀여운 고양이 A",
        features: { ear: 88, tail: 15, texture: 92, snout: 12, paw: 85 },
        prediction: { cat: 98.4, dog: 1.6 }
    },
    cat2: {
        name: "도도한 고양이 B",
        features: { ear: 94, tail: 18, texture: 79, snout: 8, paw: 77 },
        prediction: { cat: 99.1, dog: 0.9 }
    },
    cat3: {
        name: "아기 아비시니안 C",
        features: { ear: 82, tail: 22, texture: 88, snout: 14, paw: 80 },
        prediction: { cat: 97.5, dog: 2.5 }
    },
    dog1: {
        name: "활발한 골든리트리버 A",
        features: { ear: 15, tail: 85, texture: 20, snout: 92, paw: 94 },
        prediction: { cat: 1.2, dog: 98.8 }
    },
    dog2: {
        name: "늠름한 진돗개 B",
        features: { ear: 25, tail: 90, texture: 15, snout: 88, paw: 92 },
        prediction: { cat: 2.1, dog: 97.9 }
    },
    dog3: {
        name: "깜찍한 시바견 C",
        features: { ear: 35, tail: 78, texture: 28, snout: 82, paw: 85 },
        prediction: { cat: 4.8, dog: 95.2 }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // [1] 전역 네비게이션 및 탭 전환 제어
    // ----------------------------------------------------
    let currentStep = 1;
    const totalSteps = 5;
    
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const progressFill = document.getElementById("progress-fill");
    
    const steps = document.querySelectorAll(".step-indicator");
    const tabPanels = document.querySelectorAll(".tab-content");
    const simPanels = document.querySelectorAll(".simulator-panel");

    function updateNavigation() {
        prevBtn.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            nextBtn.innerHTML = `학습 완료 🎉`;
            nextBtn.style.background = "var(--success)";
        } else {
            nextBtn.innerHTML = `다음 단계 ➔`;
            nextBtn.style.background = "linear-gradient(135deg, var(--primary), #ffa15a)";
        }
        
        steps.forEach((step, idx) => {
            const stepNum = idx + 1;
            step.classList.remove("active", "completed");
            
            if (stepNum === currentStep) {
                step.classList.add("active");
            } else if (stepNum < currentStep) {
                step.classList.add("completed");
            }
        });
        
        const fillPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${fillPercent}%`;
        
        // 학습 설명 탭 전환
        tabPanels.forEach(panel => {
            panel.classList.remove("active");
            if (parseInt(panel.dataset.step) === currentStep) {
                panel.classList.add("active");
            }
        });

        // 우측 시뮬레이터 패널 전환
        simPanels.forEach(panel => {
            panel.classList.remove("active");
            if (parseInt(panel.dataset.step) === currentStep) {
                // 3단계의 경우 서브 탭 활성화 상태 적용
                if (currentStep === 3) {
                    const activeSub = document.getElementById("tab-btn-regression").classList.contains("active") ? "regression" : "classification";
                    if (panel.id === `sim-panel-${activeSub}`) {
                        panel.classList.add("active");
                    }
                } else {
                    panel.classList.add("active");
                }
            }
        });

        // 차트 그리기 딜레이 트리거
        if (currentStep === 1) {
            setTimeout(updateMathChart, 200);
        } else if (currentStep === 3) {
            setTimeout(() => {
                updateRegressionChart();
                updateIrisChart();
            }, 200);
        }
    }
    
    prevBtn.addEventListener("click", () => {
        if (currentStep > 1) {
            currentStep--;
            updateNavigation();
        }
    });
    
    nextBtn.addEventListener("click", () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateNavigation();
        } else {
            showCompletionEffect();
        }
    });
    
    steps.forEach((step, idx) => {
        step.addEventListener("click", () => {
            currentStep = idx + 1;
            updateNavigation();
        });
    });

    // 3단계 서브탭 전환 제어
    const tabBtnRegression = document.getElementById("tab-btn-regression");
    const tabBtnClassification = document.getElementById("tab-btn-classification");
    const subContentRegression = document.getElementById("sub-content-regression");
    const subContentClassification = document.getElementById("sub-content-classification");
    const simPanelRegression = document.getElementById("sim-panel-regression");
    const simPanelClassification = document.getElementById("sim-panel-classification");

    tabBtnRegression.addEventListener("click", () => {
        tabBtnRegression.classList.add("active");
        tabBtnClassification.classList.remove("active");
        subContentRegression.classList.add("active");
        subContentClassification.classList.remove("active");
        simPanelRegression.classList.add("active");
        simPanelClassification.classList.remove("active");
        setTimeout(updateRegressionChart, 150);
    });

    tabBtnClassification.addEventListener("click", () => {
        tabBtnClassification.classList.add("active");
        tabBtnRegression.classList.remove("active");
        subContentClassification.classList.add("active");
        subContentRegression.classList.remove("active");
        simPanelClassification.classList.add("active");
        simPanelRegression.classList.remove("active");
        setTimeout(updateIrisChart, 150);
    });


    // ----------------------------------------------------
    // [2] 1단계 수학 도구: 표준화 / 정규화 차트 시각화
    // ----------------------------------------------------
    const rawScores = [90, 75, 45, 80, 60]; 
    let mathChartInstance = null;
    
    const transformSelector = document.getElementById("transform-type-select");
    const mathFormulaDisplay = document.getElementById("math-formula-display");
    
    function calculateTransformedData(type) {
        if (type === "none") {
            return rawScores;
        } else if (type === "normalization") {
            const min = Math.min(...rawScores);
            const max = Math.max(...rawScores);
            return rawScores.map(score => (score - min) / (max - min));
        } else if (type === "standardization") {
            const mean = rawScores.reduce((a, b) => a + b, 0) / rawScores.length;
            const stdDev = Math.sqrt(rawScores.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / rawScores.length);
            return rawScores.map(score => (score - mean) / stdDev);
        }
        return rawScores;
    }
    
    function updateMathChart() {
        const selectedType = transformSelector.value;
        const data = calculateTransformedData(selectedType);
        
        if (selectedType === "none") {
            mathFormulaDisplay.innerHTML = "원시 데이터: 가공되지 않은 학생들의 시험 원점수 (45점 ~ 90점)";
        } else if (selectedType === "normalization") {
            mathFormulaDisplay.innerHTML = "정규화 공식: <code>x_new = (x - Min) / (Max - Min)</code> (0 ~ 1 압축)";
        } else if (selectedType === "standardization") {
            mathFormulaDisplay.innerHTML = "표준화 공식: <code>x_new = (x - Mean) / StdDev</code> (평균 0, 표준편차 1)";
        }
        
        const ctx = document.getElementById("mathChart").getContext("2d");
        if (mathChartInstance) mathChartInstance.destroy();
        
        mathChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['철수', '영희', '민수', '지민', '길동'],
                datasets: [{
                    label: selectedType === "none" ? '원점수 (100점 만점)' : (selectedType === "normalization" ? '정규화된 값 (0~1)' : '표준화된 값 (평균 0)'),
                    data: data,
                    backgroundColor: selectedType === "none" ? 'rgba(255, 255, 255, 0.15)' : (selectedType === "normalization" ? 'rgba(255, 107, 0, 0.6)' : 'rgba(0, 240, 255, 0.6)'),
                    borderColor: selectedType === "none" ? '#ffffff' : (selectedType === "normalization" ? '#ff6b00' : '#00f0ff'),
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f3f4f6' } }
                }
            }
        });
    }
    
    transformSelector.addEventListener("change", updateMathChart);
    updateMathChart();


    // ----------------------------------------------------
    // [3] 3-1단계: 레몬에이드 예측 (회귀 시뮬레이터)
    // ----------------------------------------------------
    const lemonadeSlider = document.getElementById("lemonade-temp-slider");
    const lemonadeTempText = document.getElementById("lemonade-temp-text");
    const btnFitRegression = document.getElementById("btn-fit-regression");
    const regressionPredictedBox = document.getElementById("regression-predicted-sales-box");
    
    let regressionChartInstance = null;
    let regressionFitted = false;

    // 과거 학습 데이터셋
    const rawSalesData = [
        { x: 20, y: 40 },
        { x: 22, y: 44 },
        { x: 25, y: 50 },
        { x: 28, y: 56 }
    ];

    function calculatePrediction(temp) {
        // y = 2 * x (Linear Regression 공식)
        return 2 * temp;
    }

    function highlightRegressionDialogue(temp) {
        const lines = document.querySelectorAll("#regression-dialogue-area .line");
        lines.forEach(l => l.classList.remove("active"));

        if (temp === 24) {
            // 학생 예측 성공 구절 하이라이트
            document.getElementById("line-r5").classList.add("active");
            document.getElementById("line-r5").scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (temp < 20) {
            document.getElementById("line-r1").classList.add("active");
        } else if (temp < 24) {
            document.getElementById("line-r3").classList.add("active");
        } else if (temp > 28) {
            document.getElementById("line-r6").classList.add("active");
        } else {
            document.getElementById("line-r4").classList.add("active");
        }
    }

    function updateRegressionChart() {
        const currentTemp = parseInt(lemonadeSlider.value);
        lemonadeTempText.textContent = `${currentTemp} °C`;
        
        let datasets = [{
            label: '과거 판매 기록 데이터 (산점도)',
            data: rawSalesData,
            backgroundColor: 'rgba(0, 240, 255, 0.75)',
            borderColor: '#00f0ff',
            pointRadius: 6,
            type: 'scatter'
        }];

        if (regressionFitted) {
            // 선형 추세선 추가 y = 2x
            const trendLine = [];
            for (let t = 14; t <= 36; t += 2) {
                trendLine.push({ x: t, y: 2 * t });
            }

            datasets.push({
                label: '학습 완료된 선형 회귀 추세선 (y = 2x)',
                data: trendLine,
                borderColor: '#ff6b00',
                backgroundColor: 'transparent',
                borderWidth: 3,
                type: 'line',
                pointRadius: 0,
                fill: false
            });

            // 현재 슬라이더 온도 예측 포인트 하이라이트
            const predicted = calculatePrediction(currentTemp);
            datasets.push({
                label: '내일의 날씨 예보 온도 예측점',
                data: [{ x: currentTemp, y: predicted }],
                backgroundColor: '#ef4444',
                borderColor: '#ffffff',
                borderWidth: 2,
                pointRadius: 8,
                type: 'scatter'
            });

            regressionPredictedBox.textContent = `${predicted} 개`;
            highlightRegressionDialogue(currentTemp);
        } else {
            regressionPredictedBox.textContent = "기다리는 중...";
        }

        const ctx = document.getElementById("regressionChart").getContext("2d");
        if (regressionChartInstance) regressionChartInstance.destroy();

        regressionChartInstance = new Chart(ctx, {
            data: { datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: 14,
                        max: 36,
                        title: { display: true, text: '기온 (°C)', color: '#9ca3af' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#9ca3af' }
                    },
                    y: {
                        min: 25,
                        max: 75,
                        title: { display: true, text: '판매량 (개)', color: '#9ca3af' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#9ca3af' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f3f4f6', boxWidth: 12 } }
                }
            }
        });
    }

    btnFitRegression.addEventListener("click", () => {
        regressionFitted = true;
        btnFitRegression.textContent = "✓ Linear Regression 공식 학습 완료!";
        btnFitRegression.classList.add("btn-success");
        updateRegressionChart();
    });

    lemonadeSlider.addEventListener("input", updateRegressionChart);


    // ----------------------------------------------------
    // [4] 3-2단계: 붓꽃 품종 알아맞히기 (분류 및 모델 비교)
    // ----------------------------------------------------
    const btnModelLogistic = document.getElementById("btn-model-logistic");
    const btnModelTree = document.getElementById("btn-model-tree");
    const testPetalLength = document.getElementById("test-petal-length");
    const testPetalWidth = document.getElementById("test-petal-width");
    const irisPredictedSpeciesBox = document.getElementById("iris-predicted-species-box");

    let currentModel = "logistic"; // 기본값
    let irisChartInstance = null;

    btnModelLogistic.addEventListener("click", () => {
        currentModel = "logistic";
        btnModelLogistic.classList.add("active-model");
        btnModelTree.classList.remove("active-model");
        updateIrisChart();
        highlightClassificationDialogue();
    });

    btnModelTree.addEventListener("click", () => {
        currentModel = "tree";
        btnModelTree.classList.add("active-model");
        btnModelLogistic.classList.remove("active-model");
        updateIrisChart();
        highlightClassificationDialogue();
    });

    function highlightClassificationDialogue() {
        const lines = document.querySelectorAll("#classification-dialogue-area .line");
        lines.forEach(l => l.classList.remove("active"));
        if (currentModel === "logistic") {
            document.getElementById("line-c2").classList.add("active");
        } else {
            document.getElementById("line-c5").classList.add("active");
        }
    }

    function predictIris(len, wid) {
        if (currentModel === "logistic") {
            // 로지스틱 선형 경계 수식 모사
            if (wid < -0.5 * len + 2.0) {
                return "Setosa";
            } else if (wid < -0.7 * len + 5.0) {
                return "Versicolor";
            } else {
                return "Virginica";
            }
        } else {
            // 의사결정나무 격자형 경계 분기 모사
            if (len <= 2.45) {
                return "Setosa";
            } else if (wid <= 1.75) {
                return "Versicolor";
            } else {
                return "Virginica";
            }
        }
    }

    // Chart.js 결정 경계선 그리기 플러그인 탑재
    const decisionBoundaryPlugin = {
        id: 'decisionBoundary',
        beforeDatasetsDraw(chart) {
            const { ctx, chartArea: { top, right, bottom, left }, scales: { x, y } } = chart;
            ctx.save();
            const step = 4; // 렌더링 성능 최적화를 위한 픽셀 스택 크기
            
            for (let px = left; px < right; px += step) {
                for (let py = top; py < bottom; py += step) {
                    const dataX = x.getValueForPixel(px);
                    const dataY = y.getValueForPixel(py);
                    
                    let species = predictIris(dataX, dataY);
                    
                    if (species === "Setosa") {
                        ctx.fillStyle = "rgba(129, 140, 248, 0.08)";
                    } else if (species === "Versicolor") {
                        ctx.fillStyle = "rgba(251, 191, 36, 0.08)";
                    } else {
                        ctx.fillStyle = "rgba(52, 211, 153, 0.08)";
                    }
                    ctx.fillRect(px, py, step, step);
                }
            }
            ctx.restore();
        }
    };

    function updateIrisChart() {
        const targetLen = parseFloat(testPetalLength.value);
        const targetWid = parseFloat(testPetalWidth.value);
        const predicted = predictIris(targetLen, targetWid);

        irisPredictedSpeciesBox.textContent = predicted;

        // 실제 붓꽃 클래스 필터링
        const setosaPoints = irisData.filter(d => d.species === "Setosa").map(d => ({ x: d.petalLength, y: d.petalWidth }));
        const versicolorPoints = irisData.filter(d => d.species === "Versicolor").map(d => ({ x: d.petalLength, y: d.petalWidth }));
        const virginicaPoints = irisData.filter(d => d.species === "Virginica").map(d => ({ x: d.petalLength, y: d.petalWidth }));

        const datasets = [
            {
                label: 'Setosa (파랑)',
                data: setosaPoints,
                backgroundColor: '#818cf8',
                pointRadius: 5,
                type: 'scatter'
            },
            {
                label: 'Versicolor (주황)',
                data: versicolorPoints,
                backgroundColor: '#fbbf24',
                pointRadius: 5,
                type: 'scatter'
            },
            {
                label: 'Virginica (초록)',
                data: virginicaPoints,
                backgroundColor: '#34d399',
                pointRadius: 5,
                type: 'scatter'
            },
            {
                label: '가상의 테스트 꽃 위치',
                data: [{ x: targetLen, y: targetWid }],
                backgroundColor: '#ffffff',
                borderColor: '#ff0055',
                borderWidth: 2.5,
                pointRadius: 8,
                pointStyle: 'rectRot',
                type: 'scatter'
            }
        ];

        const ctx = document.getElementById("irisClassificationChart").getContext("2d");
        if (irisChartInstance) irisChartInstance.destroy();

        irisChartInstance = new Chart(ctx, {
            data: { datasets: datasets },
            plugins: [decisionBoundaryPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        min: 0.8,
                        max: 6.8,
                        title: { display: true, text: '꽃잎 길이 (Petal Length)', color: '#9ca3af', font: { size: 10 } },
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#9ca3af' }
                    },
                    y: {
                        min: 0.0,
                        max: 2.8,
                        title: { display: true, text: '꽃잎 너비 (Petal Width)', color: '#9ca3af', font: { size: 10 } },
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#9ca3af' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f3f4f6', boxWidth: 8, font: { size: 9 } } }
                }
            }
        });
    }

    testPetalLength.addEventListener("input", updateIrisChart);
    testPetalWidth.addEventListener("input", updateIrisChart);


    // ----------------------------------------------------
    // [5] 4단계: 개/고양이 이미지 임베딩 시뮬레이터
    // ----------------------------------------------------
    const thumbOptions = document.querySelectorAll(".thumb-option");
    const previewImage = document.getElementById("preview-image");
    const vectorPanel = document.getElementById("vector-panel");
    const embeddingProgressText = document.getElementById("embedding-progress-text");
    const aiPredictionBox = document.getElementById("ai-prediction-box");
    const predictionText = document.getElementById("prediction-text");

    thumbOptions.forEach(thumb => {
        thumb.addEventListener("click", () => {
            thumbOptions.forEach(t => t.style.borderColor = "transparent");
            thumb.style.borderColor = "var(--primary)";

            const imgId = thumb.dataset.image;
            const data = imageEmbeddingData[imgId];

            previewImage.src = thumb.src;
            vectorPanel.style.display = "none";
            aiPredictionBox.style.display = "none";
            embeddingProgressText.style.display = "block";

            setTimeout(() => {
                embeddingProgressText.style.display = "none";
                vectorPanel.style.display = "block";

                document.getElementById("v-ear").style.width = `${data.features.ear}%`;
                document.getElementById("v-tail").style.width = `${data.features.tail}%`;
                document.getElementById("v-texture").style.width = `${data.features.texture}%`;
                document.getElementById("v-snout").style.width = `${data.features.snout}%`;
                document.getElementById("v-paw").style.width = `${data.features.paw}%`;

                document.getElementById("val-ear").textContent = `${data.features.ear}`;
                document.getElementById("val-tail").textContent = `${data.features.tail}`;
                document.getElementById("val-texture").textContent = `${data.features.texture}`;
                document.getElementById("val-snout").textContent = `${data.features.snout}`;
                document.getElementById("val-paw").textContent = `${data.features.paw}`;

                setTimeout(() => {
                    aiPredictionBox.style.display = "block";
                    if (data.prediction.cat > data.prediction.dog) {
                        predictionText.innerHTML = `😻 분석 결과: <strong>고양이(Cat)</strong> 확률 <strong>${data.prediction.cat}%</strong>`;
                        predictionText.style.color = "var(--success)";
                    } else {
                        predictionText.innerHTML = `🐶 분석 결과: <strong>강아지(Dog)</strong> 확률 <strong>${data.prediction.dog}%</strong>`;
                        predictionText.style.color = "var(--primary)";
                    }
                }, 300);

            }, 600);
        });
    });


    // ----------------------------------------------------
    // [6] 대화형 퀴즈 채점 시스템
    // ----------------------------------------------------
    const quizChoices = document.querySelectorAll(".quiz-option");
    const answered = { 1: false, 2: false, 3: false };
    const correctAnswers = {
        1: "회귀",
        2: "분류",
        3: "비지도학습"
    };

    quizChoices.forEach(option => {
        option.addEventListener("click", () => {
            const questionNum = parseInt(option.dataset.question);
            const selectedText = option.dataset.value;
            
            if (answered[questionNum]) return;
            
            const isCorrect = selectedText === correctAnswers[questionNum];
            const siblingOptions = document.querySelectorAll(`.quiz-option[data-question="${questionNum}"]`);
            siblingOptions.forEach(opt => opt.classList.remove("correct", "incorrect"));
            
            if (isCorrect) {
                option.classList.add("correct");
                answered[questionNum] = true;
                checkAllQuizCompleted();
            } else {
                option.classList.add("incorrect");
                setTimeout(() => {
                    option.classList.remove("incorrect");
                }, 800);
            }
        });
    });

    function checkAllQuizCompleted() {
        if (answered[1] && answered[2] && answered[3]) {
            document.getElementById("quiz-success-banner").style.display = "block";
        }
    }

    function showCompletionEffect() {
        if (answered[1] && answered[2] && answered[3]) {
            if (typeof confetti === "function") {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            } else {
                // 대체 파티클
                for (let i = 0; i < 30; i++) {
                    createConfettiParticle();
                }
            }
        } else {
            alert("⚠️ 퀴즈를 모두 풀면 멋진 수료증이 활성화됩니다!");
        }
    }

    document.getElementById("btn-cert-done").addEventListener("click", () => {
        if (!answered[1] || !answered[2] || !answered[3]) {
            alert("⚠️ 5단계 종합 퀴즈를 먼저 전부 완료해 주세요!");
            return;
        }
        const nameVal = document.getElementById("student-name-input").value.trim() || "예비 데이터 과학자";
        alert(`🎖️ 데이터 과학 수료 인증 🎖️\n\n축하합니다, ${nameVal} 학생!\nOrange3 머신러닝 기초 교육과정을 성공적으로 마스터하셨습니다!`);
        
        if (typeof confetti === "function") {
            confetti({ particleCount: 100, spread: 60 });
        }
    });

    function createConfettiParticle() {
        const confettiEl = document.createElement("div");
        confettiEl.style.position = "fixed";
        confettiEl.style.width = `${Math.random() * 8 + 6}px`;
        confettiEl.style.height = `${Math.random() * 15 + 8}px`;
        const colors = ["#ff6b00", "#00f0ff", "#10b981", "#fbbf24", "#ef4444"];
        confettiEl.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiEl.style.left = `${Math.random() * 100}vw`;
        confettiEl.style.top = `-20px`;
        confettiEl.style.zIndex = "9999";
        confettiEl.style.borderRadius = "3px";
        confettiEl.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        document.body.appendChild(confettiEl);
        
        const animation = confettiEl.animate([
            { top: '-20px', transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { top: '100vh', transform: `translateX(${Math.random() * 100 - 50}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1500,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });
        
        animation.onfinish = () => {
            confettiEl.remove();
        };
    }

    updateNavigation();
});
