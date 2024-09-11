import React, { useState } from 'react';
import axios from 'axios';


const App = () => {
//useState를 사용하여 formData의 상태를 관리
//storeName, roadAddress, phoneNumber은 사용자로부터 입력받음.
//결제 정보의 기본값은 card로 설정되어 있음.
  const [formData, setFormData] = useState({
    storeName: '',
    roadAddress: '',
    phoneNumber: '',
    paymentMethod: 'card'  // 기본 결제 방식은 'card'
  });


//입력값 변경 핸들러 (handleInputChange)
  //사용자가 입력한 값을 실시간으로 formData에 업데이트 하는 함수
  //여기는 아직 제대로 이해가 안되었음(XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  //For 결제 고유번호, 타임 스탬프 + 랜덤 문자열
  const generateUniqueId = () => {
    const timestamp = Date.now().toString(); //현재 시간을 밀리초 단위로 가져오기
    const randomString = Math.random().toString(36).slice(2, 9); //랜덤한 문자열 생성

    return `${timestamp}_${randomString}`; //타임스탬프와 랜덤 문자열을 결합하여, 고유한 ID 생성
  }

  //포트원 결제 함수(20240910)
  const requestPayment = () => {
    //window 객체에서 IMP를 사용하기 위한 설정.
    const { IMP } = window; 
    IMP.init(process.env.REACT_APP_IMP_CODE);

    //고유 주문번호 생성
    const uniqueMerchantUid = generateUniqueId(); //타임 스탬프와 랜덤 문자열로, 사용자마다 고유한 주문번호 생성

    //포트원에게 결제 요청을 보내는 로직
    IMP.request_pay({
      pg: 'kakaopay.TC0ONETIME', //사용할 PG사(고정?)
      pay_method: 'card', //결제 수단
      merchant_uid: uniqueMerchantUid, //고유 주문번호 //여기는 항상 random(겹칠 가능성 매우 낮은 것으로 바꾸어야 함.)
      name: '결제 테스트(구미)', //결제할 상품명
      amount: 4900, //결제 금액
      
      //이 파트 실제 구매자에 맞게 정의 필요
      buyer_email: 'jkj3828@dgist.ac.kr',
      buyer_name: formData.storeName,
      buyer_tel: formData.phoneNumber,
      buyer_addr: formData.roadAddress,
      buyer_postcode: '42988',
    }, async (rsp) => {
      //결제 성공여부 검사
      if(rsp.success) {  
        try{
          //결제가 성공했을 경우, 서버로 결제 정보를 전달(backend 측으로 전달하는 것임)
          const response = await axios.post('http://localhost:5001/api/payment', {
            imp_uid: rsp.imp_uid, //포트원의 결제 고유번호
            merchant_uid: rsp.merchant_uid, //주문번호
            storeName: formData.storeName,
            roadAddress: formData.roadAddress,
            phoneNumber: formData.phoneNumber,
            paymentMethod: formData.paymentMethod,
            amount: rsp.paid_amount, //실제로 결제된 금액(나중에 이것을 서버와 통신해서 검증을 거쳐야하는가)
          });
          if (response.data.success) {
            alert('결제가 완료되었습니다.');
          } else{
            alert('결제 실패: ' + response.data.message);
          }
        } catch(error) {
          console.error('결제 요청 중 오류 발생:', error);
          alert('결제 요청 중, 오류가 발생했습니다.')
        }
      }else { 
        alert('결제 실패: ${rsp.error_msg}');
      }
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault(); //기본 폼이 제출될 때, 페이지가 새로고침되는 기본 동작을 방지(제출된 입력값들을 유지하기 위해서는 이것이 절대적임)
    console.log('서버로 요청을 보냅니다:', formData);  // 요청 전 로그 추가

    //결제 요청, 결제 성공 시 서버로 결제 및 클라이언트 정보를 전달
    requestPayment(); //결제 처리를 위한 함수. 
  };

  return (
    //폼이 제출될 경우, handleSubmit 함수의 호출(결제 기능)
    <form onSubmit={handleSubmit}>
      <label>가게명:</label>
      <input type="text" name="storeName" value={formData.storeName} onChange={handleInputChange} required />
      <br />
      <label>도로명 주소:</label>
      <input type="text" name="roadAddress" value={formData.roadAddress} onChange={handleInputChange} required />
      <br />
      <label>전화번호:</label>
      <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
      <br />
      <label>결제 방식:</label>
      <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
        <option value="card">카드</option>
        <option value="bank">계좌 이체</option>
      </select>
      <br />
      <button type="submit">결제하기</button>
    </form>
  );
};

export default App;