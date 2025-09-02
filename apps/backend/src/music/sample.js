const fs = require('fs');
const http = require("http");
const path = require('path');

/* 
main
-- a
b

*/

// path 파일의 경로를 만들때 문자열로
// join : 전달한 문자열들을 조합해서 경로의 문자열을 만들어준다,. "a", ".." , "b"  => "b"
// __dirname : 파일의 폴더의 경로까지 할당되는 변수

// console.log(__dirname)
// console.log(__filename)

let mypath = path.join(__dirname, "src", "SampleVideo_1280x720_30mb.mp4");

// 파일을 제어할때 사용할 경로
console.log(mypath);
// 영상이나 사진 등등 
// 서버 컴퓨터에 영상이나 이미지등등의 리소스 파일은 서버에 있어야 한다.
// 서버 로직을 다루는 서버 , 리소스들을 다루는 서버 
// S3 AWS
// 클라이언트에는 정적인 이미지들을 넣어서 배포 => 배너 혹은 아이콘 등 변경이 많지 않은 이미지들

// 서버 객체
const server = http.createServer((req, res)=>{
    // GET / HTTP/1.1
    if(req.url === "/video") {
        // statSync : 파일의 전체 크기
        // 파일이 어느정도 전송되었는지 확인
        const state = fs.statSync(mypath);
        const fileSize = state.size;
        // console.log(fileSize);
        
        // 클라이언트 측에서 Range 속성을 헤더에 담아서 보내준다.
        // video 테그로 요청을 보내면 헤더에 Range가 포함된 헤더의 내용을 요청한다.
        const headerRange = req.headers.range;
        // console.log(headerRange);
        // Range가 있으면 영상을 처리하는 방식을 나눠서 처리를 하고
        if(headerRange) {
            // 영상을 나눠서 처리하면서 버퍼링처리가 되면 영상을 재생
            const progress = headerRange.replace("bytes=", "").split("-")
            // console.log(progress);
            // 영상을 송출하다가 문제가 생겨서 서버가 종료되었다.
            // 영상을 보고있었는데 서버가 문제생겨서 끈겼다.
            // 서버가 정상적으로 동작을 하게되었을때 
            // 클라이언트가 어디까지 영상을 처리했는지 이어서 시작지점을 정해줄것.
            const start = parseInt(progress[0]);
            const end = progress[1] ? parseInt(progress[1]) : fileSize - 1;

            // 청크 크기
            const chunksize = 10 * 1024; // 3KB

            // 비디오 스트림
            // 어느 지점부터 영상을 청크단위로 다시 처리할건지
            // 매개변수 두번째에 객체의 키를 start, end 값을 영상을 어느만큼 스트림으로 가져올건지. 
            const videoStream = fs.createReadStream(mypath, {start, end});

            // 206 성공인데 리소스를 일부분만 제공했다. 일부분은 성공이야
            // 클라이언트에서 range 요청 헤더에 내용을 포함해서 보내면 컨텐츠를 처리할때 상태코드를 206으로 주면
            // 리소스를 일부분씩 제공하고있다. 라는 성공 코드
            res.writeHead(206, {
                "content-length" : chunksize, // 응답을 할때 전달하는 데이터의 길이를 지금은 작성한내용이 청크 단위로 데이터를 제공한다
                "content-type" : "video/mp4", // 제공하는 컨텐츠의 타입
                "accept-ranges" : "bytes", // 클라이언트에게 요청된 범위의 데이터를 어떤 용량으로 지원하는지.
                "content-range" : `bytes ${start}-${end}/${fileSize}`  // 제공하는 데이터의 범위를 표현
            })

            console.log(`전송 범위 : start : ${start}, end : ${end}`);
            // 부분 컨텐츠 제공
            videoStream.pipe(res);
        } else {
            // 한번에 영상을 받을때까지 처리하는 방식
            const videoStream = fs.createReadStream(mypath);
            res.writeHead(200, {
                "Content-Length" : fileSize,
                "Content-Type" : "video/mp4"
            })

            videoStream.pipe(res);
        }
    }
})

server.listen(3000, () => {
    console.log("server on~")
})