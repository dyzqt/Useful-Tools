const ROUTES = {
  home:        { title: '',              render: renderHome, mount: null },
  weather:     { title: '天气查询',       render: renderWeather, mount: mountWeather },
  memos:       { title: '备忘录',         render: renderMemos, mount: mountMemos },
  countdowns:  { title: '倒计时',         render: renderCountdowns, mount: mountCountdowns },
  random:      { title: '随机工具',       render: renderRandom, mount: mountRandom },
  password:    { title: '密码生成',       render: renderPassword, mount: mountPassword },
  convert:     { title: '单位换算',       render: renderConvert, mount: mountConvert },
};

function getRoute() {
  const hash = location.hash.replace('#', '') || 'home';
  return ROUTES[hash] ? hash : 'home';
}

function navigateTo(route) {
  location.hash = route;
}

function render() {
  const route = getRoute();
  const def = ROUTES[route];
  const isHome = route === 'home';

  $('#nav-title').textContent = def.title;
  $('#nav-back').classList.toggle('hidden', isHome);
  $('#app').innerHTML = def.render();
  if (def.mount) def.mount();
}

function renderHome() {
  const cards = [
    { route: 'weather',    icon: 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z', title: '天气查询',   desc: '实时天气与三日预报，快速了解城市天气变化。' },
    { route: 'memos',      icon: 'M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 5h6m-6 4h6m-6 4h3', title: '备忘录',     desc: '记录待办事项，支持搜索、编辑和标签管理。' },
    { route: 'countdowns', icon: 'M12 6v6l4 2m4-2a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM9 2h6', title: '倒计时',      desc: '设置目标日期，直观查看剩余天、时、分。' },
    { route: 'random',     icon: 'M7 7h10v10H7V7Zm3 3h.01M14 10h.01M10 14h.01M14 14h.01M4 4l16 16', title: '随机工具',   desc: '随机数、抽签、掷骰子，适合课堂和活动场景。' },
    { route: 'password',   icon: 'M12 15v2m-5-6V8a5 5 0 0 1 10 0v3m-9 0h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z', title: '密码生成',   desc: '按长度和字符类型生成更可靠的随机密码。' },
    { route: 'convert',    icon: 'M4 7h16M7 4 4 7l3 3m10 4 3 3-3 3M4 17h16M9 12h6', title: '单位换算',   desc: '支持长度、温度、重量等常用单位快速换算。' },
  ];
  return `
    <section class="hero">
      <div class="hero-badge">校园实用工具集</div>
      <h1>把常用工具放在一起</h1>
      <p>面向学习与日常效率场景，提供天气、备忘、倒计时和轻量计算工具。</p>
    </section>
    <section class="tool-grid" aria-label="工具列表">
      ${cards.map(c => `
        <a class="tool-card" href="#${c.route}" aria-label="打开${c.title}">
          <span class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="${c.icon}" />
            </svg>
          </span>
          <span class="card-content">
            <h3>${c.title}</h3>
            <p>${c.desc}</p>
          </span>
          <span class="card-arrow" aria-hidden="true">→</span>
        </a>`).join('')}
    </section>`;
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
