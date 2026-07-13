function renderWeather() {
  return `
    <div class="tool-header"><h2>天气查询</h2><p>输入城市名，查看当前天气和未来三天预报</p></div>
    <div class="card">
      <div class="form-row">
        <div class="form-group" style="flex:3">
          <input type="text" id="city-input" placeholder="输入城市名，如 Beijing、Tokyo、上海..." />
        </div>
        <div class="form-group" style="flex:0;align-self:flex-end">
          <button class="btn btn-primary" id="search-weather">查询</button>
        </div>
      </div>
      <div id="weather-result"></div>
    </div>`;
}

function mountWeather() {
  $('#search-weather').onclick = async () => {
    const city = $('#city-input').value.trim();
    if (!city) { showToast('请输入城市名', 'error'); return; }
    $('#weather-result').innerHTML = `<div class="spinner"></div> 查询中...`;
    try {
      const data = await api.weather(city);
      showWeatherData(data);
    } catch (e) { $('#weather-result').innerHTML = `<p style="color:var(--danger)">${escHtml(e.message)}</p>`; }
  };
  $('#city-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('#search-weather').click(); });
}

function showWeatherData(d) {
  $('#weather-result').innerHTML = `
    <div style="margin-top:16px">
      <div class="weather-current">
        <div>
          <div class="temp">${d.current.temperature ?? '--'}°C</div>
          <div class="detail">${d.city}, ${d.country || ''}</div>
          <div class="detail">${d.current.description} · 风速 ${d.current.wind_speed ?? '--'} km/h</div>
        </div>
      </div>
      <div class="weather-forecast">
        ${d.forecast.map(f => `
          <div class="forecast-day">
            <div class="date">${f.date}</div>
            <div class="desc">${f.description}</div>
            <div class="temps">${f.temperature_min}° ~ ${f.temperature_max}°</div>
          </div>`).join('')}
      </div>
    </div>`;
}
