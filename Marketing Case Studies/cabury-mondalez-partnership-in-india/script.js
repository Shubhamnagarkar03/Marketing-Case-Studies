/* ==============================================
   main.js — Biscoff India Case Study
   D3 Visualisations + Counter Animations
   ============================================== */

'use strict';

// ── COLOUR TOKENS — navy + amber palette ─────────────────────
const C = {
  amber:       '#E8A020',
  amberLight:  '#F5BE50',
  amberDim:    'rgba(232,160,32,0.12)',
  navy:        '#0D1117',
  navyMid:     '#161C26',
  navySoft:    '#1E2736',
  navyBorder:  'rgba(255,255,255,0.07)',
  cream:       '#FAFAF5',
  creamBorder: 'rgba(15,20,30,0.08)',
  ink:         '#0D1117',
  inkMid:      '#3A4455',
  inkSoft:     '#6B7A8D',
  inkFaint:    '#9AAABB',
  onDark:      '#E8ECF0',
  onDarkSoft:  '#6E7D8F',
  green:       '#2E7D5A',
  greenPale:   '#E0F0E8',
  red:         '#C0342C',
  redLight:    '#E07070',
  purple:      '#5B3FA0',
  gridLight:   'rgba(15,20,30,0.05)',
  gridDark:    'rgba(255,255,255,0.05)',
};

// ── TIMELINE DATA ─────────────────────────────────────────────
const TIMELINE = [
  { date: 'Pre-2020',  title: 'The Import Era',
    body: 'Biscoff arrives in India as a niche import — ₹300–400 for 250g at airports and gourmet stores. Tiny market share, massive aspirational aura.' },
  { date: 'H1 2023',   title: 'A Glaring White Space',
    body: 'India contributes just 0.2% of Lotus Bakeries\' €1.06B global revenue. Yet urban Gen Z buzz and social-media virality signal enormous latent demand.' },
  { date: 'Jun 2024',  title: 'The Deal is Signed',
    body: 'Mondelēz International and Lotus Bakeries announce a strategic licensing + distribution partnership. Mondelēz will manufacture, market, and distribute Biscoff across India.' },
  { date: 'Late 2024', title: 'Bournville Moves in 3 Weeks',
    body: 'In the UK, the Cadbury Dairy Milk × Biscoff bar goes from project kickoff to production line trial in just 3 weeks — signalling the agility both companies will bring to this partnership.' },
  { date: 'Early 2025', title: 'Rajasthan Line Goes Live',
    body: 'A Biscoff production line comes online in Alwar, Rajasthan. Local manufacturing requires a locally-sourced formulation — palm oil becomes the primary fat source to hit ₹10 price targets.' },
  { date: 'Nov 2025',  title: '₹10. Kirana Shelves. All of India.',
    body: 'Biscoff officially launches at ₹10 per pack across traditional trade, modern retail, and quick-commerce. A European cult import becomes a mass-market Indian product overnight.' },
  { date: '2026 →',    title: 'The Story Isn\'t Over',
    body: 'Co-branded innovations, planned ice-cream ventures via Froneri, new markets. Lotus targets Top 3 global market status for India. The questions — about recipe, health, and equity — travel with the brand.' },
];

// ── BUILD TIMELINE ────────────────────────────────────────────
function buildTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;
  TIMELINE.forEach((evt, i) => {
    const el = document.createElement('div');
    el.className = 'tl-item';
    el.style.transitionDelay = `${i * 0.07}s`;
    el.innerHTML = `
      <div class="tl-date">${evt.date}</div>
      <div class="tl-line"></div>
      <div class="tl-body"><h4>${evt.title}</h4><p>${evt.body}</p></div>`;
    container.appendChild(el);
  });
}

// ── COUNTER ANIMATION ─────────────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target   = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0');
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();

    function tick(now) {
      const t    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val  = ease * target;
      el.textContent = val.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  });
}

