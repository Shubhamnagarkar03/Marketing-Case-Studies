/* ─────────────────────────────────────────────
   YOU CAN'T DELIVER A USER BASE
   script.js — D3 Charts + Scroll Behaviour
───────────────────────────────────────────── */

// ── PALETTE (mirrors CSS vars) ─────────────────
const C = {
  ink:          '#1A1714',
  inkMid:       '#3D3830',
  inkLight:     '#7A736A',
  inkFaint:     '#C8C0B4',
  cream:        '#F5F0E8',
  coral:        '#D94F3D',
  coralLight:   '#F2866D',
  forest:       '#2E6B4F',
  forestLight:  '#4A9970',
  slate:        '#4A6080',
  amber:        '#C47C2B',
  amberLight:   '#E8A84A',
};

const FONT_MONO = "'Fira Code', 'Courier New', monospace";

// ── TOOLTIP ────────────────────────────────────
function makeTooltip() {
  return d3.select('body').append('div').attr('class', 'd3-tooltip');
}

function showTip(tip, html, event) {
  tip.html(html).style('opacity', 1);
  moveTip(tip, event);
}

function moveTip(tip, event) {
  const [mx, my] = d3.pointer(event, document.body);
  tip.style('left', (mx + 16) + 'px').style('top', (my - 10) + 'px');
}

function hideTip(tip) {
  tip.style('opacity', 0);
}

// ── SHARED CHART SETUP ─────────────────────────
function chartDims(containerId, { marginTop=20, marginRight=60, marginBottom=40, marginLeft=52 } = {}) {
  const el = document.getElementById(containerId);
  const W = el.clientWidth || 600;
  const H = 300;
  return {
    W, H,
    innerW: W - marginLeft - marginRight,
    innerH: H - marginTop - marginBottom,
    marginTop, marginRight, marginBottom, marginLeft,
  };
}

function makeSvg(containerId, d) {
  return d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', d.W)
    .attr('height', d.H)
    .attr('viewBox', `0 0 ${d.W} ${d.H}`)
    .attr('style', 'width:100%;height:auto;overflow:visible;')
    .append('g')
    .attr('transform', `translate(${d.marginLeft},${d.marginTop})`);
}

function drawGrid(g, xScale, yScale, innerH, innerW) {
  g.append('g')
    .attr('class', 'd3-grid')
    .attr('transform', `translate(0,0)`)
    .call(
      d3.axisLeft(yScale).tickSize(-innerW).tickFormat('')
    );
}

