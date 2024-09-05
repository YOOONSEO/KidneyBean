import cv2
import numpy as np
from matplotlib import pyplot as plt

# 이미지 불러오기
img = cv2.imread('bean_plant.jpg')

# 이미지 전처리 (예: 그레이스케일 변환, 이진화)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

# 이미지 보여주기
plt.imshow(thresh, cmap='gray')
plt.show()
