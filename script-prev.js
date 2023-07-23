import * as midiFile from "https://cdn.skypack.dev/midi-file@1.2.4";
import * as buffer from "https://cdn.skypack.dev/buffer@6.0.3";

const parseMidi = midiFile.parseMidi;
const writeMidi = midiFile.writeMidi;

const midiFileURL = './recording.mid';
const dataURL = './data.json';

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
  console.log(phrase)
  console.log("============")
  const sequence = await sliceMidiFileBufferToSequence(midiFileBuffer, phrase.start_time, phrase.finish_time)
  return sequence;
}

async function sliceMidiFileBufferToSequence(midiFileBuffer, start_time, finish_time) {
  const parsed = parseMidi(midiFileBuffer);
  const fragment = parseMidi(midiFileBuffer);
  window.parsed = parsed;

  const magic_factor = 2 * parsed.header.ticksPerBeat;

  let events = parsed.tracks[0]
  let totalTime = 0;
  events = events.map(event => {
    totalTime += event.deltaTime / magic_factor;
    return {...event, totalTime};
  });

  // const notes = parsed.tracks[0].filter(event => event.type == 'noteOn' || event.type == 'noteOff');
  // const notes = events.filter(event => event.type == 'noteOn' || event.type == 'noteOff');
  // const fragment_notes = notes.slice(start_index * 2,end_index * 2);

  const fragment_notes = events.filter(event => event.totalTime >= start_time && event.totalTime <= finish_time);
  fragment.tracks[0] = fragment_notes

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