// ──────────────────────────────────────────────
// CHART 1 — ENGAGEMENT (dual-axis line chart)
// ──────────────────────────────────────────────
function drawEngagementChart() {
  const data = [
    { year: '2019', mtu: 4,    instore: 88 },
    { year: '2020', mtu: 9,    instore: 82 },
    { year: '2021', mtu: 18,   instore: 86 },
    { year: '2022', mtu: 26,   instore: 91 },
    { year: '2023', mtu: 32,   instore: 94 },
    { year: '2024', mtu: 36,   instore: 96 },
    { year: 'FY25', mtu: 35.4, instore: 97 },
  ];

  const d = chartDims('engagement-chart-area', { marginLeft: 50, marginRight: 58 });
  const svg = makeSvg('engagement-chart-area', d);
  const tip = makeTooltip();

  const x = d3.scalePoint().domain(data.map(v => v.year)).range([0, d.innerW]).padding(0.3);
  const yMtu = d3.scaleLinear().domain([0, 45]).range([d.innerH, 0]);
  const yStore = d3.scaleLinear().domain([75, 102]).range([d.innerH, 0]);

  // grid
  svg.append('g').attr('class', 'd3-grid')
    .call(d3.axisLeft(yMtu).tickSize(-d.innerW).tickFormat('').ticks(5));

  // x axis
  svg.append('g').attr('class', 'd3-axis')
    .attr('transform', `translate(0,${d.innerH})`)
    .call(d3.axisBottom(x));

  // y left
  svg.append('g').attr('class', 'd3-axis')
    .call(d3.axisLeft(yMtu).ticks(5).tickFormat(v => v + 'M'));

  // y right
  svg.append('g').attr('class', 'd3-axis')
    .attr('transform', `translate(${d.innerW},0)`)
    .call(d3.axisRight(yStore).ticks(5).tickFormat(v => v + 'Cr'));

  // y labels
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -42).attr('x', -d.innerH / 2)
    .attr('text-anchor', 'middle')
    .style('fill', C.coral).style('font-family', FONT_MONO).style('font-size', '9px')
    .text('App MTU (Millions)');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', d.innerW + 50).attr('x', -d.innerH / 2)
    .attr('text-anchor', 'middle')
    .style('fill', C.amber).style('font-family', FONT_MONO).style('font-size', '9px')
    .text('In-Store Shoppers (Crores)');

  // area under instore line
  const areaStore = d3.area()
    .x(v => x(v.year))
    .y0(d.innerH)
    .y1(v => yStore(v.instore))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(data)
    .attr('fill', C.amber)
    .attr('opacity', 0.08)
    .attr('d', areaStore);

  // line: in-store
  const lineStore = d3.line()
    .x(v => x(v.year)).y(v => yStore(v.instore))
    .curve(d3.curveMonotoneX);

  const pathStore = svg.append('path')
    .datum(data).attr('fill', 'none')
    .attr('stroke', C.amber).attr('stroke-width', 2.5)
    .attr('d', lineStore);

  animatePath(pathStore);

  // area under mtu line
  const areaMtu = d3.area()
    .x(v => x(v.year))
    .y0(d.innerH)
    .y1(v => yMtu(v.mtu))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(data)
    .attr('fill', C.coral)
    .attr('opacity', 0.07)
    .attr('d', areaMtu);

  // line: app mtu
  const lineMtu = d3.line()
    .x(v => x(v.year)).y(v => yMtu(v.mtu))
    .curve(d3.curveMonotoneX);

  const pathMtu = svg.append('path')
    .datum(data).attr('fill', 'none')
    .attr('stroke', C.coral).attr('stroke-width', 2.5)
    .attr('d', lineMtu);

  animatePath(pathMtu);

  // dots + hover
  data.forEach(v => {
    svg.append('circle')
      .attr('cx', x(v.year)).attr('cy', yMtu(v.mtu))
      .attr('r', 4).attr('fill', C.coral).attr('stroke', C.cream).attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', (e) => showTip(tip, `<b>${v.year}</b><br>App MTU: <b style="color:${C.coralLight}">${v.mtu}M</b>`, e))
      .on('mousemove', (e) => moveTip(tip, e))
      .on('mouseout', () => hideTip(tip));

    svg.append('circle')
      .attr('cx', x(v.year)).attr('cy', yStore(v.instore))
      .attr('r', 4).attr('fill', C.amber).attr('stroke', C.cream).attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', (e) => showTip(tip, `<b>${v.year}</b><br>In-store: <b style="color:${C.amberLight}">${v.instore} Cr shoppers</b>`, e))
      .on('mousemove', (e) => moveTip(tip, e))
      .on('mouseout', () => hideTip(tip));
  });

  // Annotation: flatline zone
  svg.append('rect')
    .attr('x', x('2023') - 10)
    .attr('y', yMtu(38))
    .attr('width', x('FY25') - x('2023') + 20)
    .attr('height', yMtu(28) - yMtu(38))
    .attr('fill', C.coral).attr('opacity', 0.06)
    .attr('stroke', C.coral).attr('stroke-width', 1).attr('stroke-dasharray', '4,3');

  svg.append('text')
    .attr('x', x('2024')).attr('y', yMtu(38) - 8)
    .attr('text-anchor', 'middle')
    .style('fill', C.coral).style('font-family', FONT_MONO).style('font-size', '9px')
    .text('flatline zone →');

  // legend
  const lgd = document.getElementById('legend-engagement');
  lgd.innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:${C.coral}"></div>App MTU (Millions)</div>
    <div class="legend-item"><div class="legend-dot" style="background:${C.amber}"></div>In-Store Shoppers (Crores)</div>`;
}

// ──────────────────────────────────────────────
// CHART 2 — MARKET SHARE (bar + line combo)
// ──────────────────────────────────────────────
function drawMarketChart() {
  const data = [
    { year: '2018', gmv: 42,   share: 0.10 },
    { year: '2019', gmv: 101,  share: 0.20 },
    { year: '2020', gmv: 185,  share: 0.38 },
    { year: '2021', gmv: 310,  share: 0.60 },
    { year: '2022', gmv: 480,  share: 0.70 },
    { year: '2023', gmv: 720,  share: 0.75 },
    { year: '2024', gmv: 1100, share: 0.90 },
  ];

  const d = chartDims('market-chart-area', { marginLeft: 55, marginRight: 55 });
  const svg = makeSvg('market-chart-area', d);
  const tip = makeTooltip();

  const x = d3.scaleBand().domain(data.map(v => v.year)).range([0, d.innerW]).padding(0.3);
  const yGmv = d3.scaleLinear().domain([0, 1250]).range([d.innerH, 0]);
  const yShare = d3.scaleLinear().domain([0, 1.5]).range([d.innerH, 0]);

  // grid
  svg.append('g').attr('class', 'd3-grid')
    .call(d3.axisLeft(yGmv).tickSize(-d.innerW).tickFormat('').ticks(5));

  svg.append('g').attr('class', 'd3-axis')
    .attr('transform', `translate(0,${d.innerH})`)
    .call(d3.axisBottom(x));

  svg.append('g').attr('class', 'd3-axis')
    .call(d3.axisLeft(yGmv).ticks(5).tickFormat(v => '₹' + v));

  svg.append('g').attr('class', 'd3-axis')
    .attr('transform', `translate(${d.innerW},0)`)
    .call(d3.axisRight(yShare).ticks(5).tickFormat(v => v + '%'));

  // y labels
  svg.append('text')
    .attr('transform', 'rotate(-90)').attr('y', -46).attr('x', -d.innerH/2)
    .attr('text-anchor', 'middle')
    .style('fill', C.forest).style('font-family', FONT_MONO).style('font-size', '9px')
    .text('Online Grocery GMV (₹ Billion)');

  svg.append('text')
    .attr('transform', 'rotate(-90)').attr('y', d.innerW + 50).attr('x', -d.innerH/2)
    .attr('text-anchor', 'middle')
    .style('fill', C.slate).style('font-family', FONT_MONO).style('font-size', '9px')
    .text('Online Share of Total Grocery (%)');

  // bars
  svg.selectAll('.bar-gmv')
    .data(data).enter()
    .append('rect')
    .attr('class', 'bar-gmv')
    .attr('x', v => x(v.year))
    .attr('y', d.innerH)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .attr('fill', v => v.year >= '2021' ? C.forest : C.forestLight)
    .attr('opacity', 0.8)
    .style('cursor', 'pointer')
    .on('mouseover', function(e, v) {
      d3.select(this).attr('opacity', 1);
      showTip(tip, `<b>${v.year}</b><br>GMV: <b style="color:${C.forestLight}">₹${v.gmv}B</b><br>Market share: <b>${v.share}%</b>`, e);
    })
    .on('mousemove', (e) => moveTip(tip, e))
    .on('mouseout', function() { d3.select(this).attr('opacity', 0.8); hideTip(tip); })
    .transition().duration(800).delay((_, i) => i * 80)
    .attr('y', v => yGmv(v.gmv))
    .attr('height', v => d.innerH - yGmv(v.gmv));

  // line: share %
  const lineShare = d3.line()
    .x(v => x(v.year) + x.bandwidth() / 2)
    .y(v => yShare(v.share))
    .curve(d3.curveMonotoneX);

  const pathShare = svg.append('path')
    .datum(data).attr('fill', 'none')
    .attr('stroke', C.coral).attr('stroke-width', 2.5)
    .attr('stroke-dasharray', '6,3')
    .attr('d', lineShare);

  animatePath(pathShare);

  data.forEach(v => {
    svg.append('circle')
      .attr('cx', x(v.year) + x.bandwidth() / 2)
      .attr('cy', yShare(v.share))
      .attr('r', 4).attr('fill', C.coral).attr('stroke', C.cream).attr('stroke-width', 1.5);
  });

  // "Under 1%" annotation line
  const y1pct = yShare(1);
  svg.append('line')
    .attr('x1', 0).attr('x2', d.innerW)
    .attr('y1', y1pct).attr('y2', y1pct)
    .attr('stroke', C.coral).attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,4').attr('opacity', 0.5);

  svg.append('text')
    .attr('x', d.innerW - 4).attr('y', y1pct - 5)
    .attr('text-anchor', 'end')
    .style('fill', C.coral).style('font-family', FONT_MONO).style('font-size', '9px')
    .text('1% ceiling');

  const lgd = document.getElementById('legend-market');
  lgd.innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:${C.forest}"></div>Online GMV (₹B)</div>
    <div class="legend-item"><div class="legend-line" style="background:${C.coral};border-top:2px dashed ${C.coral}"></div>Market Share %</div>`;
}

