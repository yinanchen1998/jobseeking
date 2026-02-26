import fetch from 'node-fetch';

export async function searchBing(query, limit = 5) {
  try {
    console.log(`[Bing] 搜索: "${query}"`);
    const url = `https://cn.bing.com/search?q=${encodeURIComponent(query)}&count=${limit}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const html = await response.text();
    const results = [];
    let start = 0;
    
    for (let i = 0; i < limit; i++) {
      const li = html.indexOf('<li class="b_algo"', start);
      if (li === -1) break;
      const liEnd = html.indexOf('</li>', li);
      const block = html.substring(li, liEnd);
      
      const href = block.indexOf('href="');
      if (href === -1) continue;
      const hrefEnd = block.indexOf('"', href + 6);
      const link = block.substring(href + 6, hrefEnd);
      
      const tit = block.indexOf('>', hrefEnd);
      const titEnd = block.indexOf('</a>', tit);
      let title = block.substring(tit + 1, titEnd).replace(/<[^>]+>/g, '').trim();
      
      if (title && link) {
        results.push({ title, link: link.startsWith('http') ? link : `https://cn.bing.com${link}`, snippet: '', source: 'bing' });
      }
      start = liEnd;
    }
    
    console.log(`[Bing] 找到 ${results.length} 个结果`);
    return results.length > 0 ? results : null;
  } catch (e) {
    console.error('[Bing] 错误:', e.message);
    return null;
  }
}