// ── PRICE COMPARISON CHART ────────────────────────────────────
function buildPriceChart() {
  const el = document.getElementById('price-chart');
  if (!el || el.dataset.built) return;
  el.dataset.built = '1';

  const data = [
    { label: 'Biscoff Imported\n(pre-Nov 2025)', price: 152, color: '#8A9AAB', note: 'Import' },
    { label: 'Biscoff India\n(Mondelēz, 2025)', price: 45,  color: C.amber,  note: '↓97% drop', highlight: true },
    { label: 'Oreo (Mondelēz)',                 price: 42,  color: '#9B80D0' },
    { label: 'Britannia Good Day',              price: 28,  color: '#6B8A7A' },
    { label: 'Sunfeast Dark Fantasy',           price: 55,  color: C.amberLight },
    { label: 'Parle-G',                        price: 10,  color: '#7A8A90' },
  ];

  const margin = { top: 16, right: 90, bottom: 56, left: 180 };
  const svgW = Math.max(el.parentElement.clientWidth - 90, 300);
  const w    = svgW - margin.left - margin.right;
  const h    = data.length * 48;

  const svg = d3.select(el).append('svg')
    .attr('width', '100%').attr('height', h + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${svgW} ${h + margin.top + margin.bottom}`)
    .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 170]).range([0, w]);
  const y = d3.scaleBand().domain(data.map(d => d.label)).range([0, h]).padding(0.35);

  // Grid
  svg.append('g').attr('class', 'grid')
    .call(d3.axisTop(x).ticks(5).tickSize(-h).tickFormat(''));

  svg.append('g').attr('class', 'axis')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `₹${d}`));

  svg.append('g').attr('class', 'axis').call(d3.axisLeft(y).tickSize(0))
    .select('.domain').remove();

  // Highlight band
  data.forEach(d => {
    if (d.highlight) {
      svg.append('rect')
        .attr('x', -margin.left)
        .attr('y', y(d.label) - 6)
        .attr('width', svgW)
        .attr('height', y.bandwidth() + 12)
        .attr('fill', 'rgba(201,151,44,0.06)')
        .attr('rx', 2);
    }
  });

  // Bars
  svg.selectAll('.bar').data(data).enter().append('rect')
    .attr('class', 'bar')
    .attr('y',      d => y(d.label))
    .attr('height', y.bandwidth())
    .attr('x', 0).attr('width', 0)
    .attr('fill',   d => d.color)
    .attr('rx', 2)
    .transition().duration(900).delay((d, i) => i * 100)
    .attr('width', d => x(d.price));

  // Labels
  svg.selectAll('.bar-lbl').data(data).enter().append('text')
    .attr('class', 'bar-lbl')
    .attr('y', d => y(d.label) + y.bandwidth() / 2 + 4)
    .attr('x', d => x(d.price) + 8)
    .style('font-family', "'DM Mono', monospace")
    .style('font-size', '0.72rem')
    .style('fill', d => d.color)
    .text(d => `₹${d.price}/100g${d.note ? '  ' + d.note : ''}`);
}

// ── LOTUS BAKERIES REVENUE CHART ──────────────────────────────
function buildRevenueChart() {
  const el = document.getElementById('revenue-chart');
  if (!el || el.dataset.built) return;
  el.dataset.built = '1';

  // Source: Lotus Bakeries Annual Reports. Biscoff ~56% of branded revenue.
  const data = [
    { year: 2019, total: 672,  biscoff: 340 },
    { year: 2020, total: 668,  biscoff: 348 },
    { year: 2021, total: 755,  biscoff: 398 },
    { year: 2022, total: 905,  biscoff: 468 },
    { year: 2023, total: 1063, biscoff: 510 },
    { year: 2024, total: 1228, biscoff: 614 },
    { year: 2025, total: 1370, biscoff: 710, proj: true },
    { year: 2026, total: 1520, biscoff: 800, proj: true },
  ];

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const svgW   = Math.max(el.parentElement.clientWidth - 90, 300);
  const w      = svgW - margin.left - margin.right;
  const h      = 280;

  const svg = d3.select(el).append('svg')
    .attr('width', '100%').attr('height', h + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${svgW} ${h + margin.top + margin.bottom}`)
    .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x    = d3.scaleLinear().domain([2019, 2026]).range([0, w]);
  const yMax = d3.scaleLinear().domain([0, 1700]).range([h, 0]);

  // Projection zone
  const dealX = x(2024.45);
  svg.append('rect')
    .attr('x', dealX).attr('y', 0)
    .attr('width', x(2026) - dealX).attr('height', h)
    .attr('fill', 'rgba(201,151,44,0.045)');
  svg.append('line')
    .attr('x1', dealX).attr('x2', dealX)
    .attr('y1', 0).attr('y2', h)
    .attr('stroke', C.amber).attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,3').attr('opacity', 0.5);
  svg.append('text')
    .attr('x', dealX + 7).attr('y', 16)
    .style('font-family', "'DM Mono', monospace")
    .style('font-size', '0.6rem').style('fill', C.amber)
    .text('Deal signed →');

  // Grid
  svg.append('g').attr('class', 'grid')
    .call(d3.axisLeft(yMax).ticks(5).tickSize(-w).tickFormat(''));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d => d));
  svg.append('g').attr('class', 'axis')
    .call(d3.axisLeft(yMax).ticks(5).tickFormat(d => `€${d}M`));

  // Area — total
  const areaTotal = d3.area().x(d => x(d.year)).y0(h).y1(d => yMax(d.total)).curve(d3.curveMonotoneX);
  svg.append('path').datum(data).attr('fill', `${C.amber}18`).attr('d', areaTotal);

  // Line — total
  const lineTotal = d3.line().x(d => x(d.year)).y(d => yMax(d.total)).curve(d3.curveMonotoneX);
  const pathTotal = svg.append('path').datum(data)
    .attr('fill', 'none').attr('stroke', C.amber).attr('stroke-width', 2.5).attr('d', lineTotal);
  const lenT = pathTotal.node().getTotalLength();
  pathTotal.attr('stroke-dasharray', lenT).attr('stroke-dashoffset', lenT)
    .transition().duration(1400).attr('stroke-dashoffset', 0);

  // Line — Biscoff share
  const lineBiscoff = d3.line().x(d => x(d.year)).y(d => yMax(d.biscoff)).curve(d3.curveMonotoneX);
  const pathB = svg.append('path').datum(data)
    .attr('fill', 'none').attr('stroke', C.amber).attr('stroke-width', 2)
    .attr('stroke-dasharray', '6,3').attr('d', lineBiscoff);
  const lenB = pathB.node().getTotalLength();
  pathB.attr('stroke-dashoffset', lenB)
    .transition().duration(1400).delay(200).attr('stroke-dashoffset', 0);

  // Dots — total
  svg.selectAll('.dot-t').data(data).enter().append('circle')
    .attr('cx', d => x(d.year)).attr('cy', d => yMax(d.total))
    .attr('r', 4).attr('fill', C.amber).attr('stroke', '#FAFAF5').attr('stroke-width', 1.5)
    .style('opacity', d => d.proj ? 0.5 : 1);

  // Annotation: India launch
  const indiaX = x(2025.8);
  svg.append('circle').attr('cx', x(2025)).attr('cy', yMax(1370)).attr('r', 6)
    .attr('fill', 'none').attr('stroke', C.amberLight).attr('stroke-width', 1.5);
  svg.append('text')
    .attr('x', x(2025) + 10).attr('y', yMax(1370) - 10)
    .style('font-family', "'DM Mono', monospace").style('font-size', '0.6rem')
    .style('fill', C.amberLight).text('India launch');

  // Legend
  const leg = svg.append('g').attr('transform', `translate(${w - 190}, 0)`);
  [
    { label: 'Total Revenue', color: C.amber, dash: false },
    { label: 'Biscoff Revenue (~56%)', color: C.amber, dash: true },
  ].forEach((l, i) => {
    const row = leg.append('g').attr('transform', `translate(0,${i * 22})`);
    row.append('line').attr('x1', 0).attr('y1', -4).attr('x2', 18).attr('y2', -4)
      .attr('stroke', l.color).attr('stroke-width', l.dash ? 2 : 2.5)
      .attr('stroke-dasharray', l.dash ? '5,2' : 'none');
    row.append('text').attr('x', 24).attr('y', 0)
      .style('font-family', "'DM Mono', monospace").style('font-size', '0.62rem')
      .style('fill', C.onDarkSoft).text(l.label);
  });
}

