import { useState, useEffect } from 'react';

const CongratulationsPopup = ({ currentUser, generatedLuckyNumber, onClose }) => {
  const [isLuckyNumberSaved, setIsLuckyNumberSaved] = useState(false);
  const [error, setError] = useState(null);
  const [luckyNumber, setLuckyNumber] = useState(null);


  // Function to save the lucky number
  const saveLuckyNumberData = async () => {
    try {
      const res = await fetch('/api/user/save-lucky-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id, // Ensure you have the user's ID
         
        }),
      });

      const data = await res.json();
      if (data.success) {
        console.log('Lucky number saved successfully');
        setIsLuckyNumberSaved(true);
        setLuckyNumber(data.userData.luckyNumber); // ✅ Save it from backend
      } else {
        setError('Error saving lucky number: ' + data.message);
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // Call saveLuckyNumberData when the component mounts (on first render) or when tasks are completed
  useEffect(() => {
    if (currentUser && generatedLuckyNumber) {
      saveLuckyNumberData();
    }
  }, [currentUser, generatedLuckyNumber]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 border border-fuchsia-800 px-2">
          <div className="bg-white rounded-lg shadow-lg md:py-10 md:px-10 py-d px-6  max-w-md w-full text-center">
            <h2 className="md:text-[24px] text-[16px] font-bold mb-2 text-fuchsia-800 ">Congratulations!</h2>
            <p className="mb-4 text-fuchsia-800 md:text-[18px] text-[14px]"> {currentUser.firstname} {currentUser.lastname}, You have completed all tasks!</p>
            {isLuckyNumberSaved ? (
  <>
    <h3 className="md:text-[24px] text-[16px] font-semibold mb-2 text-fuchsia-800">Your Lucky Number:</h3>
    <div className="flex justify-center gap-2 mb-4 flex-wrap">
    {String(luckyNumber || '')
  .split('')
  .map((digit, index) => (
    <span
      key={index}
      className="md:text-[20px] text-[16px] font-bold  text-fuchsia-900 px-2 py-1 rounded shadow-md border border-fuchsia-800"
    >
      {digit}
    </span>
))}
    </div>
    <p className="md:text-[24px] text-[16px] text-fuchsia-800">Good luck!</p>
  </>
) : (
  <p className="mb-4">Saving your lucky number...</p>
)}
            {error && <p className="text-red-500">{error}</p>}
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-fuchsia-800 hover:bg-fuchsia-900 text-white rounded md:text-[24px] text-[16px]"
            >
              Close
            </button>
          </div>
        </div>
      )
      
};

export default CongratulationsPopup;
