// 21개 손가락 랜드마크 정보 데이터베이스
const landmarkData = {
    0: { name: "WRIST (손목)", desc: "모든 손가락 마디의 기초가 되는 중심점입니다. 손목의 중앙에 위치합니다." },
    1: { name: "THUMB_CMC (엄지 시작 마디)", desc: "엄지손가락이 손목뼈와 연결되는 가장 아랫부분 마디입니다." },
    2: { name: "THUMB_MCP (엄지 둘째 마디)", desc: "엄지손가락의 두 번째 관절입니다. 엄지를 굽힐 때 중심 역할을 합니다." },
    3: { name: "THUMB_IP (엄지 셋째 마디)", desc: "엄지손가락의 마지막 관절입니다. 손톱 바로 아랫부분에 위치합니다." },
    4: { name: "THUMB_TIP (엄지 끝)", desc: "엄지손가락의 맨 끝 지점입니다. 손가락 끝 랜드마크는 집기 제스처 등의 감지에 필수적입니다." },
    5: { name: "INDEX_FINGER_MCP (검지 시작 마디)", desc: "검지손가락이 손등뼈와 연결되는 손가락 시작 마디입니다." },
    6: { name: "INDEX_FINGER_PIP (검지 둘째 마디)", desc: "검지손가락의 두 번째 관절입니다. 손가락을 구부릴 때 많이 쓰입니다." },
    7: { name: "INDEX_FINGER_DIP (검지 셋째 마디)", desc: "검지손가락의 세 번째 관절입니다. 손톱 바로 아래에 위치합니다." },
    8: { name: "INDEX_FINGER_TIP (검지 끝)", desc: "검지손가락의 맨 끝 지점입니다. 마우스 클릭 제스처를 만들 때 자주 사용됩니다." },
    9: { name: "MIDDLE_FINGER_MCP (중지 시작 마디)", desc: "가장 긴 중지손가락이 손등뼈와 연결되는 시작 지점입니다." },
    10: { name: "MIDDLE_FINGER_PIP (중지 둘째 마디)", desc: "중지손가락의 두 번째 관절입니다." },
    11: { name: "MIDDLE_FINGER_DIP (중지 셋째 마디)", desc: "중지손가락의 세 번째 관절입니다." },
    12: { name: "MIDDLE_FINGER_TIP (중지 끝)", desc: "중지손가락의 맨 끝 지점입니다." },
    13: { name: "RING_FINGER_MCP (약지 시작 마디)", desc: "약지손가락이 손등뼈와 연결되는 시작 지점입니다." },
    14: { name: "RING_FINGER_PIP (약지 둘째 마디)", desc: "약지손가락의 두 번째 관절입니다." },
    15: { name: "RING_FINGER_DIP (약지 셋째 마디)", desc: "약지손가락의 세 번째 관절입니다." },
    16: { name: "RING_FINGER_TIP (약지 끝)", desc: "약지손가락의 맨 끝 지점입니다." },
    17: { name: "PINKY_MCP (새끼 시작 마디)", desc: "가장 작은 새끼손가락이 손등뼈와 연결되는 시작 지점입니다." },
    18: { name: "PINKY_PIP (새끼 둘째 마디)", desc: "새끼손가락의 두 번째 관절입니다." },
    19: { name: "PINKY_DIP (새끼 셋째 마디)", desc: "새끼손가락의 세 번째 관절입니다." },
    20: { name: "PINKY_TIP (새끼 끝)", desc: "새끼손가락의 맨 끝 지점입니다." }
};

