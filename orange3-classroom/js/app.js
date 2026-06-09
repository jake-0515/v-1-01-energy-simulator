// 1. Iris 붓꽃 데이터베이스 (모의 데이터 일부)
const irisData = [
    { id: 1, sepalLength: 5.1, sepalWidth: 3.5, petalLength: 1.4, petalWidth: 0.2, species: "Iris-setosa" },
    { id: 2, sepalLength: 4.9, sepalWidth: 3.0, petalLength: 1.4, petalWidth: 0.2, species: "Iris-setosa" },
    { id: 3, sepalLength: 4.7, sepalWidth: 3.2, petalLength: 1.3, petalWidth: 0.2, species: "Iris-setosa" },
    { id: 4, sepalLength: 7.0, sepalWidth: 3.2, petalLength: 4.7, petalWidth: 1.4, species: "Iris-versicolor" },
    { id: 5, sepalLength: 6.4, sepalWidth: 3.2, petalLength: 4.5, petalWidth: 1.5, species: "Iris-versicolor" },
    { id: 6, sepalLength: 6.9, sepalWidth: 3.1, petalLength: 4.9, petalWidth: 1.5, species: "Iris-versicolor" },
    { id: 7, sepalLength: 6.3, sepalWidth: 3.3, petalLength: 6.0, petalWidth: 2.5, species: "Iris-virginica" },
    { id: 8, sepalLength: 5.8, sepalWidth: 2.7, petalLength: 5.1, petalWidth: 1.9, species: "Iris-virginica" },
    { id: 9, sepalLength: 7.1, sepalWidth: 3.0, petalLength: 5.9, petalWidth: 2.1, species: "Iris-virginica" },
    { id: 10, sepalLength: 5.4, sepalWidth: 3.9, petalLength: 1.7, petalWidth: 0.4, species: "Iris-setosa" }
];

