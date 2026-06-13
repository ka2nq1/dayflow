import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

if (!File.prototype.text) {
  File.prototype.text = function text(this: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}
