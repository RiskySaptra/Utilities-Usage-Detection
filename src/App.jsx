import React, { useRef, useState } from "react";
import axios from "axios";

const RoboflowImageDetector = () => {
  const [image, setImage] = useState(null);
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const classColors = {
    "0": "#FF0000", "1": "#FF7F00", "2": "#FFFF00", "3": "#7FFF00", "4": "#00FF00",
    "5": "#00FF7F", "6": "#00FFFF", "7": "#007FFF", "8": "#0000FF", "9": "#7F00FF"
  };

  const handleImageUpload = (event) => {
    if (event.target.files[0]) {
      setLoading(true);
      const img = new Image();
      img.src = URL.createObjectURL(event.target.files[0]);
      img.onload = () => {
        setImage(img);
        detectImage(event.target.files[0], img);
      };
    }
  };

  const detectImage = async (file, imgElement) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1];
      try {
        const response = await axios({
          method: "POST",
          url: "https://detect.roboflow.com/ssc-qazd6-xquu2/3",
          params: { api_key: "BDl6i58Nj3eKJm5PJsjY", confidence: 20 },
          data: base64Image,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        setOutput(response.data.predictions);
        drawBoxes(response.data.predictions, imgElement);
      } catch (error) {
        console.error("Error detecting image:", error);
      } finally {
        setLoading(false);
      }
    };
  };

  const drawBoxes = (detections, imgElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return;
    const ctx = canvas.getContext("2d");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  
    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
  
    detections.forEach((det) => {
      const x = det.x - det.width / 2;
      const y = det.y - det.height / 2;
      const color = classColors[det.class] || "#FF0000";
      
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      
      ctx.strokeRect(x, y, det.width, det.height);
  
      // Background for text
      const text = `${det.class}`;
      const textWidth = ctx.measureText(text).width;
      const textHeight = 16; // Approximate text height
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent background
      ctx.fillRect(x, y - textHeight - 5, textWidth + 6, textHeight + 4);
  
      // Draw the text
      ctx.fillStyle = "#FFFFFF"; // White text
      ctx.fillText(text, x + 3, y - 5);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Utilities Usage Detection</h1>
      <input
        type="file"
        accept="image/*"
        className="border p-3 rounded-lg mb-6 w-full text-sm text-gray-700"
        onChange={handleImageUpload}
      />

      {loading && <Spinner className="text-blue-500 my-4" />}
      
      {!loading && output.length > 0 && (
        <div className="text-center text-lg font-medium mt-4 text-green-600 p-4 bg-gray-100 rounded-lg shadow-md w-full">
          <p>Result</p>
          <p className="text-gray-900 font-semibold text-xl mt-1">
            {output.sort((a, b) => a.x - b.x).map((itm) => itm.class).join(" ")}
          </p>
        </div>
      )}
      
      {image && (
        <div className="relative mt-6 border border-gray-300 p-3 bg-white shadow-lg w-full rounded-lg">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
      )}
    </div>
  );
};

export default RoboflowImageDetector;


const Spinner = ({ className = "" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="w-8 h-8 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};
