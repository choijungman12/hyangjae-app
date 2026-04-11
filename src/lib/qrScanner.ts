/**
 * QR 코드 스캐너 유틸리티
 *
 * 브라우저 네이티브 BarcodeDetector API 사용 (Chrome/Edge/Opera 지원).
 * 지원하지 않는 브라우저에서는 수동 입력으로 대체.
 *
 * 💡 지원 브라우저:
 *   - Chrome/Edge (데스크톱·모바일) — 완전 지원
 *   - Safari iOS 17+ — 부분 지원
 *   - Firefox — 미지원 (수동 입력)
 */

// TypeScript가 BarcodeDetector 를 모르므로 수동 선언
declare global {
  interface Window {
    BarcodeDetector?: typeof BarcodeDetector;
  }
  class BarcodeDetector {
    constructor(options?: { formats?: string[] });
    detect(source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap): Promise<DetectedBarcode[]>;
    static getSupportedFormats(): Promise<string[]>;
  }
  interface DetectedBarcode {
    rawValue: string;
    format: string;
    boundingBox: DOMRectReadOnly;
  }
}

export function isQrScannerSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

/**
 * 비디오 스트림에서 QR 코드 감지 (반복 호출용)
 * 감지 성공 시 raw 문자열 반환, 실패 시 null
 */
export async function detectQrFromVideo(video: HTMLVideoElement): Promise<string | null> {
  if (!isQrScannerSupported()) return null;
  if (video.readyState < 2) return null; // HAVE_CURRENT_DATA

  try {
    const detector = new window.BarcodeDetector!({ formats: ['qr_code'] });
    const codes = await detector.detect(video);
    if (codes.length > 0) {
      return codes[0].rawValue;
    }
  } catch (err) {
    console.error('[QR Scanner] detection error:', err);
  }
  return null;
}

/**
 * 카메라 스트림 시작
 */
export async function startCameraStream(video: HTMLVideoElement): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('이 브라우저는 카메라 접근을 지원하지 않습니다.');
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function stopCameraStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach(t => t.stop());
}
