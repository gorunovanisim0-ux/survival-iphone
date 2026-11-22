const SAVE_FILE_NAME = 'savegame.json';

function getFs() {
  try {
    // eslint-disable-next-line no-eval
    return eval('require')('fs');
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const fs = getFs();
    if (fs && fs.existsSync(SAVE_FILE_NAME)) {
      const content = fs.readFileSync(SAVE_FILE_NAME, 'utf8');
      return Response.json(JSON.parse(content));
    }
  } catch {
    // ignore
  }
  return Response.json({});
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fs = getFs();
    if (fs) {
      fs.writeFileSync(SAVE_FILE_NAME, JSON.stringify(body, null, 2), 'utf8');
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
