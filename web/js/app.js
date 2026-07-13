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
    { route: 'weather',    icon: '🌤️', title: '天气查询',   desc: '输入城市名，查看实时天气和未来三天预报，数据来自 Open-Meteo' },
    { route: 'memos',      icon: '📝', title: '备忘录',     desc: '记录待办事项，支持搜索过滤、标签分类，数据本地持久化' },
    { route: 'countdowns', icon: '⏰', title: '倒计时',      desc: '设置目标日期，实时计算剩余天、时、分，支持过期标记' },
    { route: 'random',     icon: '🎲', title: '随机工具',   desc: '随机数生成、抽签、掷骰子，多种随机玩法' },
    { route: 'password',   icon: '🔐', title: '密码生成',   desc: '自定义长度和字符类型，一键生成安全密码' },
    { route: 'convert',    icon: '📐', title: '单位换算',   desc: '长度、温度、重量等多种单位一键换算' },
  ];
  return `
    <div class="hero">
      <h1>实用工具聚合站</h1>
      <p>一站式校园实用工具，涵盖天气、备忘录、倒计时、随机工具等模块</p>
    </div>
    <div class="tool-grid">
      ${cards.map(c => `
        <a class="tool-card" href="#${c.route}">
          <div class="card-icon">${c.icon}</div>
          <h3>${c.title}</h3>
          <p>${c.desc}</p>
        </a>`).join('')}
    </div>`;
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
