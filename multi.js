import * as midiFile from "https://cdn.skypack.dev/midi-file@1.2.4";
import * as buffer from "https://cdn.skypack.dev/buffer@6.0.3";

const parseMidi = midiFile.parseMidi;
const writeMidi = midiFile.writeMidi;

const midiFileURL = './recording.mid';
const dataURL = './data.json';

window.player1 = document.getElementById('myPlayer1');
window.visualizer1 = document.getElementById('myVisualizer1');

window.player2 = document.getElementById('myPlayer2');
window.visualizer2 = document.getElementById('myVisualizer2');

// Directly set player URL
// player.src = midiFileURL;
// visualizer.src = midiFileURL;

async function loadMidiFileBufferFromURL(url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const midiFileBuffer = buffer.Buffer.from(arrayBuffer);
    return midiFileBuffer;
  } catch (error) {
    console.log("error", error);
  }
}

async function updateSequence(data, midiBuffer, fragmentIndex, variantIndex, player, visualizer) {
  const sequence = await sequenceFromFragmentIndex(data, midiBuffer, fragmentIndex, variantIndex);
  player.noteSequence = sequence;
  visualizer.noteSequence = sequence;
}

async function sequenceFromFragmentIndex(data, midiFileBuffer, fragmentIndex, phraseIndex) {
  const phrase = data.fragments[fragmentIndex][phraseIndex];
  const sequence = await sliceMidiFileBufferToSequence(midiFileBuffer, phrase.start_note_index, phrase.end_note_index)
  return sequence;
}

async function sliceMidiFileBufferToSequence(midiFileBuffer, start, end) {
    const parsed = parseMidi(midiFileBuffer);
    const fragment = parseMidi(midiFileBuffer);
    window.parsed = parsed;

    fragment.tracks[0] = parsed.tracks[0].slice(start,end);
        
    const output = writeMidi(fragment);
    const outputBuffer = buffer.Buffer.from(output);
    const outputBlob = new Blob([outputBuffer]);
    const outputSequence = await core.blobToNoteSequence(outputBlob);
    
    return outputSequence;
}

const response1 = await fetch(dataURL);
const data1 = await response1.json();

const midiBuffer1 = await loadMidiFileBufferFromURL(midiFileURL);
updateSequence(data1, midiBuffer1, 0, 0, player1, visualizer1);

const response2 = await fetch(dataURL);
const data2 = await response2.json();

const midiBuffer2 = await loadMidiFileBufferFromURL(midiFileURL);
updateSequence(data2, midiBuffer2, 0, 1, player2, visualizer2);