// ──────────────────────────────────────────────
// CHART 3 — FEE BREAKDOWN (grouped/stacked bar)
// ──────────────────────────────────────────────
function drawFeesChart() {
  const platforms = ['Zepto', 'Blinkit', 'Instamart', 'Kirana'];
  const feeTypes  = ['Delivery', 'Small Cart', 'Handling'];
  const feeData   = {
    Zepto:    { Delivery: 30, 'Small Cart': 0,  Handling: 0   },
    Blinkit:  { Delivery: 30, 'Small Cart': 20, Handling: 4   },
    Instamart:{ Delivery: 30, 'Small Cart': 15, Handling: 9.8 },
    Kirana:   { Delivery: 0,  'Small Cart': 0,  Handling: 0   },
  };

  const colors = {
    Delivery:     C.forest,
    'Small Cart': C.coral,
    Handling:     C.amber,
  };

  const stackData = platforms.map(p => {
    const row = { platform: p };
    let cumul = 0;
    feeTypes.forEach(ft => {
      row[ft + '_start'] = cumul;
      cumul += feeData[p][ft];
      row[ft + '_end'] = cumul;
      row[ft] = feeData[p][ft];
    });
    row.total = cumul;
    return row;
  });

  const d = chartDims('fees-chart-area', { marginLeft: 70, marginRight: 40, marginBottom: 44 });
  const svg = makeSvg('fees-chart-area', d);
  const tip = makeTooltip();

  const x = d3.scaleBand().domain(platforms).range([0, d.innerW]).padding(0.32);
  const y = d3.scaleLinear().domain([0, 80]).range([d.innerH, 0]);

  // grid
  svg.append('g').attr('class', 'd3-grid')
    .call(d3.axisLeft(y).tickSize(-d.innerW).tickFormat('').ticks(5));

  svg.append('g').attr('class', 'd3-axis')
    .attr('transform', `translate(0,${d.innerH})`)
    .call(d3.axisBottom(x));

  svg.append('g').attr('class', 'd3-axis')
    .call(d3.axisLeft(y).ticks(5).tickFormat(v => '₹' + v));

  // "item price" baseline annotation
  svg.append('line')
    .attr('x1', 0).attr('x2', d.innerW)
    .attr('y1', y(29)).attr('y2', y(29))
    .attr('stroke', C.inkMid).attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,3').attr('opacity', 0.5);

  svg.append('text')
    .attr('x', 4).attr('y', y(29) - 5)
    .style('fill', C.inkLight).style('font-family', FONT_MONO).style('font-size', '9px')
    .text('item = ₹29');

  // stacked segments
  feeTypes.forEach(ft => {
    svg.selectAll(`.seg-${ft.replace(' ','-')}`)
      .data(stackData).enter()
      .append('rect')
      .attr('x', v => x(v.platform))
      .attr('y', d.innerH)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', colors[ft])
      .attr('opacity', ft === 'Small Cart' ? 1 : 0.75)
      .style('cursor', 'pointer')
      .on('mouseover', function(e, v) {
        d3.select(this).attr('opacity', 1);
        showTip(tip,
          `<b>${v.platform}</b><br>${ft}: <b style="color:${colors[ft]}">₹${v[ft]}</b><br>Total extra: <b>₹${v.total}</b>`, e);
      })
      .on('mousemove', (e) => moveTip(tip, e))
      .on('mouseout', function(e, v) {
        d3.select(this).attr('opacity', ft === 'Small Cart' ? 1 : 0.75);
        hideTip(tip);
      })
      .transition().duration(700).delay((_, i) => i * 90 + feeTypes.indexOf(ft) * 40)
      .attr('y', v => y(v[ft + '_end']))
      .attr('height', v => y(v[ft + '_start']) - y(v[ft + '_end']));
  });

  // total label above each bar
  setTimeout(() => {
    stackData.forEach(v => {
      const label = v.platform === 'Kirana' ? '₹0 extra' : `+₹${v.total}`;
      svg.append('text')
        .attr('x', x(v.platform) + x.bandwidth() / 2)
        .attr('y', y(v.total) - 7)
        .attr('text-anchor', 'middle')
        .style('fill', v.platform === 'Kirana' ? C.forest : C.coral)
        .style('font-family', FONT_MONO).style('font-size', '10.5px').style('font-weight', '500')
        .style('opacity', 0)
        .text(label)
        .transition().duration(400)
        .style('opacity', 1);
    });
  }, 900);

  const lgd = document.getElementById('legend-fees');
  lgd.innerHTML = feeTypes.map(ft =>
    `<div class="legend-item"><div class="legend-dot" style="background:${colors[ft]}"></div>${ft} Fee</div>`
  ).join('') + `<div class="legend-item"><div class="legend-dot" style="background:${C.inkFaint}"></div>Kirana = ₹0</div>`;
}

