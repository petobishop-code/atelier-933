(function(){
  const modals = document.querySelectorAll('.modal-backdrop');

  function openModal(id){
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  }

  function closeModal(modal){
    if(!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('.open-modal-btn');
    if(opener){
      e.preventDefault();
      openModal(opener.dataset.modal);
      return;
    }
    const closer = e.target.closest('.modal-close');
    if(closer){
      closeModal(closer.closest('.modal-backdrop'));
    }
  });

  modals.forEach(modal => {
    modal.addEventListener('click', e => {
      if(e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.modal-backdrop.is-open').forEach(closeModal);
    }
  });

  function formatPhone(input){
    let v = input.value.replace(/\D/g,'').slice(0,11);
    if(v.length > 7) v = v.replace(/(\d{3})(\d{4})(\d{1,4})/,'$1-$2-$3');
    else if(v.length > 3) v = v.replace(/(\d{3})(\d{1,4})/,'$1-$2');
    input.value = v;
  }

  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => formatPhone(input));
  });

  async function sendContact(payload){
    const response = await fetch('/api/contact', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const result = await response.json().catch(()=>({}));
    if(!response.ok || !result.ok){
      throw new Error(result.message || '전송에 실패했습니다.');
    }
    return result;
  }

  window.requestCall = async function(e){
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = (form.querySelector('[name="name"]')?.value || '').trim();
    const phone = (form.querySelector('[name="phone"]')?.value || '').trim();
    const interestType = form.querySelector('[name="interestType"]')?.value || '';
    const dept = (form.querySelector('[name="dept"]')?.value || '').trim();

    if(!name || !phone){
      alert('성함과 연락처를 입력해주세요.');
      return false;
    }

    const originalText = submitBtn ? submitBtn.textContent : '';
    if(submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = '접수 중...';
    }

    try{
      await sendContact({
        type:'메디컬상담',
        name,
        phone,
        time:'상담 요청 후 조율',
        interestType,
        dept
      });
      alert('상담 신청이 완료되었습니다. 확인 후 연락드리겠습니다.');
      form.reset();
    }catch(err){
      alert(err.message || '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }finally{
      if(submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || '상담 요청하기';
      }
    }
    return false;
  };

  document.querySelectorAll('.avenue-modal-form').forEach(form => {
    form.addEventListener('submit', async function(e){
      e.preventDefault();

      const submitBtn = form.querySelector('.contact-submit');
      const helper = form.querySelector('.form-helper');
      const fd = new FormData(form);

      const payload = {
        type: form.dataset.formType || '메디컬상담',
        name: (fd.get('name') || '').trim(),
        phone: (fd.get('phone') || '').trim(),
        time: fd.get('time') || '',
        interestType: fd.get('interestType') || '메디컬 입점',
        dept: ''
      };

      if(!payload.name || !payload.phone || !payload.time || !fd.get('privacy')){
        alert('필수 항목을 모두 확인해주세요.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '접수 중...';
      helper.textContent = '내용을 전달하고 있습니다. 잠시만 기다려주세요.';

      try{
        await sendContact(payload);
        alert('상담 신청이 완료되었습니다. 확인 후 연락드리겠습니다.');
        form.reset();
        closeModal(form.closest('.modal-backdrop'));
        helper.textContent = '상담 신청 내용은 담당자에게 바로 전달됩니다.';
      }catch(err){
        alert(err.message || '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        helper.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
      }finally{
        submitBtn.disabled = false;
        submitBtn.textContent = '상담 신청하기';
      }
    });
  });
})();
