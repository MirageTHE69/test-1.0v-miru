import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

interface ParsedContact {
  name: string;
  email: string;
}

function extractContactsFromText(raw: string): ParsedContact[] {
  const results: ParsedContact[] = [];
  const lines = raw.split(/[\r\n,;]+/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Match: "Full Name <email@example.com>" format
    const angleMatch = line.match(/^(.+?)\s*<([^>]+@[^>]+)>$/);
    if (angleMatch) {
      results.push({ name: angleMatch[1].trim(), email: angleMatch[2].trim() });
      continue;
    }

    // Plain email only
    const emailMatch = line.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    if (emailMatch) {
      const email = line.trim();
      results.push({ name: email.split('@')[0], email });
      continue;
    }
  }

  return results;
}

function extractContactsFromCsv(buffer: Buffer): ParsedContact[] {
  const text = buffer.toString('utf-8');
  
  let records: Record<string, string>[];
  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch {
    // Try without headers — assume col0=name, col1=email or col0=email
    const rawRecords: string[][] = parse(text, {
      columns: false,
      skip_empty_lines: true,
      trim: true,
    });
    return rawRecords
      .slice(1) // skip first row (assumed header)
      .map((row: string[]) => {
        if (row.length >= 2) {
          const [a, b] = row;
          // Determine which column is email
          const aIsEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a);
          return aIsEmail ? { name: b || a.split('@')[0], email: a } : { name: a, email: b };
        }
        if (row.length === 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row[0])) {
          return { name: row[0].split('@')[0], email: row[0] };
        }
        return null;
      })
      .filter(Boolean) as ParsedContact[];
  }

  return records.map((row) => {
    // Find email column (case-insensitive)
    const emailKey = Object.keys(row).find((k) => /email/i.test(k) || /^e-?mail/i.test(k)) || '';
    const nameKey = Object.keys(row).find((k) => /name/i.test(k)) || '';
    const email = (row[emailKey] || '').trim();
    const name = (row[nameKey] || email.split('@')[0]).trim();
    return email ? { name, email } : null;
  }).filter(Boolean) as ParsedContact[];
}

// POST /api/campaigns/email/parse-contacts
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  let contacts: ParsedContact[] = [];

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
      contacts = extractContactsFromCsv(buffer);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Dynamic import xlsx to avoid bundling issues
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

      contacts = rows.map((row) => {
        const emailKey = Object.keys(row).find((k) => /email/i.test(k)) || '';
        const nameKey = Object.keys(row).find((k) => /name/i.test(k)) || '';
        const email = String(row[emailKey] || '').trim();
        const name = String(row[nameKey] || email.split('@')[0]).trim();
        return email ? { name, email } : null;
      }).filter(Boolean) as ParsedContact[];
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use .csv, .xlsx, or .txt' }, { status: 400 });
    }
  } else {
    // JSON body with rawText field
    const body = await req.json();
    if (body.rawText) {
      contacts = extractContactsFromText(body.rawText);
    }
  }

  // Validate and filter contacts
  const valid = contacts.filter((c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
  const invalid = contacts.length - valid.length;

  return NextResponse.json({ contacts: valid, total: valid.length, invalidSkipped: invalid });
}
