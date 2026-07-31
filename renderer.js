window.sf2API.onData((data) => {
  const { p1Dec, p1Pct, p2Dec, p2Pct, p2Hex } = data;

  document.getElementById('p1-text').textContent = `${p1Dec} / 144 (${p1Pct}%)`;
  document.getElementById('p1-bar').style.width = `${p1Pct}%`;

  document.getElementById('p2-text').textContent = `${p2Dec} / 144 (${p2Pct}%)`;
  document.getElementById('p2-bar').style.width = `${p2Pct}%`;

  document.getElementById('hex-text').textContent = `Value HEX: ${p2Hex}`;
});


const hitVideoP1 = document.getElementById('hitVideoP1');

window.sf2API.onShowHitP1((data) => {
 

  hitVideoP1.style.left = '0px';
  hitVideoP1.style.top = '-100px';
  hitVideoP1.style.display = 'block';
  hitVideoP1.style.zIndex = '5';
 
  

  hitVideoP1.currentTime = 0; // reinicia si ya se había reproducido
  hitVideoP1.play();


   setTimeout(() => {
    hitVideoP1.pause();
    hitVideoP1.style.display = 'none';
  }, 1000); // 1 segundo

});

hitVideoP1.addEventListener('ended', () => {
  hitVideoP1.style.display = 'none';
});




const hitVideoP2 = document.getElementById('hitVideoP2');

window.sf2API.onShowHitP2((data) => {
 

  hitVideoP2.style.right = '1px';
  hitVideoP2.style.top = '-100px';
  hitVideoP2.style.display = 'block';
  hitVideoP2.style.zIndex = '5';
 
  

  hitVideoP2.currentTime = 0; // reinicia si ya se había reproducido
  hitVideoP2.play();


   setTimeout(() => {
    hitVideoP2.pause();
    hitVideoP2.style.display = 'none';
  }, 1000); // 1 segundo

});

hitVideoP1.addEventListener('ended', () => {
  hitVideoP2.style.display = 'none';
});