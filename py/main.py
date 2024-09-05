import cv2
import numpy as np
from matplotlib import pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.preprocessing import image

# Step 1: 이미지 처리 (그레이스케일 변환 및 경계선 검출)
def process_image(img_path):
    img = cv2.imread(img_path)

    # 그레이스케일 변환
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 이진화 처리
    _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

    # 경계선 검출
    edges = cv2.Canny(thresh, 100, 200)

    # 결과 이미지 보여주기
    plt.imshow(edges, cmap='gray')
    plt.title('Processed Image')
    plt.show()

    return thresh

# Step 2: 강낭콩에 특화된 특징 추출
def extract_features(mask):
    # 경계선 기반 윤곽선 추출
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # 잎의 개수
    leaf_count = len(contours)
    print(f'발견된 잎의 개수: {leaf_count}')

    # 잎의 면적 계산
    leaf_areas = [cv2.contourArea(contour) for contour in contours]
    average_leaf_area = np.mean(leaf_areas) if leaf_areas else 0
    print(f'평균 잎 면적: {average_leaf_area}')

    # 줄기의 높이 계산
    min_y = float('inf')
    max_y = float('-inf')
    for contour in contours:
        for point in contour:
            y = point[0][1]
            min_y = min(min_y, y)
            max_y = max(max_y, y)
    
    stem_height = max_y - min_y if max_y != float('-inf') and min_y != float('inf') else 0
    print(f'줄기의 길이: {stem_height}')

    return leaf_count, average_leaf_area, stem_height

# Step 3: CNN 모델 설계 및 훈련
def create_model():
    model = models.Sequential()
    model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)))
    model.add(layers.MaxPooling2D((2, 2)))

    model.add(layers.Conv2D(64, (3, 3), activation='relu'))
    model.add(layers.MaxPooling2D((2, 2)))

    model.add(layers.Conv2D(128, (3, 3), activation='relu'))
    model.add(layers.MaxPooling2D((2, 2)))

    model.add(layers.Conv2D(128, (3, 3), activation='relu'))
    model.add(layers.MaxPooling2D((2, 2)))

    model.add(layers.Flatten())
    model.add(layers.Dense(512, activation='relu'))
    model.add(layers.Dense(4, activation='softmax'))  # 성장 단계 4개 분류

    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model

# Step 4: 데이터 전처리 및 모델 훈련
def train_model():
    train_datagen = ImageDataGenerator(
        rescale=1./255, 
        shear_range=0.2,  
        zoom_range=0.2,  
        horizontal_flip=True  
    )

    test_datagen = ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_directory(
        'data/train',
        target_size=(150, 150),
        batch_size=32,
        class_mode='categorical'
    )

    validation_generator = test_datagen.flow_from_directory(
        'data/validation',
        target_size=(150, 150),
        batch_size=32,
        class_mode='categorical'
    )

    model = create_model()

    # 모델 훈련
    model.fit(
        train_generator,
        steps_per_epoch=100,
        epochs=10,
        validation_data=validation_generator,
        validation_steps=50
    )

    # 모델 저장
    model.save('bean_growth_model.h5')

# Step 5: 새로운 이미지로 예측하기
def predict_growth_stage(model_path, img_path):
    model = tf.keras.models.load_model(model_path)

    # 이미지 전처리
    img = image.load_img(img_path, target_size=(150, 150))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0

    # 예측
    predictions = model.predict(img_array)
    predicted_class = np.argmax(predictions)
    print(f'예측된 성장 단계: {predicted_class}')

# 실행 예시
if __name__ == "__main__":
    # Step 1: 이미지 처리
    mask = process_image('new_bean_plant.jpg')

    # Step 2: 특징 추출
    leaf_count, avg_leaf_area, stem_height = extract_features(mask)

    # Step 4: 모델 훈련
    # train_model()  # 한 번만 훈련

    # Step 5: 예측
    predict_growth_stage('bean_growth_model.h5', 'new_bean_plant.jpg')
