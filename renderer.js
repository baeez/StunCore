window.sf2API.onData((data) => {
  const { p1Dec, p1Pct, p2Dec, p2Pct, p2Hex } = data;

  document.getElementById('p1-text').textContent = `${p1Dec} / 144 (${p1Pct}%)`;
  document.getElementById('p1-bar').style.width = `${p1Pct}%`;

  document.getElementById('p2-text').textContent = `${p2Dec} / 144 (${p2Pct}%)`;
  document.getElementById('p2-bar').style.width = `${p2Pct}%`;

  document.getElementById('hex-text').textContent = `Value HEX: ${p2Hex}`;
});
