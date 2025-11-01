<script>
(function(){
  // abrir/fechar sidebar no mobile
  const menuBtn = document.querySelector('[data-menu]');
  const sidebar = document.querySelector('.sidebar');
  menuBtn?.addEventListener('click', ()=> sidebar.classList.toggle('open'));

  // marcar link ativo
  const here = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav a').forEach(a=>{
    const last = a.getAttribute('href').split('/').pop();
    if (last === here) a.classList.add('active');
  });

  // logout
  document.querySelectorAll('[data-logout]').forEach(b=>{
    b.addEventListener('click', ()=>{
      localStorage.removeItem('mma_token');
      window.location.href = '/login.html';
    });
  });

  // demo: carregar contadores simples (você pode trocar pelas suas rotas)
  async function bootstrapCounters(){
    try{
      const usersRes = await mmaApi.get('/api/admin/users');
      const users = await usersRes.json();
      const el = document.getElementById('kpi-usuarios');
      if (el) el.textContent = users.length;
    }catch(e){}
    try{
      const logRes = await mmaApi.get('/api/audit?limit=1');
      const logs = await logRes.json();
      const el = document.getElementById('kpi-eventos');
      if (el) el.textContent = logs.length ? 'Ativo' : '—';
    }catch(e){}
  }
  bootstrapCounters();
})();
</script>