// ── SPEED CHART ────────────────────────────────────────────────
function buildSpeedChart() {
  const el = document.getElementById('speed-chart');
  if (!el || el.dataset.built) return;
  el.dataset.built = '1';

  const data = [
    { label: 'Industry Standard NPD', weeks: 62, color: C.inkSoft },
    { label: 'Cadbury × Biscoff Bar', weeks: 3,  color: C.amber, highlight: true },
  ];

  const margin = { top: 10, right: 80, bottom: 42, left: 190 };
  const svgW   = Math.max(el.parentElement.clientWidth - 90, 300);
  const w      = svgW - margin.left - margin.right;
  const h      = data.length * 52;

  const svg = d3.select(el).append('svg')
    .attr('width', '100%').attr('height', h + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${svgW} ${h + margin.top + margin.bottom}`)
    .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 70]).range([0, w]);
  const y = d3.scaleBand().domain(data.map(d => d.label)).range([0, h]).padding(0.4);

  svg.append('g').attr('class', 'grid')
    .call(d3.axisTop(x).ticks(5).tickSize(-h).tickFormat(''));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => `${d}w`));
  svg.append('g').attr('class', 'axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();

  svg.selectAll('.bar').data(data).enter().append('rect')
    .attr('class', 'bar').attr('y', d => y(d.label))
    .attr('height', y.bandwidth()).attr('x', 0).attr('width', 0)
    .attr('fill', d => d.color).attr('rx', 2)
    .transition().duration(1000).delay((d, i) => i * 200).attr('width', d => x(d.weeks));

  svg.selectAll('.bar-lbl').data(data).enter().append('text')
    .attr('class', 'bar-lbl')
    .attr('y', d => y(d.label) + y.bandwidth() / 2 + 5)
    .attr('x', d => x(d.weeks) + 8)
    .style('font-family', "'DM Mono', monospace").style('font-size', '0.78rem')
    .style('font-weight', '500').style('fill', d => d.color)
    .text(d => `${d.weeks} weeks`);
}

// ── CVD RISK CHART ─────────────────────────────────────────────
function buildCvdChart() {
  const el = document.getElementById('cvd-chart');
  if (!el || el.dataset.built) return;
  el.dataset.built = '1';

  const data = [
    { region: 'High-income\ncountries', risk: 19, color: '#4A9A70' },
    { region: 'Middle-income\ncountries', risk: 44, color: C.amber },
    { region: 'India', risk: 68, color: C.red },
  ];

  const margin = { top: 16, right: 20, bottom: 50, left: 50 };
  const svgW   = Math.max(el.parentElement.clientWidth - 90, 240);
  const w      = svgW - margin.left - margin.right;
  const h      = 220;

  const svg = d3.select(el).append('svg')
    .attr('width', '100%').attr('height', h + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${svgW} ${h + margin.top + margin.bottom}`)
    .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(data.map(d => d.region)).range([0, w]).padding(0.38);
  const y = d3.scaleLinear().domain([0, 80]).range([h, 0]);

  svg.append('g').attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat(''));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x));
  svg.append('g').attr('class', 'axis').call(d3.axisLeft(y).ticks(4));

  svg.selectAll('.bar').data(data).enter().append('rect')
    .attr('x', d => x(d.region)).attr('width', x.bandwidth())
    .attr('y', h).attr('height', 0).attr('fill', d => d.color).attr('rx', 2)
    .transition().duration(900).delay((d, i) => i * 180)
    .attr('y', d => y(d.risk)).attr('height', d => h - y(d.risk));

  svg.selectAll('.val-lbl').data(data).enter().append('text')
    .attr('x', d => x(d.region) + x.bandwidth() / 2)
    .attr('y', d => y(d.risk) - 7).attr('text-anchor', 'middle')
    .style('font-family', "'DM Mono', monospace")
    .style('font-size', '0.82rem').style('font-weight', '500')
    .style('fill', d => d.color).text(d => d.risk);
}

