import * as buffer from "https://cdn.skypack.dev/buffer@6.0.3";
const midi = new Midi();

const midiFileURL = './tester.mid';
const dataURL = './tester.json';

window.player = document.getElementById('myPlayer');
window.visualizer = document.getElementById('myVisualizer');
visualizer.config = {minPitch: 40, maxPitch: 80};

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
  const sequenceSustained = core.sequences.applySustainControlChanges(sequence);
  visualizer.noteSequence = sequenceSustained;
  player.noteSequence = sequenceSustained;
}

async function sequenceFromFragmentIndex(data, midiFileBuffer, fragmentIndex, phraseIndex) {
  const phrase = data.fragments[fragmentIndex][phraseIndex];
  const sequence = await sliceMidiFileBufferToSequence(midiFileBuffer, phrase.start_note_index, phrase.end_note_index, phrase.start_time, phrase.finish_time)
  return sequence;
}

async function sliceMidiFileBufferToSequence(midiFileBuffer, start, end, start_time, finish_time) {
    const parsed = new Midi(midiFileBuffer);
    const fragment = parsed.clone();
    window.parsed = parsed;

    window.prevnotes = parsed.tracks[0].notes;
    const notes = parsed.tracks[0].notes.filter(note => note.time >= start_time && note.time <= finish_time);
    window.notes = notes;

    const startTick = notes[0].ticks
    notes.forEach(note => note.ticks -= startTick)
    fragment.tracks[0].notes = notes;

    const controls = parsed.tracks[0].controlChanges[64].filter(cc => cc.ticks >= startTick && cc.time <= finish_time);
    controls.forEach(cc => cc.ticks -= startTick)
    fragment.tracks[0].controlChanges[64] = controls
  console.log(controls)
  console.log('=============')
  console.log(notes)

    // // manual test of sustain
    // fragment.tracks[0].controlChanges = [];
    // fragment.tracks[0].addCC({
    //   number : 64,
    //   value : 1,
    //   time : 4.0
    // });
    // fragment.tracks[0].addCC({
    //   number : 64,
    //   value : 0,
    //   time : 12.0
    // });

    window.fragment = fragment;

    const output = fragment.toArray();
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

window.data = data;
window.midiBuffer = midiBuffer;
updateSequence(data, midiBuffer, 0, 0, player, visualizer);

window.fragmentInput = document.getElementById('fragment');
window.phraseInput = document.getElementById('phrase');
window.loadbutton = document.getElementById('loadbutton');

loadbutton.addEventListener("click", function () {
  updateDataStatus(fragmentInput.value);
  updateSequence(data, midiBuffer, fragmentInput.value, phraseInput.value, player, visualizer);
})
