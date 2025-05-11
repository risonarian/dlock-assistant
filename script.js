document.getElementById("suggestForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const genre = document.getElementById("genre").value;
  const budget = document.getElementById("budget").value;

  const response = await fetch(`/api/suggest?genre=${encodeURIComponent(genre)}&budget=${encodeURIComponent(budget)}`);
  const data = await response.json();

  const results = data.suggestions;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `<h2 style="color:#e75480;">「${genre}」のおすすめ（予算：${budget}円）</h2>`;

  results.forEach(shop => {
    const card = document.createElement("div");
    card.style.border = "2px solid #ffb6c1";
    card.style.borderRadius = "20px";
    card.style.padding = "15px";
    card.style.marginBottom = "20px";
    card.style.backgroundColor = "#fffafa";
    card.style.boxShadow = "0 8px 16px rgba(255, 182, 193, 0.3)";
    card.style.fontFamily = "'UD デジタル 教科書体 N-R', 'Yu Gothic', sans-serif";
    card.style.lineHeight = "1.8";
    card.style.transition = "transform 0.3s ease";
    card.style.transform = "scale(1)";
    card.onmouseenter = () => card.style.transform = "scale(1.02)";
    card.onmouseleave = () => card.style.transform = "scale(1)";

    card.innerHTML = `
      <p><strong>店名：</strong>${shop.name}</p>
      <p><strong>価格：</strong>${shop.price}円</p>
      <p><strong>交通手段：</strong>${shop.transport}</p>
      <p><strong>所要時間：</strong>${shop.time}</p>
      <p><strong>ひとこと：</strong>${shop.message}</p>
    `;

    resultDiv.appendChild(card);
  });
});