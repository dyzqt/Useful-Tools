let weatherState = {
  city: '',
  days: 3,
  data: null,
};

function renderWeather() {
  return `
    <div class="tool-header"><h2>天气查询</h2><p>输入城市名，查看当前天气与未来温度趋势</p></div>
    <div class="card">
      <div class="form-row">
        <div class="form-group form-group-wide">
          <label for="city-input">城市名</label><input type="text" id="city-input" placeholder="输入城市名，如 Beijing、Tokyo、上海..." />
        </div>
        <div class="form-group form-group-compact">
          <button class="btn btn-primary" id="search-weather">查询</button>
        </div>
      </div>
      <div class="tabs forecast-range" aria-label="天气预报天数">
        <button class="tab-btn active" data-days="3" type="button">3 天</button>
        <button class="tab-btn" data-days="7" type="button">7 天</button>
        <button class="tab-btn" data-days="15" type="button">15 天</button>
      </div>
      <div id="weather-result"></div>
    </div>`;
}

function mountWeather() {
  $$('.forecast-range .tab-btn').forEach(btn => {
    btn.onclick = () => {
      weatherState.days = parseInt(btn.dataset.days);
      $$('.forecast-range .tab-btn').forEach(item => {
        item.classList.toggle('active', item === btn);
        item.setAttribute('aria-selected', String(item === btn));
      });
      if (weatherState.city) loadWeather();
    };
  });

  $('#search-weather').onclick = () => {
    const city = $('#city-input').value.trim();
    if (!city) { showToast('请输入城市名', 'error'); return; }
    weatherState.city = city;
    loadWeather();
  };
  $('#city-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('#search-weather').click(); });
}

async function loadWeather() {
  $('#weather-result').innerHTML = `<div class="result-panel"><div class="spinner"></div> 查询中...</div>`;
  try {
    const data = await api.weather(weatherState.city, weatherState.days);
    weatherState.data = data;
    showWeatherData(data);
  } catch (e) {
    $('#weather-result').innerHTML = `<p class="error-text">${escHtml(e.message)}</p>`;
  }
}

function weatherIcon(code) {
  if ([0, 1].includes(code)) {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="12"/><path d="M32 6v10M32 48v10M6 32h10M48 32h10M13.6 13.6l7.1 7.1M43.3 43.3l7.1 7.1M50.4 13.6l-7.1 7.1M20.7 43.3l-7.1 7.1"/></svg>`;
  }
  if ([2, 3, 45, 48].includes(code)) {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 44h25a11 11 0 0 0 0-22 16 16 0 0 0-30-4 13 13 0 0 0 5 26Z"/><path d="M14 50h38"/></svg>`;
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 36h25a10 10 0 0 0 0-20 16 16 0 0 0-30-4 12 12 0 0 0 5 24Z"/><path d="M22 46l-4 8M34 46l-4 8M46 46l-4 8"/></svg>`;
  }
  if ([71, 73, 75].includes(code)) {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 35h25a10 10 0 0 0 0-20 16 16 0 0 0-30-4 12 12 0 0 0 5 24Z"/><path d="M22 47h.01M32 53h.01M42 47h.01"/></svg>`;
  }
  if ([95].includes(code)) {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 35h25a10 10 0 0 0 0-20 16 16 0 0 0-30-4 12 12 0 0 0 5 24Z"/><path d="M35 38l-8 12h8l-5 10"/></svg>`;
  }
  return '';
}

function showWeatherData(d) {
  const code = Number(d.current.weather_code);
  const currentIcon = weatherIcon(code);
  $('#weather-result').innerHTML = `
    <div class="tool-result-block">
      <div class="weather-current">
        ${currentIcon ? `<div class="weather-icon">${currentIcon}</div>` : ''}
        <div class="weather-current-main">
          <div class="temp">${d.current.temperature ?? '--'}°C</div>
          <div class="detail">${escHtml(d.current.description)} · 风速 ${d.current.wind_speed ?? '--'} km/h</div>
        </div>
        <div class="weather-place">
          <div class="weather-city">${escHtml(d.city)}</div>
          <div class="detail">${escHtml(d.country || '')}</div>
          <div class="detail">未来 ${d.forecast_days || d.forecast.length} 天天气预报</div>
        </div>
      </div>
      ${renderWeatherChart(d.forecast)}
    </div>`;
}

function weatherIconPath(code) {
  if ([0, 1].includes(code)) {
    return `<circle cx="13" cy="13" r="5"/><path d="M13 1v4M13 21v4M1 13h4M21 13h4M4.5 4.5l2.9 2.9M18.6 18.6l2.9 2.9M21.5 4.5l-2.9 2.9M7.4 18.6l-2.9 2.9"/>`;
  }
  if ([2, 3, 45, 48].includes(code)) {
    return `<path d="M7 17h11a5 5 0 0 0 0-10 8 8 0 0 0-15 2 6 6 0 0 0 4 8Z"/>`;
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return `<path d="M7 14h11a5 5 0 0 0 0-10 8 8 0 0 0-15 2 6 6 0 0 0 4 8Z"/><path d="M8 18l-2 5M14 18l-2 5M20 18l-2 5"/>`;
  }
  if ([71, 73, 75].includes(code)) {
    return `<path d="M7 14h11a5 5 0 0 0 0-10 8 8 0 0 0-15 2 6 6 0 0 0 4 8Z"/><path d="M8 21h.01M14 23h.01M20 21h.01"/>`;
  }
  if ([95, 96, 99].includes(code)) {
    return `<path d="M7 14h11a5 5 0 0 0 0-10 8 8 0 0 0-15 2 6 6 0 0 0 4 8Z"/><path d="M15 16l-5 7h5l-3 5"/>`;
  }
  return '';
}

function renderWeatherChart(forecast) {
  if (!forecast || forecast.length === 0) return `<div class="empty">暂无预报数据</div>`;
  const width = 920;
  const height = 420;
  const padding = { left: 50, right: 30, top: 34, bottom: 104 };
  const maxValues = forecast.map(f => Number(f.temperature_max));
  const minValues = forecast.map(f => Number(f.temperature_min));
  const all = [...maxValues, ...minValues].filter(Number.isFinite);
  const minTemp = Math.floor(Math.min(...all) - 2);
  const maxTemp = Math.ceil(Math.max(...all) + 2);
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const x = i => padding.left + (forecast.length === 1 ? plotW / 2 : (plotW * i) / (forecast.length - 1));
  const y = value => padding.top + ((maxTemp - value) / (maxTemp - minTemp || 1)) * plotH;
  const path = values => values.map((value, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(value).toFixed(1)}`).join(' ');
  const grid = [0, 1, 2, 3, 4].map(i => {
    const value = minTemp + ((maxTemp - minTemp) * i) / 4;
    const gy = y(value);
    return `<line class="chart-grid" x1="${padding.left}" y1="${gy}" x2="${width - padding.right}" y2="${gy}"/><text class="chart-axis-label" x="${padding.left - 10}" y="${gy + 4}" text-anchor="end">${Math.round(value)}°</text>`;
  }).join('');
  const labels = forecast.map((f, i) => {
    const label = f.date.slice(5).replace('-', '/');
    return `
      <text class="chart-axis-label" x="${x(i)}" y="${height - 54}" text-anchor="middle">${label}</text>
      ${f.description === '未知天气' ? '' : `<g class="chart-weather-icon" transform="translate(${x(i) - 13}, ${height - 42})">${weatherIconPath(Number(f.weather_code))}</g>`}`;
  }).join('');
  const points = (values, cls) => values.map((value, i) => `<circle class="chart-point ${cls}" cx="${x(i)}" cy="${y(value)}" r="5"/>`).join('');
  const hoverAreas = forecast.map((f, i) => {
    const left = i === 0 ? padding.left - 14 : (x(i - 1) + x(i)) / 2;
    const right = i === forecast.length - 1 ? width - padding.right + 14 : (x(i) + x(i + 1)) / 2;
    const tooltipX = Math.min(Math.max(x(i) + 12, 64), width - 220);
    const tooltipY = Math.max(padding.top + 10, Math.min(y(maxValues[i]) - 76, height - padding.bottom - 92));
    return `
      <g class="chart-hover-group">
        <rect class="chart-hover-zone" x="${left}" y="${padding.top}" width="${right - left}" height="${plotH}"/>
        <line class="chart-crosshair" x1="${x(i)}" y1="${padding.top}" x2="${x(i)}" y2="${height - padding.bottom}"/>
        <g class="chart-tooltip" transform="translate(${tooltipX}, ${tooltipY})">
          <rect width="198" height="86" rx="14"/>
          <text x="14" y="22" class="tooltip-title">${f.date}</text>
          <text x="14" y="42">${escHtml(f.description)}</text>
          <text x="14" y="62">最高温：${f.temperature_max}°C</text>
          <text x="108" y="62">最低温：${f.temperature_min}°C</text>
        </g>
      </g>`;
  }).join('');

  return `
    <div class="weather-chart-card">
      <div class="weather-chart-head">
        <div>
          <h3>温度趋势</h3>
          <p>悬停折线图查看每日天气、最高温和最低温。</p>
        </div>
        <div class="chart-legend" aria-label="图例">
          <span><i class="legend-max"></i>最高温</span>
          <span><i class="legend-min"></i>最低温</span>
        </div>
      </div>
      <div class="chart-wrap">
        <svg class="weather-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="未来 ${forecast.length} 天最高温和最低温折线图">
          ${grid}
          <line class="chart-axis" x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}"/>
          ${labels}
          <path class="chart-line chart-line-max" d="${path(maxValues)}"/>
          <path class="chart-line chart-line-min" d="${path(minValues)}"/>
          ${points(maxValues, 'point-max')}
          ${points(minValues, 'point-min')}
          ${hoverAreas}
        </svg>
      </div>
    </div>`;
}
