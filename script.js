(function(){
  const modals = document.querySelectorAll('.modal-backdrop');
  const openButtons = document.querySelectorAll('.open-modal-btn');
  const closeButtons = document.querySelectorAll('.modal-close');

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

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal-backdrop')));
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

  document.querySelectorAll('.avenue-modal-form input[type="tel"]').forEach(input => {
    input.addEventListener('input', function(){
      let v = this.value.replace(/\D/g,'').slice(0,11);
      if(v.length > 7) v = v.replace(/(\d{3})(\d{4})(\d{1,4})/,'$1-$2-$3');
      else if(v.length > 3) v = v.replace(/(\d{3})(\d{1,4})/,'$1-$2');
      this.value = v;
    });
  });

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
        floor: '',
        interestType: fd.get('interestType') || '메디컬 입점'
      };

      if(!payload.name || !payload.phone || !payload.time || !fd.get('privacy')){
        alert('필수 항목을 모두 확인해주세요.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '접수 중...';
      helper.textContent = '내용을 전달하고 있습니다. 잠시만 기다려주세요.';

      try{
        const response = await fetch('/api/contact', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload)
        });
        const result = await response.json().catch(()=>({}));

        if(!response.ok || !result.ok){
          throw new Error(result.message || '전송에 실패했습니다.');
        }

        alert('상담 신청이 완료되었습니다. 확인 후 연락드리겠습니다.');
        form.reset();
        closeModal(form.closest('.modal-backdrop'));
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