// ── FAT CHART ──────────────────────────────────────────────────
function buildFatChart() {
  const el = document.getElementById('fat-chart');
  if (!el || el.dataset.built) return;
  el.dataset.built = '1';

  const data = [
    { oil: 'Rapeseed (EU Biscoff)', sat: 7,  color: '#3A8A60' },
    { oil: 'Sunflower oil',         sat: 11, color: '#5A9A50' },
    { oil: 'Olive oil',             sat: 14, color: '#7AAA48' },
    { oil: 'Palm oil (IN Biscoff)', sat: 50, color: C.red },
    { oil: 'Butter (ref.)',         sat: 51, color: '#A07060' },
  ];

  const margin = { top: 16, right: 48, bottom: 40, left: 155 };
  const svgW   = Math.max(el.parentElement.clientWidth - 90, 240);
  const w      = svgW - margin.left - margin.right;
  const h      = data.length * 40;

  const svg = d3.select(el).append('svg')
    .attr('width', '100%').attr('height', h + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${svgW} ${h + margin.top + margin.bottom}`)
    .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand().domain(data.map(d => d.oil)).range([0, h]).padding(0.32);
  const x = d3.scaleLinear().domain([0, 60]).range([0, w]);

  svg.append('g').attr('class', 'grid')
    .call(d3.axisTop(x).ticks(4).tickSize(-h).tickFormat(''));
  svg.append('g').attr('class', 'axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(4).tickFormat(d => `${d}%`));

  svg.selectAll('.bar').data(data).enter().append('rect')
    .attr('y', d => y(d.oil)).attr('height', y.bandwidth())
    .attr('x', 0).attr('width', 0).attr('fill', d => d.color).attr('rx', 2)
    .transition().duration(900).delay((d, i) => i * 110).attr('width', d => x(d.sat));

  svg.selectAll('.val-lbl').data(data).enter().append('text')
    .attr('y', d => y(d.oil) + y.bandwidth() / 2 + 4)
    .attr('x', d => x(d.sat) + 6)
    .style('font-family', "'DM Mono', monospace")
    .style('font-size', '0.7rem').style('fill', d => d.color)
    .text(d => `${d.sat}%`);
}

// ── MARKET SHARE CHART ─────────────────────────────────────────
function buildMarketChart() {
  const el = document.getElementById('market-chart');
  if (!el || el.dataset.built) return;
  el.dataset.built = '1';

  const data = [
    { label: 'Parle',                          share: 32, color: '#5A6A7A' },
    { label: 'Britannia',                      share: 24, color: '#4A5A6A' },
    { label: 'ITC Sunfeast',                   share: 16, color: '#6A7A6A' },
    { label: 'Mondelēz (Oreo + others)',        share: 8,  color: '#5B3FA0' },
    { label: 'Others/Regional',                share: 17, color: '#8090A0' },
    { label: 'Biscoff/MDLZ Premium (proj.)',   share: 3,  color: C.amber, highlight: true },
  ];

  const svgW = Math.max(el.parentElement.clientWidth - 90, 300);
  const h    = 320;
  const cx   = Math.min(svgW * 0.35, 220);
  const cy   = h / 2;
  const r    = Math.min(cy - 30, 130);

  const svg = d3.select(el).append('svg')
    .attr('width', '100%').attr('height', h)
    .attr('viewBox', `0 0 ${svgW} ${h}`);

  const pie = d3.pie().value(d => d.share).sort(null);
  const arc = d3.arc().innerRadius(r * 0.56).outerRadius(r);
  const arcH = d3.arc().innerRadius(r * 0.53).outerRadius(r + 9);

  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

  g.selectAll('path').data(pie(data)).enter().append('path')
    .attr('d', arc).attr('fill', d => d.data.color)
    .attr('stroke', C.cream).attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function() { d3.select(this).transition().duration(140).attr('d', arcH); })
    .on('mouseout',  function() { d3.select(this).transition().duration(140).attr('d', arc); });

  // Centre
  g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.2em')
    .style('font-family', "'Cormorant Garamond', serif").style('font-size', '1.7rem')
    .style('font-weight', '700').style('fill', C.ink).text('$13.5B');
  g.append('text').attr('text-anchor', 'middle').attr('dy', '1.4em')
    .style('font-family', "'DM Mono', monospace").style('font-size', '0.58rem')
    .style('fill', C.inkSoft).text('Market (2025)');

  // Legend
  const legX = cx + r + 40;
  const legG = svg.append('g').attr('transform', `translate(${legX}, ${cy - data.length * 22})`);
  data.forEach((d, i) => {
    const row = legG.append('g').attr('transform', `translate(0, ${i * 44})`);
    row.append('rect').attr('width', 10).attr('height', 10).attr('y', -10).attr('fill', d.color).attr('rx', 1);
    row.append('text').attr('x', 18)
      .style('font-family', "'DM Mono', monospace").style('font-size', '0.65rem')
      .style('fill', d.highlight ? C.amber : C.inkSoft).text(d.label);
    row.append('text').attr('x', 18).attr('y', 16)
      .style('font-family', "'Cormorant Garamond', serif").style('font-size', '1.1rem')
      .style('font-weight', '700').style('fill', d.color).text(`${d.share}%`);
  });
}

// ── INTERSECTION OBSERVER ─────────────────────────────────────
function setupObservers() {
  // Timeline items
  const tlObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.tl-item').forEach(el => tlObs.observe(el));

  // Counters
  const ch1 = document.getElementById('ch1');
  if (ch1) {
    let fired = false;
    const cObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !fired) { fired = true; animateCounters(); }
    }, { threshold: 0.3 });
    cObs.observe(ch1);
  }

  // Charts — lazy-build on scroll
  const chartMap = {
    'price-chart':      buildPriceChart,
    'revenue-chart':    buildRevenueChart,
    'speed-chart':      buildSpeedChart,
    'cvd-chart':        buildCvdChart,
    'fat-chart':        buildFatChart,
    'market-chart':     buildMarketChart,
  };

  const chartObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fn = chartMap[e.target.id];
        if (fn) { fn(); chartObs.unobserve(e.target); }
      }
    });
  }, { threshold: 0.08 });

  Object.keys(chartMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) chartObs.observe(el);
  });
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildTimeline();
  setupObservers();
});