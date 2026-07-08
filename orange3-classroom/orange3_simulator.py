import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier
import numpy as np

def run_classroom_simulator():
    print("=" * 60)
    print(" [교사용 사전 점검] 오렌지3 지도학습 개념 검증 시뮬레이터")
    print("=" * 60)
    
    # 1. 1차시 회귀(Lemonade) 데이터 시뮬레이션
    print("\n▶ [1차시] 레몬에이드 예측 모델(회귀) 시뮬레이션 중...")
    # 가상의 과거 데이터 (온도 -> 판매량)
    lemonade_data = pd.DataFrame({
        'Date': ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04'],
        'Temperature': [20, 22, 25, 28], # Feature
        'Sales': [40, 44, 50, 56]         # Target (양적 데이터)
    })
    
    X_reg = lemonade_data[['Temperature']]
    y_reg = lemonade_data['Sales']
    
    reg_model = LinearRegression()
    reg_model.fit(X_reg, y_reg) # 오렌지3의 Linear Regression 위젯 역할
    
    # 내일의 날씨 예보 온도 가정
    tomorrow_temp = np.array([[24]])
    predicted_sales = reg_model.predict(tomorrow_temp)
    print(f"  * 학습 데이터 확인:\n{lemonade_data.to_string(index=False)}")
    print(f"  * [오렌지3 Predictions 결과 예측]: 내일 온도가 {tomorrow_temp[0][0]}°C 일 때, 예상 판매량 = {int(round(predicted_sales[0]))}개")
    
    # 2. 2차시 분류(Iris) 데이터 시뮬레이션
    print("\n▶ [2차시] 붓꽃 품종 분류 모델(분류) 시뮬레이션 중...")
    # 가상의 붓꽃 데이터 (꽃잎길이, 꽃잎너비 -> 품종)
    iris_data = pd.DataFrame({
        'Petal_Length': [1.4, 1.5, 4.7, 4.5, 6.0, 5.1], # Feature
        'Petal_Width':  [0.2, 0.4, 1.4, 1.5, 2.5, 2.4], # Feature
        'Species': ['Setosa', 'Setosa', 'Versicolor', 'Versicolor', 'Virginica', 'Virginica'] # Target (범주형)
    })
    
    X_cls = iris_data[['Petal_Length', 'Petal_Width']]
    y_cls = iris_data['Species']
    
    clf_model = DecisionTreeClassifier(max_depth=2)
    clf_model.fit(X_cls, y_cls) # 오렌지3의 Tree 위젯 역할
    
    # 새로운 미지의 꽃 데이터 측정값
    unknown_flower = np.array([[4.8, 1.6]])
    predicted_species = clf_model.predict(unknown_flower)
    print(f"  * 학습 데이터 확인:\n{iris_data.to_string(index=False)}")
    print(f"  * [오렌지3 Predictions 결과 예측]: 새로운 꽃(꽃잎 길이:{unknown_flower[0][0]}, 너비:{unknown_flower[0][1]})의 예측 품종 = {predicted_species[0]}")
    print("\n" + "=" * 60)
    print(" 상태 확인 완료: 데이터 및 모델 파이프라인이 정상 작동합니다. 수업 진행 가능!")
    print("=" * 60)

if __name__ == "__main__":
    run_classroom_simulator()
