declare namespace meSpeak {
    function loadConfig(url: string): void;
    function loadVoice(url: string): void;
    function speak(text: string, options?: SpeakOptions): ArrayBuffer | boolean;
  
    interface SpeakOptions {
      amplitude?: number;
      pitch?: number;
      speed?: number;
      voice?: string;
      wordgap?: number;
      variant?: string;
      rawdata?: 'array' | 'base64' | 'mime';
    }
  }
  
  export = meSpeak;
  