// shipping/rajaongkir.service.spec.ts
import { categorizeService, normalizeEtd } from './rajaongkir.service';

describe('categorizeService', () => {
  it('JNE JTR & varian berat dikenali sebagai CARGO', () => {
    expect(categorizeService('JTR', 'JNE Trucking')).toBe('CARGO');
    expect(categorizeService('JTR<130', 'JNE Trucking')).toBe('CARGO');
    expect(categorizeService('JTR>130', 'JNE Trucking')).toBe('CARGO');
    expect(categorizeService('JTR>200', 'JNE Trucking')).toBe('CARGO');
    expect(categorizeService('CTC', 'JNE Cargo')).toBe('CARGO');
  });

  it('layanan reguler → REGULAR', () => {
    expect(categorizeService('REG', 'JNE Regular')).toBe('REGULAR');
    expect(categorizeService('CTC', 'JNE City Courier')).toBe('REGULAR');
    expect(categorizeService('OKE', 'JNE OKE')).toBe('REGULAR');
    expect(categorizeService('EZ', 'Reguler')).toBe('REGULAR');
  });

  it('layanan same-day/kilat → EXPRESS', () => {
    expect(categorizeService('YES', 'JNE YES')).toBe('EXPRESS');
    expect(categorizeService('CTCEYES', 'JNE City Courier')).toBe('EXPRESS');
    expect(categorizeService('BEST', 'Same Day')).toBe('EXPRESS');
  });

  it('layanan special → SPECIAL', () => {
    expect(categorizeService('CTCSPS', 'JNE City Courier')).toBe('SPECIAL');
    expect(categorizeService('SPS', 'Special Service')).toBe('SPECIAL');
  });
});

describe('normalizeEtd', () => {
  it('ubah "N day" jadi angka', () => {
    expect(normalizeEtd('3 day')).toBe('3');
    expect(normalizeEtd('0 day')).toBe('0');
    expect(normalizeEtd('1 day')).toBe('1');
  });
  it('pertahankan rentang', () => {
    expect(normalizeEtd('2-3')).toBe('2-3');
    expect(normalizeEtd('6-7 day')).toBe('6-7');
    expect(normalizeEtd('2-4 hari')).toBe('2-4');
  });
  it('kosong jika tidak ada', () => {
    expect(normalizeEtd('')).toBe('');
    expect(normalizeEtd(undefined as unknown as string)).toBe('');
  });
});