// 2. 개/고양이 임베딩 벡터 데이터베이스 (모의 분석 값)
const imageEmbeddingData = {
    cat1: {
        name: "귀여운 고양이 A",
        vector: [88, 15, 92, 12, 85], // [귀 모양, 꼬리 길이, 털 무늬, 주둥이 비율, 발 크기]
        features: { ear: 88, tail: 15, texture: 92, snout: 12, paw: 85 },
        prediction: { cat: 98.4, dog: 1.6 }
    },
    cat2: {
        name: "도도한 고양이 B",
        vector: [94, 18, 79, 8, 77],
        features: { ear: 94, tail: 18, texture: 79, snout: 8, paw: 77 },
        prediction: { cat: 99.1, dog: 0.9 }
    },
    cat3: {
        name: "아기 아비시니안 C",
        vector: [82, 22, 88, 14, 80],
        features: { ear: 82, tail: 22, texture: 88, snout: 14, paw: 80 },
        prediction: { cat: 97.5, dog: 2.5 }
    },
    dog1: {
        name: "활발한 골든리트리버 A",
        vector: [15, 85, 20, 92, 94],
        features: { ear: 15, tail: 85, texture: 20, snout: 92, paw: 94 },
        prediction: { cat: 1.2, dog: 98.8 }
    },
    dog2: {
        name: "늠름한 진돗개 B",
        vector: [25, 90, 15, 88, 92],
        features: { ear: 25, tail: 90, texture: 15, snout: 88, paw: 92 },
        prediction: { cat: 2.1, dog: 97.9 }
    },
    dog3: {
        name: "깜찍한 시바견 C",
        vector: [35, 78, 28, 82, 85],
        features: { ear: 35, tail: 78, texture: 28, snout: 82, paw: 85 },
        prediction: { cat: 4.8, dog: 95.2 }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // [1] 전역 네비게이션 제어
    // ----------------------------------------------------
    let currentStep = 1;
    const totalSteps = 5;
    
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const progressFill = document.getElementById("progress-fill");
    
    const steps = document.querySelectorAll(".step-indicator");
    const tabPanels = document.querySelectorAll(".tab-content");
    
    function updateNavigation() {
        prevBtn.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            nextBtn.innerHTML = `학습 완료 🎉`;
            nextBtn.classList.add("btn-success");
        } else {
            nextBtn.innerHTML = `다음 단계 ➔`;
            nextBtn.classList.remove("btn-success");
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
        
        tabPanels.forEach(panel => {
            panel.classList.remove("active");
            if (parseInt(panel.dataset.step) === currentStep) {
                panel.classList.add("active");
            }
        });
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

    // ----------------------------------------------------
    // [2] 수학 도구: 정규화 / 표준화 실시간 차트 시각화
    // ----------------------------------------------------
    const rawScores = [90, 75, 45, 80, 60]; // 학생 5명의 시험 원점수
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
            const variance = rawScores.reduce((a, b) => a + Math.pow(score => score - mean, 2), 0) / rawScores.length; // Simple stddev
            // standard dev calculation
            const stdDev = Math.sqrt(rawScores.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / rawScores.length);
            return rawScores.map(score => (score - mean) / stdDev);
        }
        return rawScores;
    }
    
    function updateMathChart() {
        const selectedType = transformSelector.value;
        const data = calculateTransformedData(selectedType);
        
        // 공식 텍스트 업데이트
        if (selectedType === "none") {
            mathFormulaDisplay.innerHTML = "원시 데이터: 가공되지 않은 학생들의 시험 원점수 (만점 기준 100점)";
        } else if (selectedType === "normalization") {
            mathFormulaDisplay.innerHTML = "정규화 공식: x_new = (x - Min) / (Max - Min)  ➔  [모든 점수가 0 ~ 1 사이 정렬]";
        } else if (selectedType === "standardization") {
            mathFormulaDisplay.innerHTML = "표준화 공식: x_new = (x - Mean) / StdDev  ➔  [평균이 0, 표준편차가 1인 분포 정렬]";
        }
        
        // 차트 렌더링
        const ctx = document.getElementById("mathChart").getContext("2d");
        
        if (mathChartInstance) {
            mathChartInstance.destroy();
        }
        
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
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#f3f4f6',
                            font: {
                                family: 'Outfit'
                            }
                        }
                    }
                }
            }
        });
    }
    
    transformSelector.addEventListener("change", updateMathChart);
    
    // Chart.js 스크립트 로딩 대기 후 첫 차트 그리기
    setTimeout(updateMathChart, 800);

    // ----------------------------------------------------
    // [3] Orange3 위젯 가상 연결 시뮬레이터 (Node Canvas)
    // ----------------------------------------------------
    const workspace = document.getElementById("orange3-workspace");
    const connectionCanvas = document.getElementById("connection-canvas");
    const ctxCanvas = connectionCanvas.getContext("2d");
    
    // 캔버스 크기 맞추기
    function resizeCanvas() {
        connectionCanvas.width = workspace.clientWidth;
        connectionCanvas.height = workspace.clientHeight;
        redrawConnections();
    }
    window.addEventListener("resize", resizeCanvas);
    setTimeout(resizeCanvas, 500);

    // 위젯 위치 및 연결 상태
    const widgets = {
        file: { x: 50, y: 130, element: document.getElementById("node-file") },
        datatable: { x: 260, y: 30, element: document.getElementById("node-datatable") },
        scatterplot: { x: 260, y: 150, element: document.getElementById("node-scatterplot") },
        sampler: { x: 260, y: 270, element: document.getElementById("node-sampler") }
    };

    const connections = {
        datatable: false,
        scatterplot: false,
        sampler: false
    };

    // 마우스 드래그 상태 관리
    let activeDragNode = null;
    let isConnecting = false;
    let connectStartNode = null;
    let mouseX = 0;
    let mouseY = 0;

    // 초기 위젯 배치 설정
    Object.keys(widgets).forEach(key => {
        const w = widgets[key];
        w.element.style.left = `${w.x}px`;
        w.element.style.top = `${w.y}px`;
        
        // 위젯 드래그앤드롭 핸들러
        const iconBox = w.element.querySelector(".widget-icon-box");
        iconBox.addEventListener("mousedown", (e) => {
            if (e.target.classList.contains("port")) return; // 포트 클릭은 드래그 제외
            activeDragNode = key;
        });
    });

    workspace.addEventListener("mousemove", (e) => {
        const rect = workspace.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        if (activeDragNode) {
            // 위젯 이동
            const w = widgets[activeDragNode];
            w.x = mouseX - 45; // 중앙 정렬 보정
            w.y = mouseY - 55;
            // 캔버스 밖으로 이탈 차단
            w.x = Math.max(0, Math.min(workspace.clientWidth - 90, w.x));
            w.y = Math.max(0, Math.min(workspace.clientHeight - 110, w.y));
            
            w.element.style.left = `${w.x}px`;
            w.element.style.top = `${w.y}px`;
            redrawConnections();
        }

        if (isConnecting) {
            redrawConnections();
            // 현재 드래그 중인 라인 그리기
            const startPortX = widgets[connectStartNode].x + 90;
            const startPortY = widgets[connectStartNode].y + 32 + 20; // Icon 중앙 높이 보정
            ctxCanvas.beginPath();
            ctxCanvas.moveTo(startPortX, startPortY);
            ctxCanvas.lineTo(mouseX, mouseY);
            ctxCanvas.strokeStyle = "rgba(255, 107, 0, 0.8)";
            ctxCanvas.lineWidth = 3;
            ctxCanvas.setLineDash([5, 5]);
            ctxCanvas.stroke();
            ctxCanvas.setLineDash([]);
        }
    });

    window.addEventListener("mouseup", (e) => {
        activeDragNode = null;
        if (isConnecting) {
            isConnecting = false;
            redrawConnections();
        }
    });

    // 포트 연결 이벤트 설정
    const fileOutPort = document.getElementById("port-file-out");
    fileOutPort.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        isConnecting = true;
        connectStartNode = "file";
    });

    // 입력 포트들에 마우스를 뗄 때 연결 성공 여부 판단
    const targetPorts = {
        datatable: document.getElementById("port-datatable-in"),
        scatterplot: document.getElementById("port-scatterplot-in"),
        sampler: document.getElementById("port-sampler-in")
    };

    Object.keys(targetPorts).forEach(target => {
        const port = targetPorts[target];
        port.addEventListener("mouseup", (e) => {
            if (isConnecting && connectStartNode === "file") {
                connections[target] = true;
                // 연결됨에 따라 활성화 시각적 효과 부여
                widgets[target].element.classList.add("active-connected");
                isConnecting = false;
                redrawConnections();
                showConnectionNotification(target);
            }
        });
    });

    // 연결선 그리기 함수
    function redrawConnections() {
        ctxCanvas.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);
        
        Object.keys(connections).forEach(target => {
            if (connections[target]) {
                const startX = widgets.file.x + 90;
                const startY = widgets.file.y + 52;
                const endX = widgets[target].x;
                const endY = widgets[target].y + 52;

                ctxCanvas.beginPath();
                ctxCanvas.moveTo(startX, startY);
                // 베지에 곡선으로 Orange3 스타일의 부드러운 연결선 그리기
                ctxCanvas.bezierCurveTo(startX + 80, startY, endX - 80, endY, endX, endY);
                ctxCanvas.strokeStyle = "#00f0ff";
                ctxCanvas.lineWidth = 4;
                ctxCanvas.shadowColor = "rgba(0, 240, 255, 0.5)";
                ctxCanvas.shadowBlur = 8;
                ctxCanvas.stroke();
                ctxCanvas.shadowBlur = 0; // 초기화
            }
        });
    }

    // 연결 시 말풍선 안내 메시지
    function showConnectionNotification(target) {
        let text = "";
        if (target === "datatable") text = "File ➔ Data Table 연결! 위젯을 클릭하여 표 데이터를 확인해 보세요.";
        if (target === "scatterplot") text = "File ➔ Scatter Plot 연결! 위젯을 클릭하여 붓꽃 분포 산점도를 확인해 보세요.";
        if (target === "sampler") text = "File ➔ Data Sampler 연결! 위젯을 클릭하여 데이터 분할 비율을 확인해 보세요.";
        
        alert(`⚡ 연결 성공!\n${text}`);
    }

    // ----------------------------------------------------
    // [4] 가상 모달 대화창 (Iris 분석 결과 연동)
    // ----------------------------------------------------
    const modalOverlay = document.getElementById("modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body-content");
    const modalClose = document.getElementById("modal-close");

    modalClose.addEventListener("click", () => {
        modalOverlay.style.display = "none";
    });

    // 각 위젯 노드 더블클릭 및 클릭 시 동작 설정
    Object.keys(widgets).forEach(key => {
        widgets[key].element.addEventListener("click", () => {
            if (key === "file") {
                openFileWidgetModal();
            } else {
                // 연결되어 있는 경우만 모달 열기
                if (connections[key]) {
                    openWidgetModal(key);
                } else {
                    alert("⚠️ 에러: 아직 File 위젯과 연결되지 않았습니다. 포트(둥근 점)를 서로 드래그하여 연결선을 그어주세요!");
                }
            }
        });
    });

    function openFileWidgetModal() {
        modalOverlay.style.display = "flex";
        modalTitle.textContent = "📂 File 위젯 설정 (데이터 불러오기)";
        modalBody.innerHTML = `
            <p style="margin-bottom: 1rem;">현재 불러온 붓꽃 데이터 파일명: <strong>iris.tab</strong></p>
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                <p>📊 <strong>데이터 메타 정보:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem; font-size: 0.9rem;">
                    <li>전체 데이터 수 (Instances): 150개</li>
                    <li>입력 특성 개수 (Features): 4개 (sepal length, sepal width, petal length, petal width)</li>
                    <li>목표 예측 변수 (Target): 1개 (iris - 꽃 종류: setosa, versicolor, virginica)</li>
                </ul>
            </div>
        `;
    }

    function openWidgetModal(type) {
        modalOverlay.style.display = "flex";
        
        if (type === "datatable") {
            modalTitle.textContent = "📋 Data Table (데이터 상세 보기)";
            
            // 붓꽃 테이블 HTML 생성
            let tableRowsHtml = "";
            irisData.forEach(row => {
                const cls = row.species.toLowerCase().replace("iris-", "iris ");
                tableRowsHtml += `
                    <tr class="${cls}">
                        <td>${row.id}</td>
                        <td>${row.sepalLength}</td>
                        <td>${row.sepalWidth}</td>
                        <td>${row.petalLength}</td>
                        <td>${row.petalWidth}</td>
                        <td><strong>${row.species}</strong></td>
                    </tr>
                `;
            });

            modalBody.innerHTML = `
                <p style="margin-bottom: 0.8rem;">불러온 데이터의 실제 값들을 스프레드시트 형태로 정밀 표기한 테이블입니다.</p>
                <div class="iris-table-wrapper">
                    <table class="iris-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Sepal Length (꽃받침 길이)</th>
                                <th>Sepal Width (꽃받침 너비)</th>
                                <th>Petal Length (꽃잎 길이)</th>
                                <th>Petal Width (꽃잎 너비)</th>
                                <th>Species (꽃 품종)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (type === "scatterplot") {
            modalTitle.textContent = "📊 Scatter Plot (데이터 산점도 시각화)";
            modalBody.innerHTML = `
                <p style="margin-bottom: 1rem;">꽃잎의 길이(X축)와 꽃잎의 너비(Y축)에 맞춰 분류한 데이터들의 공간 분포 그래프입니다.</p>
                <div style="width: 100%; height: 300px; position: relative;">
                    <canvas id="modalChart"></canvas>
                </div>
            `;
            
            // 모달 안쪽 그래프 렌더링
            setTimeout(() => {
                const ctx = document.getElementById("modalChart").getContext("2d");
                new Chart(ctx, {
                    type: 'scatter',
                    data: {
                        datasets: [
                            {
                                label: 'Iris-setosa (파랑)',
                                data: [
                                    {x: 1.4, y: 0.2}, {x: 1.4, y: 0.2}, {x: 1.3, y: 0.2}, {x: 1.5, y: 0.2}, {x: 1.7, y: 0.4}
                                ],
                                backgroundColor: '#818cf8',
                                pointRadius: 7
                            },
                            {
                                label: 'Iris-versicolor (주황)',
                                data: [
                                    {x: 4.7, y: 1.4}, {x: 4.5, y: 1.5}, {x: 4.9, y: 1.5}, {x: 4.0, y: 1.3}, {x: 4.6, y: 1.4}
                                ],
                                backgroundColor: '#fbbf24',
                                pointRadius: 7
                            },
                            {
                                label: 'Iris-virginica (초록)',
                                data: [
                                    {x: 6.0, y: 2.5}, {x: 5.1, y: 1.9}, {x: 5.9, y: 2.1}, {x: 5.6, y: 2.0}, {x: 5.8, y: 2.2}
                                ],
                                backgroundColor: '#34d399',
                                pointRadius: 7
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: { display: true, text: 'Petal Length (꽃잎 길이)', color: '#fff' },
                                grid: { color: 'rgba(255,255,255,0.05)' },
                                ticks: { color: '#9ca3af' }
                            },
                            y: {
                                title: { display: true, text: 'Petal Width (꽃잎 너비)', color: '#fff' },
                                grid: { color: 'rgba(255,255,255,0.05)' },
                                ticks: { color: '#9ca3af' }
                            }
                        }
                    }
                });
            }, 200);
        } else if (type === "sampler") {
            modalTitle.textContent = "⚖️ Data Sampler (학습용/검증용 분할 위젯)";
            modalBody.innerHTML = `
                <p style="margin-bottom: 1rem;">전체 150개의 꽃 데이터를 랜덤하게 섞어 훈련용(Train)과 테스트용(Test)으로 추출하는 설정입니다.</p>
                <div style="background: rgba(0, 240, 255, 0.05); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--secondary-glow);">
                    <p style="font-weight: 700; color: #fff; margin-bottom: 0.5rem;">🔥 분할 설정 상태:</p>
                    <ul style="margin-left: 1.5rem; font-size: 0.95rem;">
                        <li><strong>학습용 데이터 (Training Set - 70%):</strong> 105개 데이터</li>
                        <li><strong>테스트용 데이터 (Testing Set - 30%):</strong> 45개 데이터</li>
                    </ul>
                    <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">이 분할을 통해 인공지능은 105개의 데이터를 통해 공부를 한 뒤, 학습 과정에서 전혀 보지 못한 나머지 45개의 데이터를 가지고 모의고사를 풀어 성능 평가를 받게 됩니다.</p>
                </div>
            `;
        }
    }

    // ----------------------------------------------------
    // [5] [추가] 개/고양이 이미지 임베딩 & AI 이미지 분류 시뮬레이터
    // ----------------------------------------------------
    const thumbOptions = document.querySelectorAll(".thumb-option");
    const previewImage = document.getElementById("preview-image");
    const vectorPanel = document.getElementById("vector-panel");
    const embeddingProgressText = document.getElementById("embedding-progress-text");
    const aiPredictionBox = document.getElementById("ai-prediction-box");
    const predictionText = document.getElementById("prediction-text");

    thumbOptions.forEach(thumb => {
        thumb.addEventListener("click", () => {
            // 선택 효과 리셋
            thumbOptions.forEach(t => t.classList.remove("selected"));
            thumb.classList.add("selected");

            const imgId = thumb.dataset.image;
            const data = imageEmbeddingData[imgId];

            // 프리뷰 이미지 및 상태 리셋
            previewImage.src = thumb.src;
            vectorPanel.style.display = "none";
            aiPredictionBox.style.display = "none";
            embeddingProgressText.style.display = "block";
            embeddingProgressText.textContent = "⌛ 이미지 특징 분석 중 (Image Embedding)...";

            // 임베딩 및 예측 진행 프로세스 시뮬레이션
            setTimeout(() => {
                embeddingProgressText.style.display = "none";
                vectorPanel.style.display = "block";

                // 임베딩 피처 막대 길이 업데이트
                document.getElementById("v-ear").style.width = `${data.features.ear}%`;
                document.getElementById("v-tail").style.width = `${data.features.tail}%`;
                document.getElementById("v-texture").style.width = `${data.features.texture}%`;
                document.getElementById("v-snout").style.width = `${data.features.snout}%`;
                document.getElementById("v-paw").style.width = `${data.features.paw}%`;

                // 레이벨 텍스트 수치 표기
                document.getElementById("val-ear").textContent = `${data.features.ear}`;
                document.getElementById("val-tail").textContent = `${data.features.tail}`;
                document.getElementById("val-texture").textContent = `${data.features.snout}`; // snouts mapping
                document.getElementById("val-snout").textContent = `${data.features.snout}`;
                document.getElementById("val-paw").textContent = `${data.features.paw}`;

                // 최종 분류 모델 작동 결과 출력
                setTimeout(() => {
                    aiPredictionBox.style.display = "block";
                    if (data.prediction.cat > data.prediction.dog) {
                        predictionText.innerHTML = `😻 분석 결과: <strong>고양이(Cat)</strong> 일 확률이 <strong>${data.prediction.cat}%</strong> 입니다!`;
                    } else {
                        predictionText.innerHTML = `🐶 분석 결과: <strong>강아지(Dog)</strong> 일 확률이 <strong>${data.prediction.dog}%</strong> 입니다!`;
                    }
                }, 400);

            }, 800);
        });
    });

    // ----------------------------------------------------
    // [6] 대화형 퀴즈 채점 시스템
    // ----------------------------------------------------
    const quizOptions = document.querySelectorAll(".quiz-option");
    const answered = { 1: false, 2: false, 3: false };
    const correctAnswers = {
        1: "0 ~ 1 사이",
        2: "지도학습",
        3: "이미지 임베딩 (Image Embedding)"
    };

    quizOptions.forEach(option => {
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
                }, 1000);
            }
        });
    });

    function checkAllQuizCompleted() {
        if (answered[1] && answered[2] && answered[3]) {
            document.getElementById("quiz-success-banner").style.display = "block";
        }
    }

    function showCompletionEffect() {
        const banner = document.getElementById("quiz-success-banner");
        banner.style.display = "block";
        banner.scrollIntoView({ behavior: 'smooth' });
        
        for (let i = 0; i < 30; i++) {
            createConfettiParticle();
        }
    }

    function createConfettiParticle() {
        const confetti = document.createElement("div");
        confetti.style.position = "fixed";
        confetti.style.width = `${Math.random() * 8 + 6}px`;
        confetti.style.height = `${Math.random() * 15 + 8}px`;
        
        const colors = ["#ff6b00", "#00f0ff", "#10b981", "#fbbf24", "#ef4444"];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = `-20px`;
        confetti.style.zIndex = "9999";
        confetti.style.borderRadius = "3px";
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { top: '-20px', transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { top: '100vh', transform: `translateX(${Math.random() * 100 - 50}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1500,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });
        
        animation.onfinish = () => {
            confetti.remove();
        };
    }
});
