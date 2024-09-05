HUM = []
lx = []
img = []
date = []
time = []
Dday = 1
cnt = 0

DateProcess = (D) => {
    YYYY = '20' + D.substr(6, 2)
    MM = D.substr(0, 2)
    DD = D.substr(3, 2)

    if (MM.substr(0, 1) == 0) {
        MM = MM.substr(1, 1)
    }

    if (DD.substr(0, 1) == 0) {
        DD = DD.substr(1, 1)
    }

    HH = D.substr(9, 2)
    mm = D.substr(12, 2)

    if (HH.substr(0, 1) == 0) {
        HH = HH.substr(1, 1)
    }

    if (mm.substr(0, 1) == 0) {
        mm = mm.substr(1, 1)
    }



    return {'date': YYYY + '년 ' + MM + '월 ' + DD + '일 ', 'time': HH + '시 ' + mm + '분'}
}

WS = () => {
        // WebSocket 서버에 연결
        const ws = new WebSocket('ws://165.246.170.164:8765');
        console.log("connect")

        // WebSocket 연결이 열릴 때 호출됨
        ws.onopen = function(event) {
            console.log('Connected to WebSocket server.');
        };
    
        // 서버로부터 메시지를 받을 때 호출됨
        ws.onmessage = function(event) {
            try {
                cnt += 1
                console.log(cnt)

                // 서버에서 받은 메시지 (JSON 형식)
                const data = JSON.parse(event.data);
                const processedData = DateProcess(data.time);

                HUM.push({[cnt] : data.HUM})
                lx.push({[cnt] : data.lx})
                img.push({[cnt] : data.frame})
                date.push({[cnt] : processedData.date})
                time.push({[cnt] : processedData.time})
                
                // 일자가 바뀌었는지 확인하기 위해 이전 날짜와 비교
                if (cnt > 1 && date[cnt - 1][cnt] !== processedData.date) {
                    Dday += 1;
                }

                if (cnt == 1 || cnt % 30 == 0) {
                    Add_box(Dday, date[cnt-1][cnt], time[cnt-1][cnt], cnt)
                }
                
            } catch (e) {
                console.error('Error parsing JSON: ', e);
            }
        };
    
        // WebSocket 연결이 닫힐 때 호출됨
        ws.onclose = function(event) {
            console.log('Disconnected from WebSocket server.');
        };
    
        // WebSocket 오류가 발생할 때 호출됨
        ws.onerror = function(event) {
            console.error('WebSocket error: ', event);
        };
}

Add_box = (Dday, day, time, cnt) => {
    document.getElementById('Wrapper').insertAdjacentHTML("afterbegin",
        "<div style='display: flex; flex-direction: row; margin-bottom: 2vh' onclick='Diary(" + Dday + ',' + cnt + ")'>"+
            "<div class='Acc'>"+
                "<div class='Acc_1'></div>"+
                "<div class='Acc_2'></div>"+
            "</div>"+
            "<div class='Box'>"+
                "<div class='Weather'>"+
                    "<img src='https://i.ibb.co/HTCFzpp/sun.png'/>"+
                "</div>"+
                "<div>"+
                    "<h1 class='txt' style='font-size: 4vh'>" + Dday + "일차</h1>"+
                    "<p class='txt'>" + day + "</p>"+
                    "<p class='txt'>" + time + "</p>"+
                "</div>"+
            "</div>"+
        "</div>")
}

Diary = (Dday, cnt) => {
    document.getElementById('MAIN').style.display = 'none' 
    document.getElementById('DIARY').style.display = 'flex'
    document.getElementById('DIARY').innerHTML =
    "<div id='Info'>"+
        "<p onclick='Home()'>강낭콩</p>"+
        "<img src='https://i.ibb.co/Z125GsP/green-beans.png' style=''/>"+
    "</div>"+
    "<div id='Wrapper2'>"+
        "<img id='imageFrame'/>"+
        "<p class='txt' style='width: 100%; padding: 3% 0; border: 13px solid #DFF2ED; text-align: center; font-weight: bold;'>" + Dday + "일차</p>"+
        "<div style='width: 100%; margin-bottom: 3%; display: flex; align-items: center; justify-content: space-between; border: 13px solid #DFF2ED; font-weight: bold;'>"+
            "<p class='txt' style='padding: 3% 3%; margin: 0;'>" + date[cnt-1][cnt] + "</p>"+
            "<p class='txt' style='padding: 3% 3%; margin: 0;'>" + time[cnt-1][cnt] + "</p>"+
        "</div>"+
        "<div style='width: 100%; display: flex; align-items: center; justify-content: space-between; border: 13px solid #DFF2ED; font-weight: bold;'>"+
            "<p class='txt' style='padding: 3% 3%; margin: 0;'> 조도&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + lx[cnt-1][cnt] + "</p>"+
            "<p class='txt' style='padding: 3% 3%; margin: 0;'>습도&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + HUM[cnt-1][cnt] + "</p>"+
        "</div>"+
        "<p id='Analyze' class='txt'" +
        "style='width: 100%; padding: 3% 0; background-color: #DFF2ED; text-align: center;'"+
        ">분석</p>"+
    "</div>";

    // 이미지 데이터 추출 및 표시 (Base64로 인코딩된 이미지)
    document.getElementById("imageFrame").src = 'data:image/jpeg;base64,' + img[cnt-1][cnt];
}

Main = () => {
    document.getElementById('MAIN').innerHTML =
    "<div id='Info'>"+
        "<p>강낭콩</p>"+
        "<img src='https://i.ibb.co/Z125GsP/green-beans.png'/>"+
    "</div>"+
    "<div id='Wrapper'>"+
    "</div>";
}

Home = () => {
    document.getElementById('DIARY').style.display = 'none' 
    document.getElementById('MAIN').style.display = 'flex'
}

WS()