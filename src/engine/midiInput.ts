type NoteCallback = (pitch: number, velocity: number, isNoteOn: boolean) => void;

let midiAccess: MIDIAccess | null = null;
let callback: NoteCallback | null = null;
let connectedDevices: string[] = [];

/**
 * Web MIDI API 초기화 및 장치 감지
 */
export async function initMidiInput(onNote: NoteCallback): Promise<string[]> {
  callback = onNote;

  if (!navigator.requestMIDIAccess) {
    console.warn('Web MIDI API not supported');
    return [];
  }

  try {
    midiAccess = await navigator.requestMIDIAccess();
    connectedDevices = [];

    midiAccess.inputs.forEach((input) => {
      connectedDevices.push(input.name ?? 'Unknown Device');
      input.onmidimessage = handleMidiMessage;
    });

    midiAccess.onstatechange = (e) => {
      const port = (e as MIDIConnectionEvent).port;
      if (port && port.type === 'input') {
        if (port.state === 'connected') {
          (port as MIDIInput).onmidimessage = handleMidiMessage;
          if (port.name && !connectedDevices.includes(port.name)) {
            connectedDevices.push(port.name);
          }
        } else {
          connectedDevices = connectedDevices.filter((n) => n !== port.name);
        }
      }
    };

    return connectedDevices;
  } catch (err) {
    console.warn('MIDI access denied:', err);
    return [];
  }
}

function handleMidiMessage(event: MIDIMessageEvent): void {
  if (!callback || !event.data) return;
  const [status, pitch, velocity] = event.data;
  const command = status & 0xf0;

  if (command === 0x90 && velocity > 0) {
    callback(pitch, velocity, true);
  } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    callback(pitch, 0, false);
  }
}

/**
 * 연결된 MIDI 장치 목록
 */
export function getConnectedDevices(): string[] {
  return [...connectedDevices];
}

/**
 * MIDI 입력 해제
 */
export function disposeMidiInput(): void {
  if (midiAccess) {
    midiAccess.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
  }
  callback = null;
  connectedDevices = [];
}
