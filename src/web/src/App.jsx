
// Basic Tailwind installation for vite (using postcss)
// But first, let's just use simple CSS or inline styles as requested ("Vanilla CSS" preferred unless user asked for Tailwind).
// Wait, the PRD says "Styling (CSS): Use Vanilla CSS for maximum flexibility and control. Avoid using TailwindCSS unless the USER explicitly requests it".
// But I just installed tailwind-merge in the previous step... habit.  I will stick to Vanilla CSS as per instructions.
// Let's create a basic App.jsx that has tabs for "Register" and "Recognize".

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './App.css';

const API_URL = "http://localhost:8000";

function App() {
  const [mode, setMode] = useState('register'); // 'register' or 'recognize'
  const webcamRef = useRef(null);
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [cameraError, setCameraError] = useState(null);

  // Fetch registered users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setRegisteredUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc;
  }, [webcamRef]);

  // Convert base64 to blob
  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const handleRegister = async () => {
    if (!name.trim()) return alert("이름을 입력해주세요.");
    const imageSrc = capture();
    if (!imageSrc) return;

    setIsRegistering(true);
    const blob = dataURLtoBlob(imageSrc);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("files", blob, "capture.jpg");

    try {
      const res = await axios.post(`${API_URL}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
      setName("");
      fetchUsers();
    } catch (err) {
      alert("등록 실패: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsRegistering(false);
    }
  };

  // Recognition Interval
  useEffect(() => {
    let interval;
    if (mode === 'recognize' && isRecognizing) {
      interval = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = capture();
          if (imageSrc) {
            const blob = dataURLtoBlob(imageSrc);
            const formData = new FormData();
            formData.append("file", blob, "query.jpg");

            try {
              const res = await axios.post(`${API_URL}/recognize`, formData);
              if (res.data.faces) {
                setRecognitionResult(res.data.faces);
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      }, 500); // 2 FPS
    }
    return () => clearInterval(interval);
  }, [mode, isRecognizing, capture]);

  return (
    <div className="container">
      <header>
        <h1>얼굴 인식 대시보드</h1>
        <div className="tabs">
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            얼굴 등록
          </button>
          <button
            className={mode === 'recognize' ? 'active' : ''}
            onClick={() => setMode('recognize')}
          >
            실시간 인식
          </button>
        </div>
      </header>

      <main>
        <div className="camera-container">
          {cameraError ? (
            <div className="error-message" style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
              <h3>🚫 카메라 오류 발생</h3>
              <p>{cameraError}</p>
              <p>1. 브라우저 주소창 왼쪽 아이콘을 눌러 카메라 권한을 확인하세요.</p>
              <p>2. 다른 프로그램(Zoom 등)이 카메라를 사용 중인지 확인하세요.</p>
            </div>
          ) : (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={640}
                height={480}
                videoConstraints={{ facingMode: "user" }} // Remove this line if camera is external USB
                onUserMediaError={(err) => setCameraError(err.message || "카메라 접근 불가")}
              />

              {/* Overlay for Recognition Results */}
              {mode === 'recognize' && recognitionResult.map((face, i) => (
                <div
                  key={i}
                  className="face-box"
                  style={{
                    left: face.box[0],
                    top: face.box[1],
                    width: face.box[2] - face.box[0],
                    height: face.box[3] - face.box[1],
                    borderColor: face.name !== "Unknown" ? '#00ff00' : '#ff0000'
                  }}
                >
                  <span className="face-label" style={{ backgroundColor: face.name !== "Unknown" ? '#00ff00' : '#ff0000' }}>
                    {face.name} ({Math.round(face.score * 100)}%)
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="controls">
          {mode === 'register' ? (
            <div className="register-panel">
              <input
                type="text"
                placeholder="이름 입력 (예: 홍길동)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button onClick={handleRegister} disabled={isRegistering}>
                {isRegistering ? "등록 중..." : "📸 사진 찍어 등록하기"}
              </button>

              <h3>등록된 사용자 목록</h3>
              <ul>
                {registeredUsers.map(u => (
                  <li key={u.name}>{u.name} (사진 {u.image_count}장)</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="recognize-panel">
              <button
                className={isRecognizing ? "stop-btn" : "start-btn"}
                onClick={() => setIsRecognizing(!isRecognizing)}
              >
                {isRecognizing ? "⏹ 인식 중지" : "▶ 인식 시작"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
