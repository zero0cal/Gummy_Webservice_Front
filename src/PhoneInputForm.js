// src/PhoneInputForm.js
import React, { useState } from 'react';

const PhoneInputForm = ({ handlePayment }) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber) {
      handlePayment(phoneNumber); // 부모 컴포넌트로 전화번호 전달
    } else {
      alert("전화번호를 입력해주세요.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="phone">전화번호</label>
      <input
        type="text"
        id="phone"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="010-1234-5678"
      />
      <button type="submit">결제하기</button>
    </form>
  );
};

export default PhoneInputForm;
