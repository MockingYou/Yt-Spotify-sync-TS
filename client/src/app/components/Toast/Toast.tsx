import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ title, message, icon, color }) {
  console.log("TOAST")
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);  

  return (
    <>
        <div className="flex items-end gap-4 fixed bottom-4 right-4 z-50">
          <div
            className={`bg-${color}-500 rounded-lg shadow-lg p-4 ${
              show ? 'animate-slideup' : 'animate-slidedown'
            }`}
          >
            <div className="flex items-center">
              {icon}
              <div className="ml-3">
                <div className="text-white font-semibold">{title}</div>
                <div className="text-white">{message}</div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