// 가상 아두이노 연동 확장 컨텐츠
const arduinoSerialCode = `
import cv2
import mediapipe as mp
import serial # 아두이노 통신용 라이브러리 (pip install pyserial 필요)
import time

# 아두이노와 연결 (포트 번호 'COM3' 등 본인 환경에 맞춰 수정)
# pySerial은 아두이노와 시리얼 통신을 열어줍니다.
try:
    py_serial = serial.Serial(port='COM3', baudrate=9600, timeout=1)
    print("아두이노 연결 성공!")
except Exception as e:
    print("아두이노 연결 실패. 포트를 확인하세요:", e)
    py_serial = None

# 미디어파이프 초기화
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

# 웹캠 켜기
cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, image = cap.read()
    if not success:
        continue

    # 미디어파이프 분석을 위해 BGR 이미지를 RGB로 변환
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # 엄지 끝(4번)과 검지 끝(8번) 랜드마크 좌표 가져오기
            thumb_tip = hand_landmarks.landmark[4]
            index_tip = hand_landmarks.landmark[8]

            # 두 손가락 끝 사이의 거리 계산 (x, y 좌표 차이)
            distance = ((thumb_tip.x - index_tip.x)**2 + (thumb_tip.y - index_tip.y)**2)**0.5
            
            # 거리가 0.05 이하로 매우 가까워지면 (집기 제스처) 아두이노로 신호 전달
            if distance < 0.05:
                print("👍 손가락 집기 감지 -> LED ON!")
                if py_serial:
                    py_serial.write(b'H') # 아두이노로 'H'(High) 전송
            else:
                if py_serial:
                    py_serial.write(b'L') # 아두이노로 'L'(Low) 전송

    # 'q' 키를 누르면 종료
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
if py_serial:
    py_serial.close()
`;

const arduinoInoCode = `
// 아두이노 스케치 코드
// 파이썬으로부터 데이터를 받아 내장 LED(13번 핀)를 켜고 끕니다.

int ledPin = 13; // 아두이노 보드 내장 LED 핀 번호

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600); // 파이썬과 속도를 맞춰 시리얼 통신 시작
}

void loop() {
  if (Serial.available() > 0) {
    char data = Serial.read(); // 파이썬이 보낸 문자 1글자 읽기
    
    if (data == 'H') {
      digitalWrite(ledPin, HIGH); // LED 켜기
    } else if (data == 'L') {
      digitalWrite(ledPin, LOW);  // LED 끄기
    }
  }
}
`;

