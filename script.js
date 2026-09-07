
(function () {
  const menuBtn = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => mobileNav.classList.toggle('is-open'));
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('is-open')));
  }

  const modal = document.getElementById('consultModal');
  const openButtons = document.querySelectorAll('.js-open-consult');
  const closeButton = modal ? modal.querySelector('.consult-close') : null;

  function openModal() {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (closeButton) closeButton.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  const form = document.getElementById('consultForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const fd = new FormData(form);
      const payload = {
        type: '상담문의',
        name: (fd.get('name') || '').trim(),
        phone: (fd.get('phone') || '').trim(),
        time: fd.get('preferred_time') || '',
        floor: '',
        interestType: fd.get('interest') || '',
        message: (fd.get('message') || '').trim()
      };

      const agree = form.querySelector('.consult-agree input[type="checkbox"]');
      if (agree && !agree.checked) {
        if (status) status.textContent = '개인정보 수집·이용에 동의해주세요.';
        return;
      }

      const submit = form.querySelector('.consult-submit');
      if (submit) {
        submit.disabled = true;
        submit.textContent = '접수 중...';
      }
      if (status) status.textContent = '상담 내용을 전달하고 있습니다.';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.message || '전송에 실패했습니다.');

        if (status) status.textContent = '상담 신청이 완료되었습니다.';
        alert('상담 신청이 완료되었습니다. 확인 후 연락드리겠습니다.');
        form.reset();
        closeModal();
      } catch (err) {
        if (status) status.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
        alert(err.message || '접수 중 오류가 발생했습니다.');
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = '상담 신청 보내기';
        }
      }
    });
  }
})();
