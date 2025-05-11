import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  const body = await req.json();
  let { code } = body;

  // حذف أرقام الأسطر لو موجودة
  code = code
    .split('\n')
    .map(line => line.replace(/^ *\d+\s*\|?\s*/, ''))
    .join('\n');

  const detectedLang = detectLangFromCode(code);

  const prompt = `
لغة الكود: ${detectedLang}

معايا كود بلغة برمجة، ممكن يكون HTML أو React JSX أو JavaScript أو CSS أو غيرهم.

رجاءً:
1. حدّد بدقة نوع الكود (هل هو JSX أو HTML؟).
2. افحص الكود سطر سطر واكتشف كل الأخطاء الموجودة.
3. اشرح كل غلطة بطريقة بسيطة وسهلة.
4. لو الكود React، استخدم className و style={{}}.
5. لو HTML عادي، استخدم class و style.
6. رجّعلي الكود بعد التعديل بصيغة جاهزة للتنفيذ تمامًا بدون أي زيادات أو رموز خاطئة.
7. لو الكود React JSX، لا تستخدم style كسلسلة نصية أبدًا، واستخدم className بدل class.

الرد يكون بالشكل التالي:
❌ الخطأ: (اشرح كل خطأ بشكل واضح)
🛠 الحل: (قوللي أعمل إيه بالضبط)
✅ الكود بعد التعديل:
\`\`\`${detectedLang}
<الكود بعد التعديل>
\`\`\`

الكود:
${code}
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
        },
      }
    );

    const message = response.data.choices[0].message.content;
    return NextResponse.json({ message });
  } catch (err) {
    console.error('❌ OpenRouter Error:', err.response?.data || err.message);
    return NextResponse.json({ message: 'فشل في الاتصال بـ OpenRouter API' }, { status: 500 });
  }
}

function detectLangFromCode(code) {
  if (code.includes("className") || code.includes("style={{")) return "jsx";
  if (code.includes("<html")) return "html";
  if (code.includes("style") || code.includes("color:")) return "css";
  if (code.includes("#include") || code.includes("std::")) return "cpp";
  if (code.includes("def ") || code.includes("print(")) return "python";
  if (code.includes("public class") || code.includes("System.out")) return "java";
  if (code.includes("function") || code.includes("const") || code.includes("useState")) return "javascript";
  return "plaintext";
}