document.addEventListener("DOMContentLoaded", () => {
    // 1. 상태 변수 및 요소 초기화
    let currentStep = 1;
    const totalSteps = 5;
    
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const progressFill = document.getElementById("progress-fill");
    
    const steps = document.querySelectorAll(".step-indicator");
    const tabPanels = document.querySelectorAll(".tab-content");
    
    // 2. 단계 전환 내비게이션
    function updateNavigation() {
        // 이전/다음 버튼 활성화 상태 조절
        prevBtn.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            nextBtn.innerHTML = `학습 완료 🎉`;
            nextBtn.classList.add("btn-success");
        } else {
            nextBtn.innerHTML = `다음 단계 ➔`;
            nextBtn.classList.remove("btn-success");
        }
        
        // 상단 인디케이터 상태 업데이트
        steps.forEach((step, idx) => {
            const stepNum = idx + 1;
            step.classList.remove("active", "completed");
            
            if (stepNum === currentStep) {
                step.classList.add("active");
            } else if (stepNum < currentStep) {
                step.classList.add("completed");
            }
        });
        
        // 진행률 게이지 채우기
        const fillPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${fillPercent}%`;
        
        // 탭 패널 전환
        tabPanels.forEach(panel => {
            panel.classList.remove("active");
            if (parseInt(panel.dataset.step) === currentStep) {
                panel.classList.add("active");
            }
        });
        
        // 특정 단계 진입 시 특수 처리 (카메라 자동 끄기 등)
        if (currentStep !== 1) {
            stopCamera();
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
            // 학습 완료 시 축하 피드백
            showCompletionEffect();
        }
    });
    
    // 인디케이터 상단 숫자를 직접 클릭해서 이동할 수 있도록 함
    steps.forEach((step, idx) => {
        step.addEventListener("click", () => {
            currentStep = idx + 1;
            updateNavigation();
        });
    });

    // 3. 환경 설정 체크리스트 기능
    const checklistItems = document.querySelectorAll(".checklist-item");
    checklistItems.forEach(item => {
        const checkbox = item.querySelector("input[type='checkbox']");
        item.addEventListener("click", (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            if (checkbox.checked) {
                item.classList.add("checked");
            } else {
                item.classList.remove("checked");
            }
        });
    });

    // 4. 인터랙티브 SVG 랜드마크 탐색기
    const nodes = document.querySelectorAll(".landmark-node");
    const infoDisplay = document.getElementById("landmark-info");
    const infoId = document.getElementById("info-id");
    const infoName = document.getElementById("info-name");
    const infoDesc = document.getElementById("info-desc");
    
    nodes.forEach(node => {
        const id = parseInt(node.dataset.id);
        
        // 마우스 호버 시 랜드마크 정보 업데이트
        node.addEventListener("mouseenter", () => {
            // 모든 노드의 활성 클래스 해제
            nodes.forEach(n => n.classList.remove("active-node"));
            
            // 현재 노드 활성화
            node.classList.add("active-node");
            
            // 정보 로드
            const data = landmarkData[id];
            infoDisplay.classList.add("active");
            infoId.textContent = `Landmark ID: ${id}`;
            infoName.textContent = data.name;
            infoDesc.textContent = data.desc;
        });
    });

    // 5. 실시간 웹캠 및 MediaPipe Hands AI 구동
    const videoElement = document.getElementById("webcam-video");
    const canvasElement = document.getElementById("webcam-canvas");
    const canvasCtx = canvasElement.getContext("2d");
    
    const startCameraBtn = document.getElementById("btn-start-camera");
    const stopCameraBtn = document.getElementById("btn-stop-camera");
    const cameraStatus = document.getElementById("camera-status");
    
    let camera = null;
    let isHandsLoaded = false;
    let hands = null;

    // MediaPipe Hands 모듈 로드
    function initMediaPipe() {
        if (hands) return;
        
        cameraStatus.querySelector("span").textContent = "AI 모델 불러오는 중...";
        
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
        isHandsLoaded = true;
    }

    // AI 관절 추적 결과 드로잉 함수
    function onHandResults(results) {
        // 캔버스 초기화
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            cameraStatus.classList.add("active");
            cameraStatus.querySelector("span").textContent = "실시간 감지 활성화";
            
            for (const landmarks of results.multiHandLandmarks) {
                // 1. 관절 연결선(뼈대) 그리기
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                    color: '#06b6d4',
                    lineWidth: 3
                });
                
                // 2. 관절 마디점(랜드마크) 그리기
                drawLandmarks(canvasCtx, landmarks, {
                    color: '#8b5cf6',
                    lineWidth: 1,
                    radius: 4
                });

                // 엄지 끝(4)과 검지 끝(8)의 거리를 계산해 특별 인터랙션 추가하기 (선택 사항)
                const thumb = landmarks[4];
                const index = landmarks[8];
                const distance = Math.sqrt(Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2));
                
                if (distance < 0.05) {
                    // 손가락 끝이 닿았을 때 집기 효과 표시
                    canvasCtx.beginPath();
                    canvasCtx.arc(thumb.x * canvasElement.width, thumb.y * canvasElement.height, 12, 0, 2 * Math.PI);
                    canvasCtx.fillStyle = 'rgba(16, 185, 129, 0.6)';
                    canvasCtx.fill();
                    
                    canvasCtx.font = "bold 14px 'Outfit'";
                    canvasCtx.fillStyle = "#ffffff";
                    canvasCtx.fillText("PINCHED! (집기 감지)", 20, 40);
                }
            }
        } else {
            cameraStatus.classList.remove("active");
            cameraStatus.querySelector("span").textContent = "카메라 켜짐 (손을 비춰주세요)";
        }
    }

    // 웹캠 켜기 함수
    async function startCamera() {
        initMediaPipe();
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            
            videoElement.srcObject = stream;
            videoElement.classList.add("active-stream");
            
            // 버튼 상태 조절
            startCameraBtn.disabled = true;
            stopCameraBtn.disabled = false;
            
            // MediaPipe Camera Helper 연동
            camera = new Camera(videoElement, {
                onFrame: async () => {
                    await hands.send({ image: videoElement });
                },
                width: 640,
                height: 480
            });
            
            camera.start();
            cameraStatus.classList.add("active");
            cameraStatus.querySelector("span").textContent = "카메라 켜짐";
            
        } catch (err) {
            console.error("카메라를 켤 수 없습니다:", err);
            alert("카메라 사용 권한이 거부되었거나 지원되는 카메라 장치가 없습니다. 권한을 확인해주세요.");
        }
    }

    // 웹캠 끄기 함수
    function stopCamera() {
        if (camera) {
            camera.stop();
            camera = null;
        }
        if (videoElement.srcObject) {
            const tracks = videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
        }
        
        videoElement.classList.remove("active-stream");
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        startCameraBtn.disabled = false;
        stopCameraBtn.disabled = true;
        
        cameraStatus.classList.remove("active");
        cameraStatus.querySelector("span").textContent = "카메라 꺼짐";
    }

    startCameraBtn.addEventListener("click", startCamera);
    stopCameraBtn.addEventListener("click", stopCamera);

    // 6. 코드 복사 기능
    window.copyCode = function(button, elementId) {
        let codeText = "";
        if (elementId === 'py-code') {
            // 메인 템플릿 코드
            codeText = document.getElementById("code-content-main").innerText;
        } else if (elementId === 'arduino-serial-code') {
            codeText = arduinoSerialCode.trim();
        } else if (elementId === 'arduino-ino-code') {
            codeText = arduinoInoCode.trim();
        }
        
        navigator.clipboard.writeText(codeText).then(() => {
            const originalText = button.textContent;
            button.textContent = "복사 완료! ✓";
            button.style.background = "var(--success)";
            button.style.color = "white";
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = "";
                button.style.color = "";
            }, 2000);
        }).catch(err => {
            console.error("코드 복사 실패:", err);
        });
    };

    // 7. 대화형 퀴즈 시스템 채점
    const quizOptions = document.querySelectorAll(".quiz-option");
    const answered = { 1: false, 2: false, 3: false };
    const correctAnswers = {
        1: "21개",
        2: "opencv-python",
        3: "4번"
    };

    quizOptions.forEach(option => {
        option.addEventListener("click", () => {
            const questionNum = parseInt(option.dataset.question);
            const selectedText = option.dataset.value;
            
            // 이미 정답을 맞춘 문제는 클릭 방지
            if (answered[questionNum]) return;
            
            const isCorrect = selectedText === correctAnswers[questionNum];
            
            // 현재 질문의 모든 옵션을 찾아서 효과 초기화
            const siblingOptions = document.querySelectorAll(`.quiz-option[data-question="${questionNum}"]`);
            siblingOptions.forEach(opt => opt.classList.remove("correct", "incorrect"));
            
            if (isCorrect) {
                option.classList.add("correct");
                answered[questionNum] = true;
                
                // 모든 문제 정답 체크
                checkAllQuizCompleted();
            } else {
                option.classList.add("incorrect");
                // 1초 뒤 흔들림 애니메이션 해제
                setTimeout(() => {
                    option.classList.remove("incorrect");
                }, 1000);
            }
        });
    });

    function checkAllQuizCompleted() {
        if (answered[1] && answered[2] && answered[3]) {
            // 모든 퀴즈 완료 시 배너 표시
            document.getElementById("quiz-success-banner").style.display = "block";
        }
    }

    // 8. 학습 완료 세레머니
    function showCompletionEffect() {
        const banner = document.getElementById("quiz-success-banner");
        banner.style.display = "block";
        banner.scrollIntoView({ behavior: 'smooth' });
        
        // 간단한 콘페티(폭죽) 비주얼 모방 효과 추가
        for (let i = 0; i < 30; i++) {
            createConfettiParticle();
        }
    }

    function createConfettiParticle() {
        const confetti = document.createElement("div");
        confetti.style.position = "fixed";
        confetti.style.width = `${Math.random() * 8 + 6}px`;
        confetti.style.height = `${Math.random() * 15 + 8}px`;
        
        const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#fbbf24", "#ef4444"];
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
