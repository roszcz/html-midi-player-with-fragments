import * as midiFile from "https://cdn.skypack.dev/midi-file@1.2.4";
import * as buffer from "https://cdn.skypack.dev/buffer@6.0.3";

const parseMidi = midiFile.parseMidi;
const writeMidi = midiFile.writeMidi;

const midiFileURL = './tester.mid';
const dataURL = './tester.json';

window.player = document.getElementById('myPlayer');
window.visualizer = document.getElementById('myVisualizer');

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

    const notes = parsed.tracks[0].filter(event => event.type == 'noteOn' || event.type == 'noteOff');
    fragment.tracks[0] = notes.slice(start * 2,end * 2);
        
    const output = writeMidi(fragment);
    const outputBuffer = buffer.Buffer.from(output);
    const outputBlob = new Blob([outputBuffer]);
    const outputSequence = await core.blobToNoteSequence(outputBlob);
    
    return outputSequence;
}

function updateDataStatus(fragmentIndex) {
  datastatus.innerText = `Fragments: 0 - ${data.fragments.length - 1}
Fragment[${fragmentIndex}]: 0 - ${data.fragments[fragmentIndex].length - 1}`;
}

const response = await fetch(dataURL);
const data = await response.json();
updateDataStatus(0);

window.datastatus = document.getElementById('datastatus');

const midiBuffer = await loadMidiFileBufferFromURL(midiFileURL);
updateSequence(data, midiBuffer, 0, 0, player, visualizer);

window.fragmentInput = document.getElementById('fragment');
window.phraseInput = document.getElementById('phrase');
window.loadbutton = document.getElementById('loadbutton');

loadbutton.addEventListener("click", function () {
  updateDataStatus(fragmentInput.value);
  updateSequence(data, midiBuffer, fragmentInput.value, phraseInput.value, player, visualizer);
})