// ──────────────────────────────────────────────
// CHART 4 — HEALTH (horizontal grouped bar)
// ──────────────────────────────────────────────
function drawHealthChart() {
  const metrics = [
    { label: 'Sedentary Habit Link',  high: 81, low: 28 },
    { label: 'Overeating Pattern',    high: 74, low: 30 },
    { label: 'Obesity Prevalence',    high: 46, low: 31 },
    { label: 'Stress-Eating',         high: 48, low: 22 },
    { label: 'Social Isolation',      high: 60, low: 18 },
    { label: 'Junk Food Preference',  high: 65, low: 30 },
  ];

  const d = chartDims('health-chart-area', {
    marginLeft: 160, marginRight: 50, marginTop: 16, marginBottom: 40
  });
  const svg = makeSvg('health-chart-area', d);
  const tip = makeTooltip();

  const yOuter = d3.scaleBand().domain(metrics.map(m => m.label)).range([0, d.innerH]).padding(0.28);
  const yInner = d3.scaleBand().domain(['high', 'low']).range([0, yOuter.bandwidth()]).padding(0.1);
  const x = d3.scaleLinear().domain([0, 95]).range([0, d.innerW]);

  // grid
  svg.append('g').attr('class', 'd3-grid')
    .call(d3.axisBottom(x).tickSize(d.innerH).tickFormat('').ticks(5))
    .attr('transform', 'translate(0,0)');

  svg.append('g').attr('class', 'd3-axis')
    .attr('transform', `translate(0,${d.innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(v => v + '%'));

  svg.append('g').attr('class', 'd3-axis')
    .call(d3.axisLeft(yOuter).tickSize(0).tickPadding(10));

  // bars
  ['high', 'low'].forEach((key, ki) => {
    const col = key === 'high' ? C.coral : C.forest;

    svg.selectAll(`.bar-health-${key}`)
      .data(metrics).enter()
      .append('rect')
      .attr('y', m => yOuter(m.label) + yInner(key))
      .attr('x', 0)
      .attr('height', yInner.bandwidth())
      .attr('width', 0)
      .attr('fill', col)
      .attr('opacity', 0.85)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(e, m) {
        d3.select(this).attr('opacity', 1);
        const grp = key === 'high' ? 'High-Freq App Users' : 'Low-Freq / In-Store';
        showTip(tip, `<b>${m.label}</b><br>${grp}: <b style="color:${col}">${m[key]}%</b>`, e);
      })
      .on('mousemove', (e) => moveTip(tip, e))
      .on('mouseout', function() { d3.select(this).attr('opacity', 0.85); hideTip(tip); })
      .transition().duration(750).delay((_, i) => i * 60 + ki * 140)
      .attr('width', m => x(m[key]));

    // value labels
    setTimeout(() => {
      svg.selectAll(`.val-${key}`)
        .data(metrics).enter()
        .append('text')
        .attr('y', m => yOuter(m.label) + yInner(key) + yInner.bandwidth() / 2 + 4)
        .attr('x', m => x(m[key]) + 5)
        .style('fill', col)
        .style('font-family', FONT_MONO).style('font-size', '10px').style('font-weight', '500')
        .style('opacity', 0)
        .text(m => m[key] + '%')
        .transition().duration(300)
        .style('opacity', 1);
    }, 800 + ki * 140);
  });

  const lgd = document.getElementById('legend-health');
  lgd.innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:${C.coral}"></div>High-Freq App Users</div>
    <div class="legend-item"><div class="legend-dot" style="background:${C.forest}"></div>Low-Freq / In-Store Buyers</div>`;
}

// ── PATH ANIMATION HELPER ──────────────────────
function animatePath(path) {
  const len = path.node().getTotalLength();
  path.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
    .transition().duration(1000).attr('stroke-dashoffset', 0);
}

// ── SCROLL OBSERVER (sections + nav) ──────────
function initScroll() {
  const nav = document.getElementById('stickyNav');
  const hero = document.getElementById('hero');

  // Show nav after hero
  const heroObs = new IntersectionObserver(
    ([entry]) => nav.classList.toggle('visible', !entry.isIntersecting),
    { threshold: 0.1 }
  );
  heroObs.observe(hero);

  // Section reveal
  const sections = document.querySelectorAll('.study-section');
  const sectionObs = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }),
    { threshold: 0.12 }
  );
  sections.forEach(s => sectionObs.observe(s));

  // Active nav link
  const navLinks = document.querySelectorAll('.nav-link');
  const allSections = document.querySelectorAll('[id^="section-"]');
  const navObs = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id').replace('section-', '');
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('data-section') === id);
        });
      }
    }),
    { threshold: 0.4 }
  );
  allSections.forEach(s => navObs.observe(s));
}

// ── CHART LAZY DRAW (only when visible) ───────
function initCharts() {
  const drawn = { engagement: false, market: false, fees: false, health: false };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      if (id === 'section-engagement' && !drawn.engagement) {
        drawEngagementChart(); drawn.engagement = true;
      } else if (id === 'section-market' && !drawn.market) {
        drawMarketChart(); drawn.market = true;
      } else if (id === 'section-fees' && !drawn.fees) {
        drawFeesChart(); drawn.fees = true;
      } else if (id === 'section-health' && !drawn.health) {
        drawHealthChart(); drawn.health = true;
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.study-section[id]').forEach(s => obs.observe(s));
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScroll();
  initCharts();
});